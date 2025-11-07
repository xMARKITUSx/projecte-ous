// app/admin/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { db, app } from '@/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { getAuth, signOut } from "firebase/auth";
import Link from 'next/link';
import Modal from '@/components/Modal';
import { useTranslation } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ProtectedRoute from '@/components/ProtectedRoute';

export type Pedido = {
  id: string;
  cliente: string;
  telefono: string;
  total: number;
  estado: 'pendiente' | 'entregado';
  pagado: boolean;
  fechaPedido: Timestamp;
  productos: {
    huevos: { cantidad: number; precioTotal: number; unidades: number } | null;
    aceite: { cantidad: number; precioTotal: number; litros: number } | null;
  };
};

function AdminPageContent() {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [pedidoParaEliminar, setPedidoParaEliminar] = useState<Pedido | null>(null);

  const fetchPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "pedidos"), orderBy("fechaPedido", "desc"));
      const querySnapshot = await getDocs(q);
      const pedidosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Pedido[];
      setPedidos(pedidosData);
    } catch (err) {
      console.error("Error al obtener los pedidos: ", err);
      setError("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const estadisticas = useMemo(() => {
    const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
    const totalCajasHuevos = pedidosPendientes.reduce((sum, p) => sum + (p.productos.huevos?.cantidad || 0), 0);
    const totalGarrafasAceite = pedidosPendientes.reduce((sum, p) => sum + (p.productos.aceite?.cantidad || 0), 0);
    return {
      pedidosPendientes: pedidosPendientes.length,
      cajasHuevos: totalCajasHuevos,
      garrafasAceite: totalGarrafasAceite,
    };
  }, [pedidos]);

  const handleToggleEstado = async (id: string, estadoActual: 'pendiente' | 'entregado') => {
    const nuevoEstado = estadoActual === 'pendiente' ? 'entregado' : 'pendiente';
    const pedidoDoc = doc(db, 'pedidos', id);
    await updateDoc(pedidoDoc, { estado: nuevoEstado });
    setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
  };

  const handleTogglePagado = async (id: string, pagadoActual: boolean) => {
    const nuevoEstadoPagado = !pagadoActual;
    const pedidoDoc = doc(db, 'pedidos', id);
    await updateDoc(pedidoDoc, { pagado: nuevoEstadoPagado });
    setPedidos(pedidos.map(p => p.id === id ? { ...p, pagado: nuevoEstadoPagado } : p));
  };

  const handleConfirmDelete = async () => {
    if (!pedidoParaEliminar) return;
    const pedidoDoc = doc(db, 'pedidos', pedidoParaEliminar.id);
    await deleteDoc(pedidoDoc);
    setPedidos(pedidos.filter(p => p.id !== pedidoParaEliminar.id));
    setPedidoParaEliminar(null);
  };

  const handleDeleteAllPedidos = async () => {
    const pedidosCollectionRef = collection(db, 'pedidos');
    const querySnapshot = await getDocs(pedidosCollectionRef);
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => { batch.delete(doc.ref); });
    await batch.commit();
    setPedidos([]);
    setShowDeleteAllModal(false);
  };

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="flex flex-wrap justify-between items-center gap-y-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 whitespace-nowrap">📦 {t('orderManagement')}</h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={handleLogout} className="bg-gray-500 text-white font-semibold py-2 px-3 text-xs sm:text-sm rounded-lg hover:bg-gray-600 transition-transform active:scale-95">
              Cerrar Sesión
            </button>
            <LanguageSwitcher />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-end items-center gap-2">
            <Link href="/monitor" className="bg-purple-500 text-white font-semibold py-2 px-3 text-xs sm:text-sm rounded-lg hover:bg-purple-600 flex items-center gap-2 transition-transform active:scale-95">
              <span>📊</span>
              <span className="hidden sm:inline">{t('realtimeMonitor')}</span>
            </Link>
            {!loading && pedidos.length > 0 && (
              <button onClick={() => setShowDeleteAllModal(true)} className="bg-red-500 text-white font-semibold py-2 px-3 text-xs sm:text-sm rounded-lg hover:bg-red-600 transition-transform active:scale-95">
                {t('deleteAll')}
              </button>
            )}
            <Link href="/" className="bg-gray-200 text-gray-700 font-semibold py-2 px-3 text-xs sm:text-sm rounded-lg hover:bg-gray-300 transition-transform active:scale-95">
              {t('backToForm')}
            </Link>
        </div>
      </header>
      <main className="p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <h2 className="font-semibold text-lg">{t('pendingOrders')}</h2>
            <p className="text-5xl font-extrabold mt-2">{estadisticas.pedidosPendientes}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <h2 className="font-semibold text-lg">{t('pendingEggBoxes')}</h2>
            <p className="text-5xl font-extrabold mt-2">{estadisticas.cajasHuevos}</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <h2 className="font-semibold text-lg">{t('pendingOilCans')}</h2>
            <p className="text-5xl font-extrabold mt-2">{estadisticas.garrafasAceite}</p>
          </div>
        </div>
        <div className="mt-8">
          {loading && <p className="text-center text-gray-500">{t('loadingOrders')}</p>}
          {error && <p className="text-center text-red-500 font-semibold">{error}</p>}
          {!loading && !error && pedidos.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500"><span className="text-6xl">📭</span><h2 className="mt-4 text-2xl font-semibold">{t('noOrdersYet')}</h2><p className="mt-2">{t('newOrdersAppearHere')}</p></div>
          )}
          {!loading && !error && pedidos.length > 0 && (
            <div className="space-y-4">
              {pedidos.map(pedido => (
                <div key={pedido.id} className={`rounded-lg shadow-md p-4 transition-colors duration-300 ${pedido.estado === 'entregado' ? 'bg-gray-200' : 'bg-white'}`}>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start border-b pb-3 mb-3 gap-4">
                    <div className="flex items-start space-x-3 w-full">
                      <input type="checkbox" checked={pedido.estado === 'entregado'} onChange={() => handleToggleEstado(pedido.id, pedido.estado)} className="mt-1 h-6 w-6 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer flex-shrink-0" />
                      <div className="flex-grow">
                        <p className={`font-bold text-lg text-gray-900 ${pedido.estado === 'entregado' ? 'line-through' : ''}`}>{pedido.cliente}</p>
                        <p className="text-sm text-gray-600">{pedido.telefono}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                      <button onClick={() => handleTogglePagado(pedido.id, pedido.pagado)} className={`py-1 px-3 rounded-full text-sm font-semibold transition-transform active:scale-95 whitespace-nowrap ${pedido.pagado ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-orange-100 text-orange-800 hover:bg-orange-200'}`}>
                        {pedido.pagado ? `✅ ${t('paid')}` : `💳 ${t('pending')}`}
                      </button>
                      <button onClick={() => setPedidoParaEliminar(pedido)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-transform active:scale-95" title="Eliminar pedido">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {pedido.productos.huevos && (
                      <div className="bg-orange-50 p-2 rounded-md flex justify-between items-center">
                        <div>
                          <span className="text-2xl mr-2">🥚</span>
                          <span>{pedido.productos.huevos.cantidad} {t('boxUnit')}s <span className="text-gray-600 font-semibold text-sm">({pedido.productos.huevos.unidades} uds)</span></span>
                        </div>
                        <span className="font-bold">{pedido.productos.huevos.precioTotal}€</span>
                      </div>
                    )}
                    {pedido.productos.aceite && (
                      <div className="bg-green-50 p-2 rounded-md flex justify-between items-center">
                        <div>
                          <span className="text-2xl mr-2">🫒</span>
                          <span>{pedido.productos.aceite.cantidad} {t('canUnit')}s <span className="text-gray-600 font-semibold text-sm">({pedido.productos.aceite.litros} L)</span></span>
                        </div>
                        <span className="font-bold">{pedido.productos.aceite.precioTotal}€</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-green-600 text-white font-bold text-lg p-2 mt-2 rounded-md text-right">{t('totalToPay')}: {pedido.total}€</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Modal isOpen={showDeleteAllModal} onClose={() => setShowDeleteAllModal(false)}><div className="space-y-4"><span className="text-5xl">⚠️</span><h2 className="text-2xl font-bold text-gray-900">¿Estás seguro?</h2><p className="text-gray-600">Esta acción eliminará permanentemente <strong>TODOS</strong> los pedidos.</p><div className="flex justify-center space-x-4 pt-4"><button onClick={handleDeleteAllPedidos} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600">Sí, borrar todos</button><button onClick={() => setShowDeleteAllModal(false)} className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-400">Cancelar</button></div></div></Modal>
      <Modal isOpen={!!pedidoParaEliminar} onClose={() => setPedidoParaEliminar(null)}><div className="space-y-4"><span className="text-5xl">🗑️</span><h2 className="text-2xl font-bold text-gray-900">Confirmar Eliminación</h2><p className="text-gray-600">¿Seguro que quieres eliminar el pedido de <strong>{pedidoParaEliminar?.cliente}</strong>?<br />Esta acción no se puede deshacer.</p><div className="flex justify-center space-x-4 pt-4"><button onClick={handleConfirmDelete} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600">Sí, eliminar</button><button onClick={() => setPedidoParaEliminar(null)} className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-400">Cancelar</button></div></div></Modal>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminPageContent />
    </ProtectedRoute>
  );
}