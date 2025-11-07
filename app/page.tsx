// app/page.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const PRECIOS = {
  huevos: 2,
  aceite: 4,
};

export default function HomePage() {
  const { t } = useTranslation();
  
  const [pedido, setPedido] = useState({
    huevos: { seleccionado: false, cantidad: 1 },
    aceite: { seleccionado: false, cantidad: 1 },
  });
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    if (submissionSuccess) {
      const timer = setTimeout(() => setSubmissionSuccess(false), 4000); // Acortamos a 4 segundos
      return () => clearTimeout(timer);
    }
  }, [submissionSuccess]);

  const handleSelectProducto = (producto: 'huevos' | 'aceite') => {
    setPedido(prev => ({ ...prev, [producto]: { ...prev[producto], seleccionado: !prev[producto].seleccionado } }));
  };

  const handleCantidadChange = (producto: 'huevos' | 'aceite', cantidad: number) => {
    setPedido(prev => ({ ...prev, [producto]: { ...prev[producto], cantidad: Math.max(1, cantidad) } }));
  };

  const totalPedido = useMemo(() => {
    let total = 0;
    if (pedido.huevos.seleccionado) total += pedido.huevos.cantidad * PRECIOS.huevos;
    if (pedido.aceite.seleccionado) total += pedido.aceite.cantidad * PRECIOS.aceite;
    return total;
  }, [pedido]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (nombre.trim() === '' || (!pedido.huevos.seleccionado && !pedido.aceite.seleccionado)) {
      alert(t('formError'));
      setIsSubmitting(false);
      return;
    }

    try {
      const orderData = {
        cliente: nombre.trim(),
        telefono: telefono.trim() || 'No proporcionado',
        productos: {
          huevos: pedido.huevos.seleccionado ? { cantidad: pedido.huevos.cantidad, precioTotal: pedido.huevos.cantidad * PRECIOS.huevos, unidades: pedido.huevos.cantidad * 20 } : null,
          aceite: pedido.aceite.seleccionado ? { cantidad: pedido.aceite.cantidad, precioTotal: pedido.aceite.cantidad * PRECIOS.aceite, litros: pedido.aceite.cantidad * 3 } : null,
        },
        total: totalPedido,
        estado: 'pendiente',
        pagado: false,
        fechaPedido: serverTimestamp(),
      };

      await addDoc(collection(db, 'pedidos'), orderData);
      setSubmissionSuccess(true);
      setNombre('');
      setTelefono('');
      setPedido({
        huevos: { seleccionado: false, cantidad: 1 },
        aceite: { seleccionado: false, cantidad: 1 },
      });

    } catch (error) {
      console.error("Error al añadir el pedido: ", error);
      alert(t('submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-100 to-amber-200 flex flex-col items-center justify-center p-4">
      
      {/* CORRECCIÓN 3: Mensaje de confirmación mejorado para móviles */}
      {submissionSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-green-500 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center gap-4 text-center animate-fade-in-down w-full max-w-xs">
            <span className="text-5xl">✓</span>
            <h2 className="text-2xl font-bold">{t('orderSentSuccess')}</h2>
            <p className="text-sm">Te contactaremos pronto.</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
        <div className="text-center">
          {/* CORRECCIÓN 1: Título ajustado para móviles */}
          <h1 className="text-3xl md:text-4xl font-bold text-orange-600 flex items-center justify-center gap-2">
            <span>🥚</span>
            <span>{t('makeOrder')}</span>
            <span>🫒</span>
          </h1>
          <p className="text-gray-500">{t('eggsAndOil')}</p>
          <LanguageSwitcher />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">{t('yourNameLabel')}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">📦</span>
              {/* CORRECCIÓN 2: Texto del input más oscuro */}
              <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={t('yourNamePlaceholder')} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-800" required />
            </div>
          </div>
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">{t('yourPhoneLabel')}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">📞</span>
              {/* CORRECCIÓN 2: Texto del input más oscuro */}
              <input type="tel" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder={t('yourPhonePlaceholder')} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-800" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div onClick={() => handleSelectProducto('huevos')} className={`cursor-pointer border-2 rounded-lg p-4 text-center space-y-2 transition-all duration-200 ${pedido.huevos.seleccionado ? 'border-orange-500 bg-orange-50 shadow-lg scale-105' : 'border-gray-200 hover:border-orange-400'}`}>
              <span className="text-4xl md:text-5xl">🥚</span>
              <p className="font-semibold">{t('eggs')}</p>
              <p className="text-sm text-gray-600">{t('boxPrice')}</p>
              {pedido.huevos.seleccionado && <p className="text-green-600 font-bold">{t('selected')}</p>}
            </div>
            <div onClick={() => handleSelectProducto('aceite')} className={`cursor-pointer border-2 rounded-lg p-4 text-center space-y-2 transition-all duration-200 ${pedido.aceite.seleccionado ? 'border-orange-500 bg-orange-50 shadow-lg scale-105' : 'border-gray-200 hover:border-orange-400'}`}>
              <span className="text-4xl md:text-5xl">🫒</span>
              <p className="font-semibold">{t('oil')}</p>
              <p className="text-sm text-gray-600">{t('canPrice')}</p>
              {pedido.aceite.seleccionado && <p className="text-green-600 font-bold">{t('selected')}</p>}
            </div>
          </div>

          <div className="space-y-4 transition-opacity duration-500">
            {pedido.huevos.seleccionado && (
              <div className="bg-orange-50 p-3 rounded-md">
                <label htmlFor="cantidad-huevos" className="block text-sm font-medium text-gray-700">{t('quantityBoxes')}</label>
                <input type="number" id="cantidad-huevos" value={pedido.huevos.cantidad} onChange={(e) => handleCantidadChange('huevos', parseInt(e.target.value))} min="1" className="mt-1 w-full p-2 border border-orange-200 rounded-md" />
                <p className="text-xs text-gray-500 mt-1">{pedido.huevos.cantidad} {t('boxUnit')}s = {pedido.huevos.cantidad * 20} {t('eggsUnit')}</p>
              </div>
            )}
            
            {pedido.aceite.seleccionado && (
              <div className="bg-orange-50 p-3 rounded-md">
                <label htmlFor="cantidad-aceite" className="block text-sm font-medium text-gray-700">{t('quantityCans')}</label>
                <input type="number" id="cantidad-aceite" value={pedido.aceite.cantidad} onChange={(e) => handleCantidadChange('aceite', parseInt(e.target.value))} min="1" className="mt-1 w-full p-2 border border-orange-200 rounded-md" />
                <p className="text-xs text-gray-500 mt-1">{pedido.aceite.cantidad} {t('canUnit')}s = {pedido.aceite.cantidad * 3} {t('litersUnit')}</p>
              </div>
            )}
          </div>
          
          {totalPedido > 0 && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md space-y-2 transition-opacity duration-500">
              <h3 className="font-bold text-lg">{t('orderSummary')}</h3>
              {pedido.huevos.seleccionado && <div className="flex justify-between"><span>{t('eggs')} ({pedido.huevos.cantidad} x {PRECIOS.huevos}€)</span><span>{pedido.huevos.cantidad * PRECIOS.huevos}€</span></div>}
              {pedido.aceite.seleccionado && <div className="flex justify-between"><span>{t('oil')} ({pedido.aceite.cantidad} x {PRECIOS.aceite}€)</span><span>{pedido.aceite.cantidad * PRECIOS.aceite}€</span></div>}
              <hr className="border-green-300" />
              <div className="flex justify-between font-extrabold text-xl"><span>{t('total')}</span><span>{totalPedido}€</span></div>
            </div>
          )}

          <div>
            <button type="submit" disabled={isSubmitting} className={`w-full text-white font-bold text-lg py-3 px-6 rounded-lg shadow-md transition-transform ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 active:scale-95'}`}>
              {isSubmitting ? t('sending') : t('sendOrder')}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-400 space-x-4">
          <Link href="/admin" className="hover:underline">{t('adminPanel')}</Link>
          <Link href="/monitor" className="hover:underline">{t('realtimeMonitor')}</Link>
        </div>
      </div>
    </main>
  );
}