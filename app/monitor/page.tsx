// app/monitor/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { type Pedido } from '../admin/page'; // Reutilizamos el tipo Pedido que ya definimos
import { useTranslation } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function MonitorPage() {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("fechaPedido", "desc"));
    
    // onSnapshot establece la escucha en tiempo real
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

  // El cálculo de estadísticas no cambia
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
      <header className="bg-black/30 backdrop-blur-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-wider">
            <span className="animate-pulse">📊</span> {t('monitorTitle')}
          </h1>
          <p className="text-sm text-purple-300">{t('autoUpdate')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Link href="/admin" className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700">
            {t('goToAdmin')}
          </Link>
        </div>
      </header>

      <main className="p-4 md-p-8">
        {/* Panel de Métricas (sin cambios) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-xl shadow-lg"><h2 className="font-semibold">{t('totalOrders')}</h2><p className="text-5xl font-extrabold mt-2">{estadisticas.totalPedidos}</p></div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-xl shadow-lg"><h2 className="font-semibold">{t('delivered')}</h2><p className="text-5xl font-extrabold mt-2">{estadisticas.entregados}</p></div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-6 rounded-xl shadow-lg"><h2 className="font-semibold">{t('pendingEggBoxes')}</h2><p className="text-5xl font-extrabold mt-2">{estadisticas.cajasHuevosPendientes}</p></div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-700 p-6 rounded-xl shadow-lg"><h2 className="font-semibold">{t('pendingOilCans')}</h2><p className="text-5xl font-extrabold mt-2">{estadisticas.garrafasAceitePendientes}</p></div>
        </div>

        {/* Lista de Pedidos Recientes */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">{t('recentOrders')}</h2>
          {loading ? <p className="text-center">{t('loadingOrders')}</p> : (
            <div className="space-y-4">
              {pedidos.map(pedido => (
                // Tarjeta de Pedido Individual
                <div key={pedido.id} className={`bg-white/10 backdrop-blur-md rounded-lg p-4 border transition-all duration-300 ${pedido.estado === 'entregado' ? 'border-green-500/50 opacity-60' : 'border-purple-500/50'}`}>
                  {/* Cabecera de la tarjeta */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{pedido.estado === 'entregado' ? '✅' : '⏳'}</span>
                      <div>
                        <p className={`font-bold text-lg ${pedido.estado === 'entregado' ? 'line-through' : ''}`}>{pedido.cliente}</p>
                        <p className="text-sm text-gray-300">{pedido.telefono}</p>
                      </div>
                    </div>
                    <span className={`py-1 px-3 rounded-full text-xs font-bold ${pedido.pagado ? 'bg-green-400/80 text-green-900' : 'bg-orange-400/80 text-orange-900'}`}>
                      {pedido.pagado ? `💰 ${t('paid')}` : `⏰ ${t('pending')}`}
                    </span>
                  </div>

                  {/* --- NUEVO: DETALLES DE PRODUCTOS --- */}
                  <div className="space-y-2 border-t border-white/10 pt-3">
                    {pedido.productos.huevos && (
                      <div className="bg-black/20 p-2 rounded-md flex justify-between items-center text-sm">
                        <div><span className="mr-2">🥚</span><span>{pedido.productos.huevos.cantidad} {t('boxUnit', {count: pedido.productos.huevos.cantidad})}s</span></div>
                        <span className="font-semibold">{pedido.productos.huevos.precioTotal}€</span>
                      </div>
                    )}
                    {pedido.productos.aceite && (
                      <div className="bg-black/20 p-2 rounded-md flex justify-between items-center text-sm">
                        <div><span className="mr-2">🍾</span><span>{pedido.productos.aceite.cantidad} {t('canUnit', {count: pedido.productos.aceite.cantidad})}s</span></div>
                        <span className="font-semibold">{pedido.productos.aceite.precioTotal}€</span>
                      </div>
                    )}
                  </div>
                  
                  {/* --- NUEVO: TOTAL DEL PEDIDO --- */}
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