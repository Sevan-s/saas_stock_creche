import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import type { ActivityLog } from '../types';
import { History, RefreshCw, PlusCircle, MinusCircle, ShoppingCart, ArrowRightLeft, User, FolderPlus, FolderMinus, Package, CheckCircle2, Send } from 'lucide-react';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get<ActivityLog[]>('/logs');
      setLogs(data);
    } catch (err) {
      setError("Impossible de charger l'historique des activités.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getItemName = (log: ActivityLog) => {
    if (log.item?.nom) return log.item.nom;
    const match = log.detail?.match(/"([^"]+)"/);
    if (match && match[1]) return match[1];
    if (log.action.includes('CATEGORIE')) return 'Catégorie';
    if (log.action.includes('ARTICLE')) return 'Article';
    return 'Élément';
  };

const getActionBadge = (action: string) => {
  switch (action) {
    case 'ENTREE_STOCK':
    case 'AJUSTEMENT_POSITIF':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <PlusCircle className="w-3.5 h-3.5" /> Entrée
        </span>
      );
    case 'SORTIE_STOCK':
    case 'AJUSTEMENT_NEGATIF':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <MinusCircle className="w-3.5 h-3.5" /> Sortie
        </span>
      );
    case 'CREATION_COMMANDE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <ShoppingCart className="w-3.5 h-3.5" /> Commande (Brouillon)
        </span>
      );
    case 'COMMANDE_PASSEE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Send className="w-3.5 h-3.5" /> Commande passée
        </span>
      );
    case 'RECEPTION_COMMANDE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" /> Commande reçue
        </span>
      );
    case 'CREATION_CATEGORIE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <FolderPlus className="w-3.5 h-3.5" /> Catégorie +
        </span>
      );
    case 'SUPPRESSION_CATEGORIE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <FolderMinus className="w-3.5 h-3.5" /> Catégorie -
        </span>
      );
    case 'CREATION_ARTICLE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Package className="w-3.5 h-3.5" /> Article +
        </span>
      );
    case 'SUPPRESSION_ARTICLE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <Package className="w-3.5 h-3.5" /> Article -
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <ArrowRightLeft className="w-3.5 h-3.5" /> Action
        </span>
      );
  }
};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Historique des Activités</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Suivi en temps réel de tous les mouvements de stock, catégories et commandes
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 self-start sm:self-auto text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 transition-all"
          title="Rafraîchir"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-center font-medium">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-16 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Aucune activité enregistrée pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {logs.map((log) => {
            const userName = log.utilisateur
              ? `${log.utilisateur.prenom} ${log.utilisateur.nom}`
              : 'Système';

            const name = getItemName(log);

            return (
              <div key={log._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-all">
                <div className="flex items-start sm:items-center gap-3">
                  {getActionBadge(log.action)}
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {name}{' '}
                      {log.quantiteAjustee !== undefined && log.quantiteAjustee !== 0 && (
                        <span className={log.quantiteAjustee > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          ({log.quantiteAjustee > 0 ? `+${log.quantiteAjustee}` : log.quantiteAjustee})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{log.detail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 self-end sm:self-auto">
                  <div className="flex items-center gap-1 font-medium text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{userName}</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(log.createdAt).toLocaleString('fr-FR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};