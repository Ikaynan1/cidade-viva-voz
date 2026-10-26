// Importa dados oficiais do TSE (Dados Abertos / CKAN + CDN) e do IBGE (API de Localidades).
// Acesso: somente administradores (JWT com papel admin), service role, ou agendamento gerenciado.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";

const CKAN = "https://dadosabertos.tse.jus.br/api/3/action/package_show?id=";
const IBGE = "https://servicodados.ibge.gov.br/api/v1/localidades";
const UA = { "User-Agent": "CidadeVivaVoz/1.0 (dados abertos)" };

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("ibge"), uf: z.string().length(2) }),
  z.object({
    action: z.literal("tse_municipal"),
    year: z.number().int().min(2000).max(2100),
    uf: z.string().length(2),
    tse_code: z.string().regex(/^\d{5}$/),
    offices: z.array(z.number().int()).default([11, 12, 13]),
  }),
]);

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// ---------- ZIP remoto com HTTP Range (sem baixar o arquivo inteiro) ----------
async function range(url: string, a: number, b: number) {
  const r = await fetch(url, { headers: { ...UA, Range: `bytes=${a}-${b}` } });
  if (r.status !== 206 && r.status !== 200) throw new Error(`HTTP ${r.status} em ${url}`);
  return new Uint8Array(await r.arrayBuffer());
}
const u16 = (d: Uint8Array, o: number) => d[o] | (d[o + 1] << 8);
const u32 = (d: Uint8Array, o: number) => (d[o] | (d[o + 1] << 8) | (d[o + 2] << 16)) + d[o + 3] * 0x1000000;

