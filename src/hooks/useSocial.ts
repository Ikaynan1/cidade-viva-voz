import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLocations() {
  return useQuery({
    queryKey: ["municipalities-social"],
    queryFn: async () => {
      const { data, error } = await supabase.from("municipalities").select("id,name,uf").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function usePoliticians() {
  return useQuery({
    queryKey: ["politicians-elected"],
    queryFn: async () => {
      const { data: candidacies, error: candidaciesError } = await supabase
        .from("candidacies")
        .select("politician_id")
        .eq("outcome", "eleito");
      if (candidaciesError) throw candidaciesError;
      const electedIds = [...new Set((candidacies ?? []).map((row) => row.politician_id))];
      if (electedIds.length === 0) return [];
      const { data, error } = await supabase
        .from("politicians")
        .select("id,civil_name,ballot_name")
        .in("id", electedIds)
        .order("civil_name");
      if (error) throw error;
      return data;
    },
  });
}

export async function authorName(id: string) {
  const { data } = await supabase.rpc("public_author", { _id: id });
  return data?.[0]?.display_name ?? "Morador";
}
