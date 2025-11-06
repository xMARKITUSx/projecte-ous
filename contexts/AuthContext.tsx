// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/firebase'; // Importa la app que acabamos de exportar

// Define la estructura de los datos que compartirá el contexto
interface AuthContextType {
  user: User | null; // El usuario de Firebase, o null si no hay sesión
  loading: boolean;  // Para saber si todavía está comprobando el estado de la sesión
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const auth = getAuth(app); // Inicializa el servicio de autenticación

// Componente "Proveedor" que envolverá la aplicación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect se ejecuta una vez para establecer un "espía" que escucha
  // los cambios de estado de autenticación (login, logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Actualiza el usuario
      setLoading(false); // Marca la carga como completada
    });
    // Limpia el "espía" cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

// Hook personalizado para acceder fácilmente al contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};