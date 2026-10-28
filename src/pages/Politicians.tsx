import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { usePoliticians } from "@/hooks/useSocial";
import { UserMenu } from "@/components/UserMenu";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Politicians() {
  const { data: politicians, isLoading, error } = usePoliticians();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return (politicians ?? []).filter((p) => ((p.ballot_name ?? "") + " " + p.civil_name).toLocaleLowerCase("pt-BR").includes(term));
  }, [politicians, search]);

  return <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur"><div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3"><Link to="/" className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">Cidade Viva Voz</Link><nav className="flex items-center gap-4" aria-label="Navegação principal"><Link to="/" className="text-sm hover:text-primary">Feed</Link><UserMenu /></nav></div></header>
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="mb-5 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Voltar ao feed</Link>
      <h1 className="text-3xl font-bold">Políticos</h1><p className="mb-6 mt-2 text-muted-foreground">Busque uma pessoa para ver seu perfil, avaliações e publicações da comunidade.</p>
      <div className="relative mb-6"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Digite o nome do político" aria-label="Buscar político" /></div>
      {isLoading && <p className="py-8 text-center text-muted-foreground">Carregando políticos…</p>}
      {error && <p role="alert" className="text-destructive">Não foi possível carregar a lista de políticos.</p>}
      <div className="space-y-3">{filtered.map((p) => <Link key={p.id} to={"/politicians/" + p.id} className="block"><Card className="flex items-center gap-4 p-4 transition hover:border-primary hover:shadow-sm"><Avatar className="h-12 w-12"><AvatarFallback>{(p.ballot_name ?? p.civil_name).slice(0, 1).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><h2 className="truncate font-semibold">{p.ballot_name ?? p.civil_name}</h2>{p.ballot_name && <p className="truncate text-sm text-muted-foreground">{p.civil_name}</p>}</div></Card></Link>)}</div>
      {!isLoading && !error && filtered.length === 0 && <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">{search ? "Nenhum político encontrado para essa busca." : "A lista de políticos ainda não está disponível."}</p>}
    </main>
  </div>;
}
