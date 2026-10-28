import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import { PoliticianEvaluation } from "./PoliticianEvaluation";

type Row = {
  id: string;
  politician_id: string;
  ballot_name: string | null;
  office_code: number;
  office_name: string;
  party_acronym: string | null;
  ballot_number: string | null;
  round: number;
  outcome: string;
  result_name: string | null;
  valid_votes: number | null;
  source_url: string;
  collected_at: string;
  politicians: { civil_name: string; gender: string | null } | null;
  mandates: { status: string } | { status: string }[] | null;
};

const statusLabel: Record<string, string> = {
  nao_verificado: "Mandato não confirmado",
  em_exercicio: "Em exercício (confirmado)",
  licenciado: "Licenciado",
  afastado: "Afastado",
  encerrado: "Mandato encerrado",
};

function officeLabel(row: Row) {
  const gender = row.politicians?.gender?.trim().toLocaleLowerCase("pt-BR") ?? "";
  const female = gender === "f" || gender.startsWith("femin");
  const male = gender === "m" || gender.startsWith("mascul");
  if (row.office_code === 11) return female ? "Prefeita" : "Prefeito";
  if (row.office_code === 12) return female ? "Vice-prefeita" : male ? "Vice-prefeito" : "Vice-prefeito(a)";
  if (row.office_code === 13) return female ? "Vereadora" : male ? "Vereador" : "Vereador(a)";
  return row.office_name;
}

function useNatalElected() {
  return useQuery({
    queryKey: ["natal-elected-2024"],
    queryFn: async () => {
      const { data: municipality, error: municipalityError } = await supabase
        .from("municipalities")
        .select("id")
        .eq("tse_code", "17612")
        .single();
      if (municipalityError || !municipality) throw municipalityError ?? new Error("Natal não encontrado");
      const { data, error } = await supabase
        .from("candidacies")
        .select("id,politician_id,ballot_name,office_code,office_name,party_acronym,ballot_number,round,outcome,result_name,valid_votes,source_url,collected_at,politicians(civil_name,gender),mandates(status)")
        .eq("municipality_id", municipality.id)
        .eq("outcome", "eleito")
        .order("valid_votes", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as unknown as Row[];
    },
  });
}

const Person = ({ row }: { row: Row }) => {
  const mandate = Array.isArray(row.mandates) ? row.mandates[0] : row.mandates;
  return (
    <Card className="flex items-start justify-between gap-3 p-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold">{row.ballot_name ?? row.politicians?.civil_name}</p>
          <Badge variant="secondary">{officeLabel(row)}</Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">{row.politicians?.civil_name}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <Badge variant="outline">{row.party_acronym} · {row.ballot_number}</Badge>
          <Badge variant="default">{row.result_name ?? "Eleito"} ({row.round}º turno)</Badge>
          {mandate && <Badge variant="outline">{statusLabel[mandate.status]}</Badge>}
        </div>
        <PoliticianEvaluation politicianId={row.politician_id} />
      </div>
      {row.valid_votes != null && <span className="whitespace-nowrap text-sm font-semibold">{row.valid_votes.toLocaleString("pt-BR")} votos</span>}
    </Card>
  );
};

export const NatalOfficials = () => {
  const { data, isLoading, error } = useNatalElected();
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (error || !data) return <p className="text-sm text-destructive">Não foi possível carregar os dados oficiais.</p>;

  const prefeitura = data
    .filter((row) => row.office_code === 11 || row.office_code === 12)
    .sort((a, b) => a.office_code - b.office_code);
  const camara = data
    .filter((row) => row.office_code === 13)
    .sort((a, b) => (b.valid_votes ?? 0) - (a.valid_votes ?? 0));
  const outros = data.filter((row) => ![11, 12, 13].includes(row.office_code));

  return (
    <div className="space-y-5">
      <section className="space-y-2" aria-labelledby="prefeitura-eleitos">
        <h3 id="prefeitura-eleitos" className="font-semibold">Prefeitura de Natal</h3>
        {prefeitura.map((row) => <Person key={row.id} row={row} />)}
        {prefeitura.length === 0 && <Card className="p-4 text-sm text-muted-foreground">Não há eleitos da Prefeitura carregados.</Card>}
      </section>
      <section className="space-y-2" aria-labelledby="camara-eleitos">
        <h3 id="camara-eleitos" className="font-semibold">Câmara Municipal</h3>
        {camara.map((row) => <Person key={row.id} row={row} />)}
        {camara.length === 0 && <Card className="p-4 text-sm text-muted-foreground">Não há vereadores eleitos carregados.</Card>}
      </section>
      {outros.length > 0 && <section className="space-y-2" aria-labelledby="outros-eleitos">
        <h3 id="outros-eleitos" className="font-semibold">Outros cargos eleitos</h3>
        {outros.map((row) => <Person key={row.id} row={row} />)}
      </section>}
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        Fonte: TSE – Dados Abertos, Eleições Municipais 2024. Coletado em{" "}
        {data[0] ? new Date(data[0].collected_at).toLocaleString("pt-BR") : "—"}.
        <a href="https://dadosabertos.tse.jus.br/dataset/candidatos-2024" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline">
          ver conjunto <ExternalLink className="h-3 w-3" />
        </a>
      </p>
      <p className="text-xs text-muted-foreground">
        Eleição confirmada pelo TSE não confirma, por si só, o exercício atual do mandato. A situação do mandato aparece separadamente.
      </p>
    </div>
  );
};
