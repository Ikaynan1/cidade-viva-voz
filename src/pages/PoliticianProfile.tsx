import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { PoliticianEvaluation } from "@/components/PoliticianEvaluation";
import { SocialPost } from "@/components/SocialPost";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function PoliticianProfile() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ["politician-profile", id],
    enabled: !!id,
    queryFn: async () => {
      const { data: person, error: personError } = await supabase.from("politicians").select("id,civil_name,ballot_name").eq("id", id!).maybeSingle();
      if (personError) throw personError;
      if (!person) return null;
      const { data: posts, error: postError } = await supabase.from("posts").select("*").eq("politician_id", person.id).eq("moderation_status", "visible").order("created_at", { ascending: false }).limit(100);
      if (postError) throw postError;
      return { person, posts };
    },
  });
  const person = data?.person;
  const displayName = person?.ballot_name ?? person?.civil_name;

  return <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur"><div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3"><Link to="/" className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">Cidade Viva Voz</Link><nav className="flex items-center gap-4" aria-label="Navegação principal"><Link to="/" className="text-sm hover:text-primary">Feed</Link><Link to="/politicians" className="text-sm hover:text-primary">Políticos</Link><UserMenu /></nav></div></header>
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <Link to="/politicians" className="mb-5 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Todos os políticos</Link>
      {isLoading && <p className="py-12 text-center text-muted-foreground">Carregando perfil…</p>}
      {error && <p role="alert" className="text-destructive">Não foi possível carregar este perfil.</p>}
      {!isLoading && !error && !person && <p className="py-12 text-center text-muted-foreground">Este perfil de político não foi encontrado.</p>}
      {person && <>
        <Card className="mb-8 p-5 sm:p-7"><div className="flex flex-wrap items-center gap-4">
          <Avatar className="h-20 w-20"><AvatarFallback className="text-2xl">{displayName?.slice(0, 1).toUpperCase()}</AvatarFallback></Avatar>
          <div className="flex-1"><h1 className="text-2xl font-bold">{displayName}</h1>{person.ballot_name && <p className="text-muted-foreground">{person.civil_name}</p>}<PoliticianEvaluation politicianId={person.id} /></div>
          <Button asChild><Link to={"/create-post?politician=" + person.id}>Fazer reclamação ou publicação</Link></Button>
        </div></Card>
        <section><h2 className="mb-1 text-xl font-bold">Publicações sobre {displayName}</h2><p className="mb-4 text-sm text-muted-foreground">Relatos e opiniões da comunidade associados a este perfil. As avaliações são opiniões de usuários e não confirmam desempenho oficial.</p>
          <div className="space-y-4">{data?.posts.map((post) => <SocialPost key={post.id} post={post} />)}
            {data?.posts.length === 0 && <Card className="border-dashed p-8 text-center"><p className="font-medium">Ainda não há publicações sobre este político.</p><p className="mt-1 text-sm text-muted-foreground">Você pode compartilhar um relato e marcar o perfil.</p><Button asChild className="mt-4"><Link to={"/create-post?politician=" + person.id}>Criar publicação</Link></Button></Card>}
          </div>
        </section>
      </>}
    </main>
  </div>;
}