async function zipMember(url: string, suffix: string): Promise<{ name: string; text: string }> {
  const head = await fetch(url, { method: "HEAD", headers: UA });
  if (!head.ok) throw new Error(`HEAD ${head.status} em ${url}`);
  const size = Number(head.headers.get("content-length"));
  const tail = await range(url, Math.max(0, size - 65557), size - 1);
  let e = -1;
  for (let i = tail.length - 22; i >= 0; i--) if (u32(tail, i) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error("ZIP inválido");
  const cdSize = u32(tail, e + 12), cdOff = u32(tail, e + 16);
  const cd = await range(url, cdOff, cdOff + cdSize - 1);
  let p = 0;
  while (p < cd.length && u32(cd, p) === 0x02014b50) {
    const method = u16(cd, p + 10), csz = u32(cd, p + 20);
    const nl = u16(cd, p + 28), el = u16(cd, p + 30), cl = u16(cd, p + 32), lo = u32(cd, p + 42);
    const name = new TextDecoder("latin1").decode(cd.slice(p + 46, p + 46 + nl));
    if (name.toUpperCase().endsWith(suffix.toUpperCase())) {
      const lh = await range(url, lo, lo + 29);
      const start = lo + 30 + u16(lh, 26) + u16(lh, 28);
      const data = await range(url, start, start + csz - 1);
      let raw: Uint8Array = data;
      if (method === 8) {
        const s = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
        raw = new Uint8Array(await new Response(s).arrayBuffer());
      }
      return { name, text: new TextDecoder("latin1").decode(raw) };
    }
    p += 46 + nl + el + cl;
  }
  throw new Error(`Arquivo *${suffix} não encontrado em ${url}`);
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const split = (l: string) => {
    const out: string[] = []; let cur = "", q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (ch === '"') { if (q && l[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (ch === ";" && !q) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur); return out;
  };
  const h = split(lines[0]);
  return lines.slice(1).map((l) => { const v = split(l); const o: Record<string, string> = {}; h.forEach((k, i) => (o[k] = v[i])); return o; });
}

// Recurso oficial confirmado via API CKAN (sem inventar URLs)
async function ckanResource(pkg: string, urlPart: string) {
  const r = await fetch(CKAN + pkg, { headers: UA });
  const j = await r.json();
  if (!j.success) throw new Error(`Pacote CKAN ${pkg} não encontrado`);
  const res = j.result.resources.find((x: { url: string }) => x.url.includes(urlPart));
  if (!res) throw new Error(`Recurso ${urlPart} não encontrado em ${pkg}`);
  return res.url as string;
}

const nul = (s?: string) => (!s || s.startsWith("#NULO") || s === "#NE" || s === "-1" ? null : s.trim());
const outcomeOf = (c: string) =>
  ({ "1": "eleito", "2": "eleito", "3": "eleito", "4": "nao_eleito", "5": "suplente", "6": "segundo_turno" } as Record<string, string>)[c] ?? "sem_resultado";
const brDate = (s: string) => { const [d, m, y] = s.split("/"); return `${y}-${m}-${d}`; };
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

// ---------- IBGE ----------
async function syncIbge(db: SupabaseClient, uf: string) {
  const est = await (await fetch(`${IBGE}/estados/${uf}`, { headers: UA })).json();
  if (!est?.id) throw new Error(`UF ${uf} não encontrada no IBGE`);
  await db.from("states").upsert({ ibge_code: est.id, uf: est.sigla, name: est.nome, source_key: "ibge_localidades", source_url: `${IBGE}/estados/${uf}`, collected_at: new Date().toISOString() }, { onConflict: "uf" });
  const muns: { id: number; nome: string }[] = await (await fetch(`${IBGE}/estados/${uf}/municipios`, { headers: UA })).json();
  const { data: local } = await db.from("municipalities").select("id,name,ibge_code").eq("uf", uf);
  let updated = 0; const conflicts: string[] = [];
  for (const m of local ?? []) {
    const hit = muns.find((x) => norm(x.nome) === norm(m.name));
    if (!hit) { conflicts.push(`${m.name}: sem correspondência no IBGE`); continue; }
    if (m.ibge_code && m.ibge_code !== hit.id) { conflicts.push(`${m.name}: código local ${m.ibge_code} ≠ IBGE ${hit.id}`); continue; }
    await db.from("municipalities").update({ ibge_code: hit.id, name: hit.nome, ibge_verified_at: new Date().toISOString(), ibge_source_url: `${IBGE}/municipios/${hit.id}`, updated_at: new Date().toISOString() }).eq("id", m.id);
    updated++;
  }
  return { read: muns.length, updated, conflicts };
}

// ---------- TSE municipal ----------
async function syncTseMunicipal(db: SupabaseClient, year: number, uf: string, tseCode: string, offices: number[]) {
  const candUrl = await ckanResource(`candidatos-${year}`, `consulta_cand_${year}.zip`);
  const votUrl = await ckanResource(`resultados-${year}`, `votacao_candidato_munzona_${year}.zip`);
  const cand = parseCsv((await zipMember(candUrl, `_${uf}.csv`)).text)
    .filter((r) => r.SG_UE === tseCode && offices.includes(Number(r.CD_CARGO)));
  if (!cand.length) throw new Error(`Nenhum candidato para SG_UE ${tseCode}`);
  const votes = new Map<string, number>();
  for (const r of parseCsv((await zipMember(votUrl, `_${uf}.csv`)).text)) {
    if (r.SG_UE !== tseCode) continue;
    const k = `${r.SQ_CANDIDATO}|${r.NR_TURNO}`;
    votes.set(k, (votes.get(k) ?? 0) + Number(r.QT_VOTOS_NOMINAIS_VALIDOS || 0));
  }

  // Município: vincula pelo código TSE; nunca presume que seja o código IBGE.
  let { data: mun } = await db.from("municipalities").select("id").eq("tse_code", tseCode).maybeSingle();
  if (!mun) {
    const ins = await db.from("municipalities").insert({ tse_code: tseCode, name: cand[0].NM_UE, uf, tse_verified_at: new Date().toISOString(), tse_source_url: candUrl }).select("id").single();
    if (ins.error) throw ins.error; mun = ins.data;
  }

  // Eleições (uma por código + turno)
  const elMap = new Map<string, string>();
  for (const r of cand) {
    const k = `${r.CD_ELEICAO}|${r.NR_TURNO}`; if (elMap.has(k)) continue;
    const { data, error } = await db.from("elections").upsert({
      source_key: "tse_cand", official_code: r.CD_ELEICAO, year, round: Number(r.NR_TURNO), description: r.DS_ELEICAO,
      election_type: r.NM_TIPO_ELEICAO, election_date: brDate(r.DT_ELEICAO), scope: "municipal",
    }, { onConflict: "source_key,official_code,round" }).select("id").single();
    if (error) throw error; elMap.set(k, data.id);
  }

  // Pessoas: identificadas pelo SQ_CANDIDATO desta eleição. Sem fusão automática entre eleições.
  const idType = `sq_candidato_${year}`;
  const sqs = [...new Set(cand.map((r) => r.SQ_CANDIDATO))];
  const personBySq = new Map<string, string>();
  for (let i = 0; i < sqs.length; i += 300) {
    const { data } = await db.from("politician_identifiers").select("politician_id,value").eq("source_key", "tse_cand").eq("id_type", idType).in("value", sqs.slice(i, i + 300));
    data?.forEach((d) => personBySq.set(d.value, d.politician_id));
  }
  const missing = sqs.filter((s) => !personBySq.has(s));
  for (const sq of missing) {
    const r = cand.find((c) => c.SQ_CANDIDATO === sq)!;
    const { data, error } = await db.from("politicians").insert({ civil_name: r.NM_CANDIDATO.trim(), ballot_name: nul(r.NM_URNA_CANDIDATO), social_name: nul(r.NM_SOCIAL_CANDIDATO), gender: nul(r.DS_GENERO) }).select("id").single();
    if (error) throw error;
    await db.from("politician_identifiers").insert({ politician_id: data.id, source_key: "tse_cand", id_type: idType, value: sq });
    personBySq.set(sq, data.id);
  }

  const now = new Date().toISOString();
  const rows = cand.map((r) => ({
    politician_id: personBySq.get(r.SQ_CANDIDATO)!, election_id: elMap.get(`${r.CD_ELEICAO}|${r.NR_TURNO}`)!,
    tse_candidate_seq: r.SQ_CANDIDATO, round: Number(r.NR_TURNO), office_code: Number(r.CD_CARGO), office_name: r.DS_CARGO,
    level: "municipal", municipality_id: mun!.id, uf, ballot_number: r.NR_CANDIDATO, ballot_name: nul(r.NM_URNA_CANDIDATO),
    party_number: r.NR_PARTIDO, party_acronym: r.SG_PARTIDO, party_name: r.NM_PARTIDO, federation_name: nul(r.NM_FEDERACAO),
    coalition_name: nul(r.NM_COLIGACAO), candidacy_status: nul(r.DS_SITUACAO_CANDIDATURA), result_code: r.CD_SIT_TOT_TURNO,
    result_name: nul(r.DS_SIT_TOT_TURNO), outcome: outcomeOf(r.CD_SIT_TOT_TURNO), valid_votes: votes.get(`${r.SQ_CANDIDATO}|${r.NR_TURNO}`) ?? null,
    occupation: nul(r.DS_OCUPACAO), source_key: "tse_cand", source_url: candUrl, source_generated_at: `${r.DT_GERACAO} ${r.HH_GERACAO}`,
    collected_at: now, updated_at: now,
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await db.from("candidacies").upsert(rows.slice(i, i + 500), { onConflict: "election_id,tse_candidate_seq,round" });
    if (error) throw error;
  }

  // Mandatos previstos (não verificados) para eleitos — nunca marcados como "em exercício" automaticamente.
  const { data: elected } = await db.from("candidacies").select("id,politician_id,office_name,level,municipality_id,uf").eq("municipality_id", mun!.id).eq("outcome", "eleito");
  const startYear = year + 1;
  const { data: existing } = await db.from("mandates").select("candidacy_id").in("candidacy_id", (elected ?? []).map((e) => e.id));
  const have = new Set((existing ?? []).map((e) => e.candidacy_id));
  const newM = (elected ?? []).filter((e) => !have.has(e.id)).map((e) => ({
    politician_id: e.politician_id, candidacy_id: e.id, office_name: e.office_name, level: e.level, municipality_id: e.municipality_id, uf: e.uf,
    term_start: `${startYear}-01-01`, term_end: `${startYear + 3}-12-31`, status: "nao_verificado",
    notes: `Mandato previsto pelo resultado do TSE ${year}; aguardando confirmação por fonte institucional.`,
  }));
  if (newM.length) { const { error } = await db.from("mandates").insert(newM); if (error) throw error; }

  return { read: cand.length, inserted: missing.length, updated: rows.length, mandates_created: newM.length, sources: [candUrl, votUrl] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Autorização
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  let userId: string | null = null;
  let allowed = token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || authenticateCronRequest(req) === null;
  if (!allowed && token) {
    const { data } = await db.auth.getUser(token);
    if (data?.user) {
      userId = data.user.id;
      const { data: isAdmin } = await db.rpc("has_role", { _user_id: userId, _role: "admin" });
      allowed = !!isAdmin;
    }
  }
  if (!allowed) return json({ error: "Acesso restrito a administradores" }, 403);

  let body;
  try { body = Body.parse(await req.json()); } catch (e) { return json({ error: String(e) }, 400); }

  const source_key = body.action === "ibge" ? "ibge_localidades" : "tse_cand";
  const scope = body.action === "ibge" ? `IBGE/${body.uf}` : `TSE ${body.year}/${body.uf}/${body.tse_code}`;
  const { data: log } = await db.from("sync_logs").insert({ source_key, scope, triggered_by: userId }).select("id").single();
  try {
    const r = body.action === "ibge"
      ? await syncIbge(db, body.uf.toUpperCase())
      : await syncTseMunicipal(db, body.year, body.uf.toUpperCase(), body.tse_code, body.offices);
    await db.from("sync_logs").update({
      status: "success", finished_at: new Date().toISOString(), rows_read: r.read,
      rows_inserted: "inserted" in r ? r.inserted : 0, rows_updated: r.updated, details: r,
    }).eq("id", log!.id);
    return json({ ok: true, ...r });
  } catch (e) {
    await db.from("sync_logs").update({ status: "error", finished_at: new Date().toISOString(), error_message: String(e) }).eq("id", log!.id);
    return json({ error: String(e) }, 500);
  }
});
