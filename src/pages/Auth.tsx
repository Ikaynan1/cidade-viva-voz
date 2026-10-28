import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import '@lovable.dev/cloud-auth-js/styles.css';
import { useAuth } from '@/hooks/useAuth';

export default function Auth(){
 const navigate=useNavigate();const {user}=useAuth();
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [forgot,setForgot]=useState(false);
 useEffect(()=>{if(user)navigate('/');},[user,navigate]);
 async function submit(e:React.FormEvent<HTMLFormElement>,signup:boolean){
  e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);setMessage('');
  const email=String(f.get('email'));const password=String(f.get('password'));
  try{
   if(forgot){const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/reset-password'});if(error)throw error;setMessage('Se este e-mail possui uma conta, enviaremos um link para redefinir a senha.');}
   else if(signup){const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin,data:{display_name:f.get('display_name'),city:f.get('city'),neighborhood:f.get('neighborhood')}}});if(error)throw error;setMessage(data.session?'Conta criada.':'Confira seu e-mail para confirmar o cadastro antes de entrar.');}
   else {const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;}
  }catch(err){setMessage(err instanceof Error?err.message:'Não foi possível concluir.');}finally{setBusy(false);}
 }
 async function social(provider:'google'|'lovable'){setBusy(true);const result=await lovable.auth.signInWithOAuth(provider,{redirect_uri:window.location.origin});if(result.error)setMessage(result.error.message);setBusy(false);}
 return <div className="min-h-screen bg-background flex items-center justify-center p-4"><div className="w-full max-w-md"><Button variant="ghost" onClick={()=>navigate('/')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2"/>Voltar</Button><Card><CardHeader className="text-center"><CardTitle className="text-3xl text-primary">VozCivica</CardTitle></CardHeader><CardContent><Tabs defaultValue="login" onValueChange={()=>{setForgot(false);setMessage('');}}><TabsList className="grid grid-cols-2 w-full"><TabsTrigger value="login">Entrar</TabsTrigger><TabsTrigger value="signup">Cadastrar</TabsTrigger></TabsList>{[false,true].map(signup=><TabsContent key={String(signup)} value={signup?'signup':'login'}><form onSubmit={e=>void submit(e,signup)} className="space-y-4">{signup&&<><Label htmlFor="display-name">Nome completo</Label><Input id="display-name" name="display_name" required maxLength={100}/><Label htmlFor="city">Cidade</Label><Input id="city" name="city" defaultValue="Natal" required/><Label htmlFor="neighborhood">Bairro</Label><Input id="neighborhood" name="neighborhood" required/></>}<Label htmlFor={signup?'signup-email':'email'}>E-mail</Label><Input id={signup?'signup-email':'email'} name="email" type="email" required autoComplete="email"/>{!forgot&&<><Label htmlFor={signup?'signup-password':'password'}>Senha</Label><Input id={signup?'signup-password':'password'} name="password" type="password" minLength={signup?8:undefined} required autoComplete={signup?'new-password':'current-password'}/></>}<Button className="w-full" disabled={busy} type="submit">{busy?'Aguarde…':forgot?'Enviar link de recuperação':signup?'Criar Conta':'Entrar'}</Button>{!signup&&<Button type="button" variant="link" onClick={()=>setForgot(!forgot)}>{forgot?'Voltar para entrar':'Esqueci minha senha'}</Button>}</form></TabsContent>)}</Tabs>{message&&<p role="status" className="text-sm mt-4">{message}</p>}<div className="mt-4 space-y-2"><Button variant="outline" className="w-full" disabled={busy} onClick={()=>void social('google')}>Continuar com Google</Button><Button type="button" className="lovable-auth-button w-full" disabled={busy} onClick={()=>void social('lovable')}>Continue with Lovable</Button></div></CardContent></Card></div></div>;
}
