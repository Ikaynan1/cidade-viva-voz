import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLocations, usePoliticians } from "@/hooks/useSocial";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function CreatePost() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { data: locations } = useLocations();
  const { data: politicians } = usePoliticians();
  const [location, setLocation] = useState("");
  const [politician, setPolitician] = useState(searchParams.get("politician") ?? "");
  const [politicianSearch, setPoliticianSearch] = useState("");
  const [sentiment, setSentiment] = useState("neutro");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = location || locations?.find((m) => m.name.toUpperCase() === "NATAL")?.id;
  const selectedPolitician = politicians?.find((p) => p.id === politician);
  const matchingPoliticians = (politicians ?? [])
    .filter((p) => (p.ballot_name + " " + p.civil_name).toLocaleLowerCase("pt-BR").includes(politicianSearch.trim().toLocaleLowerCase("pt-BR")))
    .slice(0, 8);

  useEffect(() => {
    if (!image) { setPreview(""); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function chooseImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Escolha um arquivo de imagem."); return; }
    if (file.size > MAX_IMAGE_SIZE) { toast.error("A imagem deve ter no máximo 5 MB."); return; }
    setImage(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !selected || !category || !content.trim()) return;
    const neighborhood = String(new FormData(event.currentTarget).get("neighborhood") ?? "").trim();
    setBusy(true);
    try {
      let imageUrl: string | null = null;
      if (image) {
        const extension = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : image.type === "image/gif" ? "gif" : "jpg";
        const path = user.id + "/" + crypto.randomUUID() + "." + extension;
        const { error: uploadError } = await supabase.storage.from("post-images").upload(path, image, { cacheControl: "3600", contentType: image.type, upsert: false });
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("posts").insert({
        author_id: user.id, municipality_id: selected, politician_id: politician || null,
        content: content.trim(), sentiment, category, neighborhood, image_url: imageUrl,
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Publicação feita!");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível publicar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4"><Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="mr-2 h-4 w-4" />Voltar ao feed</Button></header>
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-2 text-2xl font-bold">Criar publicação</h1>
        <p className="mb-6 text-sm text-muted-foreground">Compartilhe o que está acontecendo na sua cidade.</p>
        <form className="space-y-6" onSubmit={submit}>
          <div className="space-y-2"><Label>Como você avalia essa situação?</Label><div className="grid grid-cols-3 gap-2">
            {["positivo", "negativo", "neutro"].map((value) => <Button key={value} type="button" variant={value === sentiment ? "default" : "outline"} onClick={() => setSentiment(value)}>{value[0].toUpperCase() + value.slice(1)}</Button>)}
          </div></div>
          <div className="space-y-2"><Label>Município</Label><Select value={selected ?? ""} onValueChange={setLocation}><SelectTrigger aria-label="Município"><SelectValue placeholder="Selecione o município" /></SelectTrigger><SelectContent>{locations?.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} / {m.uf}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2">
            <Label htmlFor="politician-search">Marcar político (opcional)</Label>
            {selectedPolitician ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="font-medium">{selectedPolitician.ballot_name ?? selectedPolitician.civil_name}</p><p className="text-xs text-muted-foreground">A publicação aparecerá no perfil do político.</p></div>
                <Button type="button" variant="ghost" size="icon" aria-label="Remover político marcado" onClick={() => setPolitician("")}><X className="h-4 w-4" /></Button>
              </div>
            ) : <>
              <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="politician-search" className="pl-9" value={politicianSearch} onChange={(e) => setPoliticianSearch(e.target.value)} placeholder="Digite um nome, por exemplo Paulinho…" autoComplete="off" /></div>
              {politicianSearch.trim() && <div className="max-h-56 overflow-y-auto rounded-lg border">
                {matchingPoliticians.map((p) => <button key={p.id} type="button" className="block w-full border-b px-3 py-2 text-left last:border-0 hover:bg-muted" onClick={() => { setPolitician(p.id); setPoliticianSearch(""); }}><span className="block font-medium">{p.ballot_name ?? p.civil_name}</span>{p.ballot_name && <span className="block text-xs text-muted-foreground">{p.civil_name}</span>}</button>)}
                {matchingPoliticians.length === 0 && <p className="p-3 text-sm text-muted-foreground">Nenhum político encontrado.</p>}
              </div>}
              <Button type="button" variant="link" className="h-auto p-0" onClick={() => { setPolitician(""); setPoliticianSearch(""); }}>Publicar sem marcar político</Button>
            </>}
          </div>
          <div className="space-y-2"><Label>Categoria</Label><Select value={category} onValueChange={setCategory} required><SelectTrigger aria-label="Categoria"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger><SelectContent>{["Economia", "Saúde", "Transporte", "Infraestrutura", "Educação", "Segurança", "Outro"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="content">Sua publicação</Label><Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} maxLength={1200} required rows={6} placeholder="O que você gostaria de compartilhar?" /><p className="text-right text-xs text-muted-foreground">{content.length}/1200</p></div>
          <div className="space-y-2">
            <Label htmlFor="post-image">Foto (opcional)</Label>
            <label htmlFor="post-image" className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm hover:bg-muted"><ImagePlus className="h-5 w-5" />Adicionar uma foto (máximo 5 MB)</label>
            <Input id="post-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => chooseImage(e.target.files?.[0])} />
            {preview && <div className="relative"><img src={preview} alt="Prévia da foto da publicação" className="max-h-80 w-full rounded-lg object-cover" /><Button type="button" variant="secondary" size="icon" aria-label="Remover foto" className="absolute right-2 top-2" onClick={() => { setImage(null); const input = document.getElementById("post-image") as HTMLInputElement | null; if (input) input.value = ""; }}><X className="h-4 w-4" /></Button></div>}
          </div>
          <div className="space-y-2"><Label htmlFor="neighborhood">Bairro (opcional)</Label><Input id="neighborhood" name="neighborhood" maxLength={100} defaultValue={profile?.neighborhood ?? ""} /></div>
          <div className="flex gap-3"><Button type="button" variant="outline" onClick={() => navigate("/")}>Cancelar</Button><Button type="submit" disabled={busy || !category || !selected || !content.trim()}>{busy ? "Publicando…" : "Publicar"}</Button></div>
        </form>
      </main>
    </div>
  );
}
