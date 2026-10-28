import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
export default function ResetPassword(){
 const navigate=useNavigate();
 const [recovery,setRecovery]=useState(new URLSearchParams(window.location.hash.slice(1)).get('type')==='recovery');
 const [busy,setBusy]=useState(false);
 useEffect(()=>{const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY')setRecovery(true);});return()=>subscription.unsubscribe();},[]);
 return <main className="mx-auto max-w-md p-6 space-y-4"><h1 className="text-2xl font-bold">Redefinir senha</h1>{recovery?<form className="space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);const password=String(new FormData(e.currentTarget).get('password'));const {error}=await supabase.auth.updateUser({password});setBusy(false);if(error)toast.error(error.message);else{toast.success('Senha atualizada');navigate('/');}}}><Label htmlFor="new-password">Nova senha</Label><Input id="new-password" name="password" type="password" minLength={8} required autoComplete="new-password"/><Button disabled={busy} type="submit">Salvar nova senha</Button></form>:<p className="text-muted-foreground">Abra o link de recuperação enviado ao seu e-mail.</p>}</main>;
}