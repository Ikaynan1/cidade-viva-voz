import { useEffect,useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
export default function Settings(){
 const navigate=useNavigate();const {user,profile,refresh}=useAuth();const [name,setName]=useState('');const [city,setCity]=useState('');const [neighborhood,setNeighborhood]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{if(profile){setName(profile.display_name);setCity(profile.city);setNeighborhood(profile.neighborhood);}},[profile]);
 return <div className="min-h-screen bg-background"><header className="border-b"><div className="container p-4 flex gap-4 items-center"><Button aria-label="Voltar" variant="ghost" size="icon" onClick={()=>navigate('/')}><ArrowLeft/></Button><h1 className="text-xl font-bold">Configurações</h1></div></header><main className="mx-auto max-w-2xl p-6 space-y-8"><section><h2 className="text-lg font-semibold mb-4">Dados pessoais</h2><form className="space-y-4" onSubmit={async e=>{e.preventDefault();if(!user)return;setBusy(true);const {error}=await supabase.from('profiles').update({display_name:name,city,neighborhood}).eq('id',user.id);setBusy(false);if(error)toast.error(error.message);else{await refresh();toast.success('Dados atualizados');}}}><Label htmlFor="name">Nome completo</Label><Input id="name" value={name} onChange={e=>setName(e.target.value)} required maxLength={100}/><Label>E-mail</Label><Input value={user?.email??''} disabled/><Label htmlFor="city">Cidade</Label><Input id="city" value={city} onChange={e=>setCity(e.target.value)} required/><Label htmlFor="neighborhood">Bairro</Label><Input id="neighborhood" value={neighborhood} onChange={e=>setNeighborhood(e.target.value)}/><Button disabled={busy} type="submit">Salvar alterações</Button></form></section><section className="border-t pt-6"><h2 className="text-lg font-semibold mb-4">Aparência</h2><ThemeToggle/></section><section className="border-t pt-6"><h2 className="text-lg font-semibold">Verificação de residência</h2><p className="text-sm text-muted-foreground">Envio de documentos ainda indisponível. Sua conta não possui verificação de residência.</p></section></main></div>;
}
