import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

const AuthContext = createContext<{ user: User | null; profile: Tables<'profiles'> | null; loading: boolean; isAdmin: boolean; refresh: () => Promise<void> }>({user:null,profile:null,loading:true,isAdmin:false,refresh:async()=>{}});
export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user,setUser]=useState<User|null>(null);
  const [profile,setProfile]=useState<Tables<'profiles'>|null>(null);
  const [loading,setLoading]=useState(true);
  const [isAdmin,setAdmin]=useState(false);
  const refresh=async()=>{
    const {data:{user:valid}}=await supabase.auth.getUser();
    setUser(valid);
    if(valid){
      const [p,r]=await Promise.all([supabase.from('profiles').select('*').eq('id',valid.id).single(),supabase.rpc('has_role',{_user_id:valid.id,_role:'admin'})]);
      setProfile(p.data);setAdmin(r.data===true);
    }else{setProfile(null);setAdmin(false);}
    setLoading(false);
  };
  useEffect(()=>{
    let alive=true;
    const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>{ setTimeout(()=>{if(alive) void refresh();},0); });
    void refresh();
    return()=>{alive=false;subscription.unsubscribe();};
  },[]);
  return <AuthContext.Provider value={{user,profile,loading,isAdmin,refresh}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);