import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
export function RequireAuth({children}: {children:React.ReactNode}) {
  const {user,loading}=useAuth();
  if(loading)return <p className="p-6 text-muted-foreground">Carregando…</p>;
  return user ? <>{children}</> : <Navigate to="/auth" replace/>;
}