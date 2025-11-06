// components/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // useEffect se encarga de la redirección
  useEffect(() => {
    // Si la carga ha terminado y no hay usuario, redirige a /login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]); // Se ejecuta si cambia el usuario, la carga o el router

  // Mientras se carga o si no hay usuario (antes de redirigir), muestra un mensaje
  if (loading || !user) {
    return <p className="text-center mt-20">Verificando acceso...</p>;
  }

  // Si la carga terminó y hay un usuario, muestra el contenido protegido
  return <>{children}</>;
}