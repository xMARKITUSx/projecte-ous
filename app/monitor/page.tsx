// app/monitor/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { type Pedido } from '../admin/page';
import { useTranslation } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ProtectedRoute from '@/components/ProtectedRoute';

function MonitorPageContent() {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("fechaPedido", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const pedidosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Pedido[];
      setPedidos(pedidosData);
      setLoading(false);
    }, (error) => {
      console.error("Error al escuchar los pedidos: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const estadisticas = useMemo(() => {
    const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
    const totalCajasHuevos = pedidosPendientes.reduce((sum, p) => sum + (p.productos.huevos?.cantidad || 0), 0);
    const totalGarrafasAceite = pedidosPendientes.reduce((sum, p) => sum + (p.productos.aceite?.cantidad || 0), 0);
    return {
      totalPedidos: pedidos.length,
      entregados: pedidos.length - pedidosPendientes.length,
      cajasHuevosPendientes: totalCajasHuevos,
      garrafasAceitePendientes: totalGarrafasAceite,
    };
  }, [pedidos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white font-sans">
      <header className="bg-black/30 backdrop-blur-sm p-4 flex flex-wrap justify-between items-center sticky top-0 z-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider">
            <span className="animate-pulse">📊</span> {t('monitorTitle')}
          </h1>
          <p className="text-sm text-purple-300">{t('autoUpdate')}</p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <LanguageSwitcher />
          <Link href="/admin" className="bg-purple-600 text-white font-semibold py-2 px-3 text-sm md:px-4 rounded-lg hover:bg-purple-700 transition-transform active:scale-95">
            {t('goToAdmin')}
          </Link>
        </div>
      </header>
      <main className="p-4 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-xl shadow-lg text-center md:text-left">
            <h2 className="font-semibold text-sm">{t('totalOrders')}</h2>
            <p className="text-4xl md:text-5xl font-extrabold mt-1">{estadisticas.totalPedidos}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-xl shadow-lg text-center md:text-left">
            <h2 className="font-semibold text-sm">{t('delivered')}</h2>
            <p className="text-4xl md:text-5xl font-extrabold mt-1">{estadisticas.entregados}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-4 rounded-xl shadow-lg text-center md:text-left">
            <h2 className="font-semibold text-sm">{t('pendingEggBoxes')}</h2>
            <p className="text-4xl md:text-5xl font-extrabold mt-1">{estadisticas.cajasHuevosPendientes}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-700 p-4 rounded-xl shadow-lg text-center md:text-left">
            <h2 className="font-semibold text-sm">{t('pendingOilCans')}</h2>
            <p className="text-4xl md:text-5xl font-extrabold mt-1">{estadisticas.garrafasAceitePendientes}</p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">{t('recentOrders')}</h2>
          {loading ? (
            <p className="text-center">{t('loadingOrders')}</p>
          ) : (
            <div className="space-y-4">
              {pedidos.map(pedido => (
                <div key={pedido.id} className={`bg-white/10 backdrop-blur-md rounded-lg p-4 border transition-all duration-300 ${pedido.estado === 'entregado' ? 'border-green-500/50 opacity-60' : 'border-purple-500/50'}`}>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{pedido.estado === 'entregado' ? '✅' : '⏳'}</span>
                      <div>
                        <p className={`font-bold text-lg ${pedido.estado === 'entregado' ? 'line-through' : ''}`}>{pedido.cliente}</p>
                        <p className="text-sm text-gray-300">{pedido.telefono}</p>
                      </div>
                    </div>
                    <span className={`py-1 px-3 rounded-full text-xs font-bold self-start sm:self-center whitespace-nowrap ${pedido.pagado ? 'bg-green-400/80 text-green-900' : 'bg-orange-400/80 text-orange-900'}`}>
                      {pedido.pagado ? `💰 ${t('paid')}` : `⏰ ${t('pending')}`}
                    </span>
                  </div>
                  <div className="space-y-2 border-t border-white/10 pt-3">
                    {pedido.productos.huevos && (
                      <div className="bg-black/20 p-2 rounded-md flex justify-between items-center text-sm">
                        <div><span className="mr-2">🥚</span><span>{pedido.productos.huevos.cantidad} {t('boxUnit')}s</span></div>
                        <span className="font-semibold">{pedido.productos.huevos.precioTotal}€</span>
                      </div>
                    )}
                    {pedido.productos.aceite && (
                      <div className="bg-black/20 p-2 rounded-md flex justify-between items-center text-sm">
                        <div><span className="mr-2">🫒</span><span>{pedido.productos.aceite.cantidad} {t('canUnit')}s</span></div>
                        <span className="font-semibold">{pedido.productos.aceite.precioTotal}€</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-white/20 text-white font-bold text-md p-2 mt-3 rounded-md text-right">
                    {t('total')}: {pedido.total}€
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MonitorPage() {
  return (
    <ProtectedRoute>
      <MonitorPageContent />
    </ProtectedRoute>
  );
}