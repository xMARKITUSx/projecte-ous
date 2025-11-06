// components/Modal.tsx
'use client';

import React, { ReactNode } from 'react';

// Definimos las "props" que nuestro Modal puede recibir
type ModalProps = {
  isOpen: boolean;        // Para saber si debe mostrarse o no
  onClose: () => void;      // Función que se ejecuta al cerrar
  children: ReactNode;    // El contenido que irá dentro del modal
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  // Si no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    // Fondo oscuro semitransparente
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose} // Permite cerrar el modal haciendo clic en el fondo
    >
      {/* Contenedor del Modal (la ventana blanca) */}
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-md text-center"
        onClick={e => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
      >
        {children} {/* Aquí se renderizará el contenido que le pasemos */}
      </div>
    </div>
  );
}