import { User, Settings, LogOut, LogIn } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
export const UserMenu=()=>{
 const navigate=useNavigate();const {user,profile,loading}=useAuth();
 if(loading)return <span className="text-sm text-muted-foreground">Carregando…</span>;
 if(!user)return <Button variant="outline" onClick={()=>navigate('/auth')}><LogIn className="h-4 w-4 mr-2"/>Entrar/Cadastrar</Button>;
 const name=profile?.display_name??'Morador';
 return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" aria-label="Menu do usuário" className="gap-2"><User className="h-5 w-5"/><Avatar className="h-9 w-9"><AvatarImage src={profile?.avatar_url??undefined} alt={name}/><AvatarFallback>{name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><p className="p-2 text-sm font-medium">{name}</p><DropdownMenuSeparator/><DropdownMenuItem onClick={()=>navigate('/profile')}><User className="mr-2 h-4 w-4"/>Perfil</DropdownMenuItem><DropdownMenuItem onClick={()=>navigate('/settings')}><Settings className="mr-2 h-4 w-4"/>Configurações</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive" onClick={async()=>{const {error}=await supabase.auth.signOut();if(error)toast.error(error.message);else navigate('/');}}><LogOut className="mr-2 h-4 w-4"/>Sair</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
};
