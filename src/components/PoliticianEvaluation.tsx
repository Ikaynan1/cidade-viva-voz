import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function PoliticianEvaluation({ politicianId }: { politicianId: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["evaluations", politicianId],
    queryFn: async () => {
      const { data, error } = await supabase.from("politician_evaluations").select("user_id,rating").eq("politician_id", politicianId);
      if (error) throw error;
      return data;
    },
  });
  const own = data?.find((row) => row.user_id === user?.id)?.rating;
  const averageNumber = data?.length ? data.reduce((sum, row) => sum + row.rating, 0) / data.length : null;
  const average = averageNumber?.toFixed(1);

  async function rate(rating: number) {
    if (!user) { navigate("/auth"); return; }
    setBusy(true);
    const { error } = await supabase.from("politician_evaluations").upsert(
      { user_id: user.id, politician_id: politicianId, rating },
      { onConflict: "user_id,politician_id" },
    );
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    await queryClient.invalidateQueries({ queryKey: ["evaluations", politicianId] });
    toast.success("Avaliação salva");
  }

  return <div className="mt-3">
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1" aria-live="polite">
      <span className="flex items-center gap-0.5" aria-label={average ? "Média de " + average + " estrelas em 5" : "Ainda sem avaliações"}>
        {[1, 2, 3, 4, 5].map((star) => <Star key={star} aria-hidden="true" className={"h-4 w-4 " + (averageNumber !== null && star <= Math.round(averageNumber) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />)}
      </span>
      <span className="text-sm font-semibold">{isLoading ? "…" : average ? average : "Sem avaliações"}</span>
      {average && <span className="text-xs text-muted-foreground">· opinião de {data?.length} {data?.length === 1 ? "usuário" : "usuários"}</span>}
    </div>
    <div className="mt-1 flex gap-1" aria-label="Sua avaliação">
      {[1, 2, 3, 4, 5].map((rating) => <Button key={rating} size="icon" variant="ghost" aria-label={"Avaliar com " + rating + " estrelas"} aria-pressed={own === rating} disabled={busy} className="h-8 w-8" onClick={() => void rate(rating)}>
        <Star className={"h-4 w-4 " + (own && rating <= own ? "fill-accent text-accent" : "text-muted-foreground")} />
      </Button>)}
    </div>
  </div>;
}
