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
  politicians: { civil_name: string } | null;
  mandates: { status: string } | { status: string }[] | null;
};

const statusLabel: Record<string, string> = {
  nao_verificado: "Mandato não confirmado",
  em_exercicio: "Em exercício (confirmado)",
  licenciado: "Licenciado",
  afastado: "Afastado",
  encerrado: "Mandato encerrado",
};

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
        .select("id,politician_id,ballot_name,office_code,office_name,party_acronym,ballot_number,round,outcome,result_name,valid_votes,source_url,collected_at,politicians(civil_name),mandates(status)")
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
        <p className="truncate font-semibold">{row.ballot_name ?? row.politicians?.civil_name}</p>
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

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Candidatos eleitos em 2024</h3>
        {data.map((row) => <Person key={row.id} row={row} />)}
        {data.length === 0 && <Card className="p-4 text-sm text-muted-foreground">Ainda não há candidatos eleitos carregados para Natal.</Card>}
      </div>
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
