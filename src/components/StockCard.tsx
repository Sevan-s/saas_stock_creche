import React, { useState, useEffect } from 'react';
import { Plus, Minus, AlertTriangle, Package, MapPin, Check, Clock } from 'lucide-react';
import type { Item } from '../types';

interface StockCardProps {
  item: Item;
  isOrdered?: boolean; 
  onAdjustStock: (id: string, newQuantity: number) => Promise<void>;
}

export const StockCard: React.FC<StockCardProps> = ({ item, isOrdered = false, onAdjustStock }) => {
  const [updating, setUpdating] = useState<boolean>(false);

  const serverQuantity = Number(item.quantite ?? 0);
  const [tempQuantity, setTempQuantity] = useState<number>(serverQuantity);

  useEffect(() => {
    setTempQuantity(serverQuantity);
  }, [serverQuantity]);

  const minThreshold = Number(item.seuilAlerte ?? 0);
  const isLowStock = tempQuantity <= minThreshold;
  const isModified = tempQuantity !== serverQuantity;
  const categoryName =
    typeof item.categorie === 'object' && item.categorie !== null
      ? item.categorie.nom
      : 'Général';

  const handleLocalAdjust = (delta: number) => {
    setTempQuantity((prev) => Math.max(0, prev + delta));
  };

  const handleSave = async () => {
    if (updating || !isModified) return;

    setUpdating(true);
    try {
      await onAdjustStock(item._id, tempQuantity);
    } catch (error) {
      setTempQuantity(serverQuantity);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md ${
        isLowStock ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {categoryName}
          </span>
          {isOrdered && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-700 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" /> En attente de livraison
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-800 line-clamp-1" title={item.nom}>
          {item.nom}
        </h3>
        <div className="mt-2 space-y-1 text-xs text-slate-500">
          {item.emplacement && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.emplacement}</span>
            </div>
          )}
          {item.unite && (
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Unité : {item.unite}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-black ${
                isLowStock ? 'text-amber-600' : 'text-slate-800'
              }`}
            >
              {tempQuantity}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / min {minThreshold}
            </span>
          </div>
          {isLowStock && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-0.5">
              <AlertTriangle className="w-3 h-3 shrink-0" /> Stock bas
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleLocalAdjust(-1)}
              disabled={updating || tempQuantity <= 0}
              className="w-9 h-9 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 active:scale-95 disabled:opacity-40 transition-all shadow-sm"
              aria-label="Diminuer la quantité"
            >
              <Minus className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              type="button"
              onClick={() => handleLocalAdjust(1)}
              disabled={updating}
              className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-700 active:scale-95 disabled:opacity-40 transition-all shadow-sm"
              aria-label="Augmenter la quantité"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
          {isModified && (
            <button
              type="button"
              onClick={handleSave}
              disabled={updating}
              className="w-full h-8 px-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm animate-in fade-in zoom-in duration-150"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              Valider
            </button>
          )}
        </div>
      </div>
    </div>
  );
};