import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { authorName } from "@/hooks/useSocial";
import { useAuth } from "@/hooks/useAuth";
import { PostCard } from "./PostCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";

export function SocialPost({ post }: { post: Tables<"posts"> }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [comments, setComments] = useState(false);
  const [report, setReport] = useState(false);
  const [edit, setEdit] = useState(false);
  const [content, setContent] = useState(post.content);
  const [busy, setBusy] = useState(false);
  const { data } = useQuery({
    queryKey: ["post-details", post.id, user?.id],
    queryFn: async () => {
      const [author, likes, commentsResult, politician] = await Promise.all([
        authorName(post.author_id),
        supabase.from("post_likes").select("user_id").eq("post_id", post.id),
        supabase.from("post_comments").select("*").eq("post_id", post.id).order("created_at"),
        post.politician_id ? supabase.from("politicians").select("id,civil_name,ballot_name").eq("id", post.politician_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      ]);
      if (likes.error) throw likes.error;
      if (commentsResult.error) throw commentsResult.error;
      return { author, likes: likes.data, comments: await Promise.all(commentsResult.data.map(async (c) => ({ ...c, name: await authorName(c.author_id) }))), politician: politician.data };
    },
  });
  function requireUser() { if (!user) { navigate("/auth"); return false; } return true; }
  async function action(run: () => PromiseLike<{ error: { message: string } | null }>) {
    setBusy(true);
    try {
      const { error } = await run();
      if (error) throw new Error(error.message);
      await qc.invalidateQueries({ queryKey: ["post-details", post.id] });
      await qc.invalidateQueries({ queryKey: ["feed"] });
      await qc.invalidateQueries({ queryKey: ["politician-profile", post.politician_id] });
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
      return false;
    } finally { setBusy(false); }
  }
  const liked = data?.likes.some((like) => like.user_id === user?.id);
  const politicianName = data?.politician?.ballot_name ?? data?.politician?.civil_name;

  return <div>
    <PostCard author={data?.author ?? "Morador"} verified={false} sentiment={post.sentiment as "positivo" | "negativo" | "neutro"} category={post.category} neighborhood={post.neighborhood} date={new Date(post.created_at).toLocaleString("pt-BR")} content={post.content} imageUrl={(post as { image_url?: string | null }).image_url ?? undefined} politician={post.politician_id && politicianName ? { id: post.politician_id, name: politicianName } : undefined} likes={data?.likes.length ?? 0} liked={liked}
      onLike={() => { if (!requireUser() || !user || busy) return; void action(() => liked ? supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id) : supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id })); }}
      onComment={() => setComments(!comments)} onReport={() => { if (requireUser()) setReport(true); }} />
    {user?.id === post.author_id && post.moderation_status === "visible" && <div className="mt-1 flex gap-2"><Button variant="ghost" size="sm" disabled={busy} onClick={() => setEdit(true)}>Editar</Button><Button variant="ghost" size="sm" disabled={busy} onClick={() => { if (window.confirm("Excluir esta publicação?")) void action(() => supabase.from("posts").delete().eq("id", post.id)); }}>Excluir</Button></div>}
    {comments && <section className="space-y-3 border-l-2 py-3 pl-4">{data?.comments.map((c) => <div key={c.id}><p className="text-sm font-semibold">{c.name}</p><p className="break-words text-sm">{c.content}</p></div>)}{!data?.comments.length && <p className="text-sm text-muted-foreground">Nenhum comentário.</p>}<form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!requireUser() || !user) return; const form = e.currentTarget; const text = String(new FormData(form).get("comment")).trim(); if (await action(() => supabase.from("post_comments").insert({ author_id: user.id, post_id: post.id, content: text }))) form.reset(); }}><Input aria-label="Comentário" name="comment" placeholder="Escreva um comentário" maxLength={1200} required /><Button disabled={busy} type="submit">Comentar</Button></form></section>}
    <Dialog open={edit} onOpenChange={setEdit}><DialogContent><DialogHeader><DialogTitle>Editar publicação</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); if (await action(() => supabase.from("posts").update({ content }).eq("id", post.id))) setEdit(false); }}><Textarea aria-label="Texto da publicação" value={content} onChange={(e) => setContent(e.target.value)} required maxLength={1200} /><Button disabled={busy} type="submit">Salvar</Button></form></DialogContent></Dialog>
    <Dialog open={report} onOpenChange={setReport}><DialogContent><DialogHeader><DialogTitle>Denunciar publicação</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); if (!user) return; const reason = String(new FormData(e.currentTarget).get("reason")); if (await action(() => supabase.from("reports").insert({ reporter_id: user.id, post_id: post.id, reason }))) { setReport(false); toast.success("Denúncia registrada de forma privada"); } }}><Textarea name="reason" aria-label="Motivo da denúncia" placeholder="Motivo da denúncia" required maxLength={1000} /><Button disabled={busy} type="submit">Enviar denúncia</Button></form></DialogContent></Dialog>
  </div>;
}
