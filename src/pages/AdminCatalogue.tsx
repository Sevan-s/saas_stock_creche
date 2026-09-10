import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FolderPlus, PackagePlus, AlertCircle, CheckCircle2, Trash2, ArrowUpDown } from 'lucide-react';
import API from '../api/axios';

interface Categorie {
    _id: string;
    nom: string;
    creche?: string;
}

interface Produit {
    _id: string;
    nom: string;
    categorie: Categorie | string;
    fournisseur?: string;
    quantite: number;
    seuilAlerte: number;
    unite?: string;
}

type SortOption = 'nom' | 'categorie' | 'fournisseur' | 'quantite';

export const AdminCatalogue: React.FC = () => {
    const [categories, setCategories] = useState<Categorie[]>([]);
    const [produits, setProduits] = useState<Produit[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [nomCategorie, setNomCategorie] = useState('');
    const [nomProduit, setNomProduit] = useState('');
    const [categorieId, setCategorieId] = useState('');
    const [fournisseur, setFournisseur] = useState('');
    const [quantite, setQuantite] = useState<number | ''>(0);
    const [seuilAlerte, setSeuilAlerte] = useState<number | ''>(5);
    const [unite, setUnite] = useState('unité');
    const [sortBy, setSortBy] = useState<SortOption>('nom');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resCat, resProd] = await Promise.all([
                API.get('/categories'),
                API.get('/items')
            ]);

            const cats = Array.isArray(resCat.data) ? resCat.data : (resCat.data.categories || []);
            const prods = Array.isArray(resProd.data) ? resProd.data : (resProd.data.items || []);

            setCategories(cats);
            setProduits(prods);

            if (cats.length > 0 && !categorieId) {
                setCategorieId(cats[0]._id);
            }
        } catch (err: any) {
            console.error('Erreur lors du chargement des données:', err);
            setMessage({ type: 'error', text: 'Erreur lors de la récupération des données.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (categories.length > 0 && !categorieId) {
            setCategorieId(categories[0]._id);
        }
    }, [categories]);

    const fournisseursExistants = useMemo(() => {
        const setFournisseurs = new Set<string>();
        produits.forEach(p => {
            if (p.fournisseur && p.fournisseur.trim() !== '') {
                setFournisseurs.add(p.fournisseur.trim());
            }
        });
        return Array.from(setFournisseurs).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    }, [produits]);

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nomCategorie.trim()) return;

        try {
            await API.post('/categories', { nom: nomCategorie });
            setMessage({ type: 'success', text: 'Catégorie ajoutée avec succès.' });
            setNomCategorie('');
            fetchData();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la création.' });
        }
    };

    const handleDeleteCategory = async (id: string, nom: string) => {
        if (!window.confirm(`Supprimer la catégorie "${nom}" ?`)) return;

        try {
            await API.delete(`/categories/${id}`);
            setMessage({ type: 'success', text: 'Catégorie supprimée.' });
            fetchData();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la suppression.' });
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nomProduit.trim() || !categorieId) return;

        try {
            await API.post('/items', {
                nom: nomProduit,
                categorie: categorieId,
                fournisseur,
                quantite: Number(quantite) || 0,
                seuilAlerte: Number(seuilAlerte) || 0,
                unite
            });

            setMessage({ type: 'success', text: 'Article ajouté au catalogue.' });
            
            setNomProduit('');
            setFournisseur('');
            setQuantite(0);
            setSeuilAlerte(5);
            setUnite('unité');

            fetchData();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la création.' });
        }
    };

    const handleDeleteProduct = async (id: string, nom: string) => {
        if (!window.confirm(`Supprimer l'article "${nom}" ?`)) return;

        try {
            await API.delete(`/items/${id}`);
            setMessage({ type: 'success', text: 'Article supprimé.' });
            fetchData();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la suppression.' });
        }
    };

    const sortedProduits = useMemo(() => {
        return [...produits].sort((a, b) => {
            if (sortBy === 'categorie') {
                const catA = (typeof a.categorie === 'object' ? a.categorie?.nom : 'Général') || '';
                const catB = (typeof b.categorie === 'object' ? b.categorie?.nom : 'Général') || '';
                return catA.localeCompare(catB, 'fr', { sensitivity: 'base' });
            }

            if (sortBy === 'fournisseur') {
                const fourA = a.fournisseur || 'ZZZZ';
                const fourB = b.fournisseur || 'ZZZZ';
                return fourA.localeCompare(fourB, 'fr', { sensitivity: 'base' });
            }

            if (sortBy === 'quantite') {
                return (a.quantite || 0) - (b.quantite || 0);
            }

            return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
        });
    }, [produits, sortBy]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Gestion du Catalogue</h1>
                <p className="text-slate-500 text-sm">Crée tes catégories et ajoute de nouveaux articles dans le stock.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
                        <FolderPlus className="w-5 h-5" />
                        <h2>Nouvelle Catégorie</h2>
                    </div>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nom de la catégorie</label>
                            <input
                                type="text"
                                placeholder="ex: Hygiène, Alimentation, Pharmacie"
                                value={nomCategorie}
                                onChange={(e) => setNomCategorie(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Ajouter Catégorie
                        </button>
                    </form>
                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Catégories actives</h3>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <span key={cat._id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                    {cat.nom}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteCategory(cat._id, cat.nom)}
                                        className="text-slate-400 hover:text-rose-600 transition-colors"
                                        title="Supprimer la catégorie"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            ))}
                            {categories.length === 0 && <p className="text-xs text-slate-400 italic">Aucune catégorie enregistrée.</p>}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
                        <PackagePlus className="w-5 h-5" />
                        <h2>Nouvel Article</h2>
                    </div>
                    <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Désignation de l'article</label>
                            <input
                                type="text"
                                placeholder="ex: Couches Taille 4, Sérum Physiologique..."
                                value={nomProduit}
                                onChange={(e) => setNomProduit(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Catégorie</label>
                            <select
                                value={categorieId}
                                onChange={(e) => setCategorieId(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                required
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.nom}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fournisseur</label>
                            <input
                                type="text"
                                list="fournisseurs-list"
                                placeholder="ex: Metro, Amazon, Pharmacie..."
                                value={fournisseur}
                                onChange={(e) => setFournisseur(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                            <datalist id="fournisseurs-list">
                                {fournisseursExistants.map((f, index) => (
                                    <option key={index} value={f} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Stock Initial</label>
                            <input
                                type="number"
                                min="0"
                                value={quantite}
                                onChange={(e) => setQuantite(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unité</label>
                            <select
                                value={unite}
                                onChange={(e) => setUnite(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                                <option value="unité">unité(s)</option>
                                <option value="boîte">boîte(s)</option>
                                <option value="paquet">paquet(s)</option>
                                <option value="flacon">flacon(s)</option>
                                <option value="rouleau">rouleau(x)</option>
                                <option value="kg">kg</option>
                                <option value="litre">litre(s)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Seuil d'alerte stock bas</label>
                            <input
                                type="number"
                                min="0"
                                value={seuilAlerte}
                                onChange={(e) => setSeuilAlerte(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button
                                type="submit"
                                disabled={categories.length === 0}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Enregistrer l'article
                            </button>
                            {categories.length === 0 && (
                                <p className="text-xs text-amber-600 text-center mt-2">Crée au moins une catégorie avant de pouvoir ajouter un article.</p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-slate-800">Articles enregistrés ({produits.length})</h2>
                    {produits.length > 0 && (
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-slate-400" />
                            <label htmlFor="sortBy" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                                Trier par :
                            </label>
                            <select
                                id="sortBy"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                                <option value="nom">Nom de l'article (A-Z)</option>
                                <option value="categorie">Catégorie (A-Z)</option>
                                <option value="fournisseur">Fournisseur (A-Z)</option>
                                <option value="quantite">Quantité (Croissante)</option>
                            </select>
                        </div>
                    )}
                </div>
                {loading ? (
                    <p className="text-sm text-slate-400 italic">Chargement du catalogue...</p>
                ) : sortedProduits.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">Aucun article enregistré pour le moment.</p>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {sortedProduits.map((prod) => {
                            const catNom = typeof prod.categorie === 'object' ? prod.categorie?.nom : 'Général';
                            return (
                                <div key={prod._id} className="py-3 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{prod.nom}</p>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">{catNom}</span>
                                            <span>Stock : {prod.quantite} {prod.unite || 'unité(s)'}</span>
                                            {prod.fournisseur && <span>Fournisseur : {prod.fournisseur}</span>}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteProduct(prod._id, prod.nom)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Supprimer l'article"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};