import React, { useState } from 'react';
import API from '../api/axios';
import type { Category } from '../types';
import { X, PackagePlus, AlertCircle } from 'lucide-react';

interface AddItemModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  categories,
  isOpen,
  onClose,
  onItemAdded,
}) => {
  const [nom, setNom] = useState('');
  const [categorieId, setCategorieId] = useState('');
  const [quantite, setQuantite] = useState<number>(0);
  const [seuilAlerte, setSeuilAlerte] = useState<number>(5);
  const [unite, setUnite] = useState('unités');
  const [emplacement, setEmplacement] = useState('Réserve centrale');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !categorieId) {
      setError('Veuillez remplir le nom et choisir une catégorie.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await API.post('/items', {
        nom,
        categorie: categorieId,
        quantite,
        seuilAlerte,
        unite,
        emplacement,
      });

      setNom('');
      setQuantite(0);
      setSeuilAlerte(5);
      onItemAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'article.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <PackagePlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Ajouter un article</h2>
              <p className="text-xs text-slate-500">Créer une nouvelle référence en réserve</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Nom du produit *
            </label>
            <input
              type="text"
              placeholder="ex: Couches Taille 3, Sérum phy..."
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Catégorie *
            </label>
            <select
              value={categorieId}
              onChange={(e) => setCategorieId(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 transition-all bg-white"
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Stock initial
              </label>
              <input
                type="number"
                min="0"
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Seuil d'alerte
              </label>
              <input
                type="number"
                min="0"
                value={seuilAlerte}
                onChange={(e) => setSeuilAlerte(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Unité
              </label>
              <input
                type="text"
                placeholder="unités, paquets, briques..."
                value={unite}
                onChange={(e) => setUnite(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Emplacement
              </label>
              <input
                type="text"
                placeholder="Réserve, Section Bébés..."
                value={emplacement}
                onChange={(e) => setEmplacement(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 transition-all"
              />
            </div>
          </div>
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center justify-center min-w-[120px]"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};