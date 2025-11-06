// components/Contador.tsx

'use client';

import { useState } from 'react';

// 1. Definimos qué "instrucciones" (props) puede recibir nuestro componente.
// En este caso, una llamada "incremento" que debe ser un número.
type ContadorProps = {
  incremento: number;
};

// 2. Le decimos al componente que va a recibir esas props.
export default function Contador({ incremento }: ContadorProps) {
  const [count, setCount] = useState(0);

  function handleClick() {
    // 3. ¡Aquí está la magia! Ya no sumamos "+ 1".
    // Ahora sumamos el valor que nos llegue en la prop "incremento".
    setCount(count + incremento);
  }

  return (
    <div className="bg-white/10 p-6 rounded-lg text-center mt-8">
      {/* Mostramos de cuánto en cuánto se incrementa para que sea más claro */}
      <p className="text-sm text-gray-400">Incrementa de {incremento} en {incremento}</p>
      <p className="text-2xl">Has hecho clic {count} veces</p>
      <button 
        onClick={handleClick} 
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Púlsame
      </button>
    </div>
  );
}
