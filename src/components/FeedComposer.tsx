import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Send, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePoliticians } from "@/hooks/useSocial";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function FeedComposer({ municipalityId, city }: { municipalityId?: string; city: string }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: politicians } = usePoliticians();
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [politicianId, setPoliticianId] = useState("");
  const [category, setCategory] = useState("Outro");
  const [sentiment, setSentiment] = useState("neutro");
  const [busy, setBusy] = useState(false);
  const selected = politicians?.find((person) => person.id === politicianId);
  const matches = (politicians ?? [])
    .filter((person) => ((person.ballot_name ?? "") + " " + person.civil_name).toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")))
    .slice(0, 6);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) { navigate("/auth"); return; }
    if (!municipalityId) { toast.error("Não foi possível identificar o município do feed."); return; }
    if (!content.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      municipality_id: municipalityId,
      politician_id: politicianId || null,
      content: content.trim(),
      sentiment,
      category,
      neighborhood: profile?.neighborhood ?? "",
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setContent("");
    setSearch("");
    setPoliticianId("");
    setCategory("Outro");
    setSentiment("neutro");
    await queryClient.invalidateQueries({ queryKey: ["feed"] });
    toast.success("Sua publicação entrou no feed.");
  }

  const displayName = profile?.display_name ?? "Morador";
  return <Card className="mb-5 overflow-visible rounded-2xl border-border/70 shadow-sm">
    <form onSubmit={submit}>
      <div className="flex gap-3 p-4 pb-3">
        <Avatar className="mt-1 h-10 w-10 shrink-0"><AvatarFallback className="bg-primary/10 font-semibold text-primary">{displayName.slice(0, 1).toUpperCase()}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-sm font-semibold">{user ? "Compartilhe sua voz" : "O que está acontecendo em " + city + "?"}</p>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onFocus={() => { if (!user) navigate("/auth"); }}
            placeholder="O que você gostaria de compartilhar com a cidade?"
            aria-label="Texto da publicação"
            maxLength={1200}
            rows={3}
            className="min-h-20 resize-y rounded-xl border-0 bg-muted/60 px-4 py-3 shadow-none focus-visible:ring-1"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {selected ? <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Marcando: {selected.ballot_name ?? selected.civil_name}
              <button type="button" className="ml-1 rounded-full hover:bg-primary/10" aria-label="Remover político marcado" onClick={() => setPoliticianId("")}><X className="h-3 w-3" /></button>
            </div> : <div className="relative min-w-56 flex-1">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Marcar político (opcional)"
                aria-label="Buscar político para marcar"
                autoComplete="off"
                className="h-9 rounded-full bg-muted/50 text-sm"
              />
              {search.trim() && <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border bg-popover p-1 shadow-lg">
                {matches.map((person) => <button key={person.id} type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => { setPoliticianId(person.id); setSearch(""); }}>
                  <span className="block font-medium">{person.ballot_name ?? person.civil_name}</span>
                  {person.ballot_name && <span className="block text-xs text-muted-foreground">{person.civil_name}</span>}
                </button>)}
                {matches.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum político encontrado.</p>}
              </div>}
            </div>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" disabled className="gap-2 rounded-full text-muted-foreground" title="Fotos poderão ser adicionadas em outra etapa"><ImagePlus className="h-4 w-4 text-emerald-600" />Foto em breve</Button>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-36 rounded-full text-xs" aria-label="Categoria da publicação"><SelectValue /></SelectTrigger>
            <SelectContent>{["Economia", "Saúde", "Transporte", "Infraestrutura", "Educação", "Segurança", "Outro"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sentiment} onValueChange={setSentiment}>
            <SelectTrigger className="h-9 w-36 rounded-full text-xs" aria-label="Classificação da publicação"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="positivo">Positivo</SelectItem><SelectItem value="negativo">Negativo</SelectItem><SelectItem value="neutro">Neutro</SelectItem></SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={busy || !content.trim()} className="gap-2 rounded-full px-5">
          <Send className="h-4 w-4" />{busy ? "Publicando…" : "Publicar"}
        </Button>
      </div>
      {!user && <p className="px-4 pb-3 text-xs text-muted-foreground">Entre ou cadastre-se para publicar, comentar e avaliar.</p>}
    </form>
  </Card>;
}
