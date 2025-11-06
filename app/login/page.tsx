// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading } = useAuth();

  // --- ATENCIÓN: CONFIGURACIÓN DE SEGURIDAD ---
  // Reemplaza estos valores con el email y la contraseña REALES
  // que creaste en la consola de Firebase.
const ADMIN_EMAIL = "marcgarrigabrulles2000@gmail.com";
const ADMIN_PASSWORD = "vitamina";
  // -------------------------------------------

  useEffect(() => {
    if (!loading && user) {
      router.push('/admin');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Comparamos la contraseña introducida con nuestra contraseña maestra
    if (password === ADMIN_PASSWORD) {
      // Si coinciden, usamos las credenciales correctas para iniciar sesión
      const auth = getAuth();
      try {
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        router.push('/admin');
      } catch (err) {
        // Este error solo debería aparecer si las credenciales de arriba son incorrectas
        setError('Error de configuración. Contacta al administrador.');
        console.error("Firebase login failed:", err);
      }
    } else {
      // Si no coinciden, mostramos un error
      setError('Contraseña incorrecta.');
    }
  };

  if (loading || user) {
    return <p className="text-center mt-20">Cargando...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">🔑 Acceso Admin</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña Maestra</label>
            <input 
              type="password" 
              id="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Introduce la contraseña"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 active:scale-95 transition-transform">Entrar</button>
        </form>
      </div>
    </main>
  );
}