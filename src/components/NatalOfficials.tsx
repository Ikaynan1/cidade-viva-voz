import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

type Row = {
  id: string;
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
  politicians: { civil_name: string } | null;
  mandates: { status: string }[];
};

const statusLabel: Record<string, string> = {
  nao_verificado: "Mandato não confirmado",
  em_exercicio: "Em exercício (confirmado)",
  licenciado: "Licenciado",
  afastado: "Afastado",
  encerrado: "Mandato encerrado",
};

function useNatal() {
  return useQuery({
    queryKey: ["natal-2024"],
    queryFn: async () => {
      const { data: mun } = await supabase.from("municipalities").select("id").eq("tse_code", "17612").single();
      const { data, error } = await supabase
        .from("candidacies")
        .select("id,ballot_name,office_code,office_name,party_acronym,ballot_number,round,outcome,result_name,valid_votes,source_url,collected_at,politicians(civil_name),mandates(status)")
        .eq("municipality_id", mun!.id)
        .order("valid_votes", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as unknown as Row[];
    },
  });
}

const Person = ({ r }: { r: Row }) => (
  <Card className="p-3 flex items-start justify-between gap-3">
    <div className="min-w-0">
      <p className="font-semibold truncate">{r.ballot_name ?? r.politicians?.civil_name}</p>
      <p className="text-xs text-muted-foreground truncate">{r.politicians?.civil_name}</p>
      <div className="flex flex-wrap gap-1 mt-1">
        <Badge variant="outline">{r.party_acronym} · {r.ballot_number}</Badge>
        <Badge variant={r.outcome === "eleito" ? "default" : "secondary"}>
          {r.result_name ?? "Sem resultado"} ({r.round}º turno)
        </Badge>
        {r.mandates?.[0] && <Badge variant="outline">{statusLabel[r.mandates[0].status]}</Badge>}
      </div>
    </div>
    {r.valid_votes != null && (
      <span className="text-sm font-semibold whitespace-nowrap">{r.valid_votes.toLocaleString("pt-BR")} votos</span>
    )}
  </Card>
);

export const NatalOfficials = () => {
  const { data, isLoading, error } = useNatal();
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (error || !data) return <p className="text-sm text-destructive">Não foi possível carregar os dados oficiais.</p>;

  const exec = data.filter((r) => r.office_code === 11 || r.office_code === 12);
  const elected = (code: number) => data.filter((r) => r.office_code === code && r.outcome === "eleito");
  const vereadores = data.filter((r) => r.office_code === 13);

  return (
    <div className="space-y-3">
      <Tabs defaultValue="eleitos">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="eleitos">Eleitos 2024</TabsTrigger>
          <TabsTrigger value="prefeitura">Candidatos a prefeito</TabsTrigger>
          <TabsTrigger value="camara">Candidatos a vereador ({vereadores.length})</TabsTrigger>
          <TabsTrigger value="estado">Rio Grande do Norte</TabsTrigger>
        </TabsList>
        <TabsContent value="eleitos" className="space-y-2">
          {[...elected(11), ...elected(12), ...elected(13)].map((r) => <Person key={r.id} r={r} />)}
        </TabsContent>
        <TabsContent value="prefeitura" className="space-y-2">
          {exec.sort((a, b) => b.round - a.round || a.office_code - b.office_code).map((r) => <Person key={r.id} r={r} />)}
        </TabsContent>
        <TabsContent value="camara" className="space-y-2 max-h-[600px] overflow-y-auto">
          {vereadores.map((r) => <Person key={r.id} r={r} />)}
        </TabsContent>
        <TabsContent value="estado">
          <Card className="p-4 text-sm text-muted-foreground">
            Governador, senadores e deputados do RN são cargos estaduais/federais e serão vinculados ao estado,
            não a Natal. Esta integração ainda não foi importada.
          </Card>
        </TabsContent>
      </Tabs>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        Fonte: TSE – Dados Abertos, Eleições Municipais 2024. Coletado em{" "}
        {new Date(data[0].collected_at).toLocaleString("pt-BR")}.
        <a href="https://dadosabertos.tse.jus.br/dataset/candidatos-2024" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-0.5">
          ver conjunto <ExternalLink className="h-3 w-3" />
        </a>
      </p>
      <p className="text-xs text-muted-foreground">
        Resultado eleitoral não confirma o exercício atual do cargo: mandatos ficam “não confirmados” até validação pela Prefeitura ou Câmara Municipal.
      </p>
    </div>
  );
};
