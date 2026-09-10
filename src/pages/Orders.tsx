import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import type { Order, StatutCommande, Item } from '../types';
import { 
  ShoppingBag, RefreshCw, CheckCircle2, Clock, Truck, 
  AlertCircle, PlusCircle, Minus, Plus, Building2, Calendar, PackageCheck, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ExtendedItem extends Item {
  derniereCommandeDate?: string;
  fournisseur?: string;
}

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const canOrder = user?.role === 'ADMIN_CRECHE' || user?.role === 'DIRECTION';
  const [activeTab, setActiveTab] = useState<'orders' | 'reorder'>('reorder');
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<ExtendedItem[]>([]);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, itemsRes] = await Promise.all([
        API.get<Order[]>('/orders'),
        API.get<ExtendedItem[]>('/items')
      ]);

      setOrders(ordersRes.data);
      setItems(itemsRes.data);

      const initialQty: Record<string, number> = {};
      itemsRes.data.forEach((item) => {
        initialQty[item._id] = item.seuilAlerte ? Math.max(1, item.seuilAlerte) : 1;
      });
      setOrderQuantities(initialQty);
    } catch (err) {
      setError('Impossible de charger les données de réapprovisionnement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuantityChange = (itemId: string, delta: number) => {
    setOrderQuantities((prev) => {
      const current = prev[itemId] || 1;
      const nextValue = Math.max(1, current + delta);
      return { ...prev, [itemId]: nextValue };
    });
  };

  const getActiveOrderForItem = (itemId: string) => {
    return orders.find(
      (o) =>
        o.statut !== 'RECUE' &&
        o.items.some((i) => (typeof i.item === 'object' ? i.item?._id : i.item) === itemId)
    );
  };

  const handlePlaceSingleOrder = async (item: ExtendedItem) => {
    if (!canOrder) return;
    const qty = orderQuantities[item._id] || 1;
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/orders', {
        items: [{ item: item._id, quantiteCommandee: qty }],
        fournisseur: item.fournisseur || 'Fournisseur Général'
      });

      setSuccess(`Commande passée pour ${qty}x "${item.nom}" !`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la validation de la commande.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliverSingleItem = async (item: ExtendedItem, pendingOrder?: Order) => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      if (pendingOrder) {
        const itemsRecus = pendingOrder.items.map((i) => ({
          item: typeof i.item === 'object' ? i.item._id : i.item,
          quantiteRecue: i.quantiteCommandee,
        }));
        await API.post(`/orders/${pendingOrder._id}/receive`, { itemsRecus });
      } else {
        const qty = orderQuantities[item._id] || 1;
        await API.patch(`/items/${item._id}/adjust`, { delta: qty });
      }

      setSuccess(`Livraison enregistrée. Stock de "${item.nom}" mis à jour !`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la livraison.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoGenerate = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await API.post<Order>('/orders/auto-generate');
      setSuccess(`Commande ${data.numeroCommande} générée automatiquement !`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la génération automatique.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidateOrder = async (id: string) => {
    setActionLoading(true);
    try {
      await API.patch(`/orders/${id}/status`, { statut: 'VALIDEE' });
      setSuccess('Commande passée au statut Validée !');
      await fetchData();
    } catch (err) {
      setError('Erreur lors de la validation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveOrder = async (order: Order) => {
    if (!window.confirm(`Confirmer la réception de la commande ${order.numeroCommande} ?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const itemsRecus = order.items.map((i) => ({
        item: typeof i.item === 'object' ? i.item._id : i.item,
        quantiteRecue: i.quantiteCommandee,
      }));

      await API.post(`/orders/${order._id}/receive`, { itemsRecus });
      setSuccess(`Commande ${order.numeroCommande} réceptionnée. Stocks mis à jour !`);
      await fetchData();
    } catch (err) {
      setError('Erreur lors de la réception de la commande.');
    } finally {
      setActionLoading(false);
    }
  };

  const getLastOrderDate = (itemId: string) => {
    const matchingOrders = orders.filter((o) =>
      o.items.some((i) => (typeof i.item === 'object' ? i.item?._id : i.item) === itemId)
    );

    if (matchingOrders.length === 0) return 'Aucune commande';

    const latest = matchingOrders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return new Date(latest.createdAt).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (statut: StatutCommande) => {
    switch (statut) {
      case 'BROUILLON':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700"><Clock className="w-3.5 h-3.5" /> Brouillon</span>;
      case 'VALIDEE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"><Truck className="w-3.5 h-3.5" /> En cours</span>;
      case 'RECUE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Reçue</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{statut}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Commandes & Réapprovisionnement</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gérez vos commandes d'articles et réapprovisionnez la réserve
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleAutoGenerate}
            disabled={actionLoading}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Générer Auto-Commande</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 transition-all shrink-0"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>
      <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200 w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('reorder')}
          className={`flex-1 sm:flex-none justify-center px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'reorder'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PackageCheck className="w-4 h-4" /> Passer une commande
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 sm:flex-none justify-center px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Historique ({orders.length})
        </button>
      </div>
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> {success}
        </div>
      )}
      {activeTab === 'reorder' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Aucun produit trouvé dans le catalogue.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const stockActuel = item.quantite ?? item.quantiteActuelle ?? 0;
                const estStockBas = stockActuel <= (item.seuilAlerte || 5);
                const activeOrder = getActiveOrderForItem(item._id);
                const isOrdered = Boolean(activeOrder);
                const orderQty = isOrdered 
                  ? activeOrder?.items.find((i) => (typeof i.item === 'object' ? i.item?._id : i.item) === item._id)?.quantiteCommandee || 1
                  : (orderQuantities[item._id] || 1);
                return (
                  <div
                    key={item._id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-base truncate">{item.nom}</h3>
                        {estStockBas && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-700 uppercase tracking-wider shrink-0">
                            Stock Bas
                          </span>
                        )}
                        {isOrdered && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-700 uppercase tracking-wider flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" /> En attente de livraison
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          Stock actuel : <strong className={estStockBas ? 'text-rose-600' : 'text-slate-800'}>{stockActuel} {item.unite}</strong>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {item.fournisseur || 'Fournisseur principal'}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          Dernière commande : {getLastOrderDate(item._id)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                        <button
                          type="button"
                          disabled={isOrdered || actionLoading}
                          onClick={() => handleQuantityChange(item._id, -1)}
                          className="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-200 transition-all shadow-xs disabled:opacity-40"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-slate-800">
                          {orderQty}
                        </span>
                        <button
                          type="button"
                          disabled={isOrdered || actionLoading}
                          onClick={() => handleQuantityChange(item._id, 1)}
                          className="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-200 transition-all shadow-xs disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={!canOrder || isOrdered || actionLoading}
                        onClick={() => handlePlaceSingleOrder(item)}
                        title={!canOrder ? "Action réservée aux rôles ADMIN_CRECHE et DIRECTION" : undefined}
                        className={`flex-1 md:flex-none justify-center px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${
                          !canOrder || isOrdered
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isOrdered ? 'Commandé' : 'Commander'}
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleDeliverSingleItem(item, activeOrder)}
                        className="flex-1 md:flex-none justify-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Livré
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {activeTab === 'orders' && (
        <div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Aucune commande enregistrée pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-800 text-lg">{order.numeroCommande}</span>
                      {getStatusBadge(order.statut)}
                    </div>
                    <div className="text-xs text-slate-400">
                      Créée par <span className="font-semibold text-slate-600">{order.creePar?.prenom} {order.creePar?.nom}</span> le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Articles commandés :</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {order.items.map((i, index) => {
                        const itemName = typeof i.item === 'object' && i.item !== null ? i.item.nom : 'Article inconnu';
                        const unit = typeof i.item === 'object' && i.item !== null ? i.item.unite : '';
                        return (
                          <div key={index} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs flex justify-between items-center">
                            <span className="font-medium text-slate-700 truncate">{itemName}</span>
                            <span className="font-bold text-indigo-600 ml-2 shrink-0">x{i.quantiteCommandee} {unit}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    {order.statut === 'BROUILLON' && (
                      <button
                        onClick={() => handleValidateOrder(order._id)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                      >
                        Valider la commande
                      </button>
                    )}
                    {order.statut === 'VALIDEE' && (
                      <button
                        onClick={() => handleReceiveOrder(order)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Réceptionner & Recréditer Stock
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};