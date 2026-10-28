import { useState } from 'react';
import { useQuery,useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
export function PoliticianEvaluation({politicianId}:{politicianId:string}){
 const {user}=useAuth();const navigate=useNavigate();const qc=useQueryClient();const [busy,setBusy]=useState(false);
 const {data}=useQuery({queryKey:['evaluations',politicianId],queryFn:async()=>{const {data,error}=await supabase.from('politician_evaluations').select('user_id,rating').eq('politician_id',politicianId);if(error)throw error;return data;}});
 const own=data?.find(r=>r.user_id===user?.id)?.rating;
 const average=data?.length?(data.reduce((a,r)=>a+r.rating,0)/data.length).toFixed(1):null;
 return <div className="mt-2"><p className="text-xs text-muted-foreground">Opinião dos usuários: {average?`${average}/5 · ${data?.length} avaliações`:'sem avaliações'}</p><div className="flex gap-1">{[1,2,3,4,5].map(rating=><Button key={rating} size="icon" variant="ghost" aria-label={`Avaliar com ${rating} estrelas`} aria-pressed={own===rating} disabled={busy} className="h-8 w-8" onClick={async()=>{if(!user){navigate('/auth');return;}setBusy(true);const {error}=await supabase.from('politician_evaluations').upsert({user_id:user.id,politician_id:politicianId,rating},{onConflict:'user_id,politician_id'});setBusy(false);if(error)toast.error(error.message);else{await qc.invalidateQueries({queryKey:['evaluations',politicianId]});toast.success('Avaliação salva');}}}><Star className={`h-4 w-4 ${own&&rating<=own?'fill-accent text-accent':'text-muted-foreground'}`}/></Button>)}</div></div>;
}