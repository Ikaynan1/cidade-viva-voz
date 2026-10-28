import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FeedFilters } from "@/components/FeedFilters";
import { NatalOfficials } from "@/components/NatalOfficials";
import { CreatePostButton } from "@/components/CreatePostButton";
import { UserMenu } from "@/components/UserMenu";
import { SocialPost } from "@/components/SocialPost";
import { useLocations, usePoliticians } from "@/hooks/useSocial";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Index() {
  const [location, setLocation] = useState("");
  const [politician, setPolitician] = useState("all");
  const [filter, setFilter] = useState<"todos" | "positivo" | "negativo" | "neutro">("todos");
  const { data: locations } = useLocations();
  const { data: politicians } = usePoliticians();
  const selected = location || locations?.find((municipality) => municipality.name.toUpperCase() === "NATAL")?.id;
  const city = locations?.find((municipality) => municipality.id === selected)?.name ?? "Natal";

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["feed", selected, politician, filter],
    enabled: !!selected,
    queryFn: async () => {
      let query = supabase.from("posts").select("*")
        .eq("municipality_id", selected ?? "")
        .eq("moderation_status", "visible")
        .order("created_at", { ascending: false }).limit(100);
      if (filter !== "todos") query = query.eq("sentiment", filter);
      if (politician !== "all") query = query.eq("politician_id", politician);
      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">Cidade Viva Voz</Link>
          <nav className="flex items-center gap-2 sm:gap-4" aria-label="Navegação principal">
            <Link to="/" className="text-sm font-medium hover:text-primary">Feed</Link>
            <Link to="/politicians" className="text-sm font-medium hover:text-primary">Políticos</Link>
            <UserMenu />
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-6">
        <section aria-labelledby="feed-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 id="feed-title" className="text-2xl font-bold">Feed de {city}</h1>
              <p className="text-sm text-muted-foreground">Acompanhe e compartilhe conversas sobre a cidade.</p>
            </div>
            <Select value={selected ?? ""} onValueChange={setLocation}>
              <SelectTrigger className="w-52" aria-label="Município"><SelectValue placeholder="Natal" /></SelectTrigger>
              <SelectContent>{locations?.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} / {m.uf}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="mb-4 space-y-3">
            <FeedFilters activeFilter={filter} onFilterChange={setFilter} />
            <Select value={politician} onValueChange={setPolitician}>
              <SelectTrigger aria-label="Filtrar por político"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os políticos</SelectItem>
                {politicians?.map((person) => <SelectItem key={person.id} value={person.id}>{person.ballot_name ?? person.civil_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {isLoading && <p className="py-8 text-center text-muted-foreground">Carregando publicações…</p>}
            {error && <p role="alert" className="text-destructive">Não foi possível carregar as publicações. Tente novamente em instantes.</p>}
            {posts?.length === 0 && (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <h2 className="font-semibold">O feed de {city} está pronto para sua voz.</h2>
                <p className="mt-1 text-sm text-muted-foreground">Ainda não há publicações com estes filtros. Seja a primeira pessoa a compartilhar uma experiência.</p>
                <Button asChild className="mt-4"><Link to="/create-post">Fazer publicação</Link></Button>
              </div>
            )}
            {posts?.map((post) => <SocialPost key={post.id} post={post} />)}
          </div>
        </section>

        <section className="mt-12 border-t pt-8" aria-labelledby="politicos-natal">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="politicos-natal" className="text-xl font-bold">Políticos de {city}</h2>
              <p className="text-sm text-muted-foreground">Consulte perfis, acompanhe avaliações e encontre publicações.</p>
            </div>
            <Button variant="outline" asChild><Link to="/politicians">Buscar políticos</Link></Button>
          </div>
          {city.toUpperCase() === "NATAL" ? <NatalOfficials /> : <p className="text-sm text-muted-foreground">Dados oficiais ainda não importados para {city}.</p>}
        </section>
      </main>
      <CreatePostButton />
    </div>
  );
}
