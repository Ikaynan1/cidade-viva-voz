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
    queryKey: ["politicians-social"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("politicians")
        .select("id,civil_name,ballot_name,photo_url")
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
