import React, { useState, useEffect, useMemo } from 'react';
import API from '../api/axios';
import { StockCard } from '../components/StockCard';
import type { Item, Category, Order } from '../types';
import { Search, Filter, AlertTriangle, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const [search, setSearch] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('TOUTES');
    const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [itemsRes, categoriesRes, ordersRes] = await Promise.all([
                API.get<Item[]>('/items'),
                API.get<Category[]>('/categories'),
                API.get<Order[]>('/orders'),
            ]);

            const itemsData = Array.isArray(itemsRes.data)
                ? itemsRes.data
                : (itemsRes.data as any).items || (itemsRes.data as any).produits || [];

            const categoriesData = Array.isArray(categoriesRes.data)
                ? categoriesRes.data
                : (categoriesRes.data as any).categories || [];

            const ordersData = Array.isArray(ordersRes.data)
                ? ordersRes.data
                : (ordersRes.data as any).orders || [];

            setItems(itemsData);
            setCategories(categoriesData);
            setOrders(ordersData);
        } catch (err: any) {
            setError('Impossible de charger les données du stock.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const orderedItemIds = useMemo(() => {
        const set = new Set<string>();
        orders.forEach((order) => {
            if (order.statut !== 'RECUE' && Array.isArray(order.items)) {
                order.items.forEach((line: any) => {
                    const itemId = typeof line.item === 'object' && line.item !== null ? line.item._id : line.item;
                    if (itemId) set.add(itemId);
                });
            }
        });
        return set;
    }, [orders]);

    const handleAdjustStock = async (id: string, newQuantity: number) => {
        try {
            const response = await API.patch(`/items/${id}/quantity`, { quantite: newQuantity });

            setItems((prevItems) =>
                prevItems.map((item) => (item._id === id ? response.data : item))
            );
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la quantité :", error);
            throw error;
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                item.nom.toLowerCase().includes(search.toLowerCase()) ||
                (item.emplacement && item.emplacement.toLowerCase().includes(search.toLowerCase()));

            const categoryId = typeof item.categorie === 'object' ? item.categorie?._id : item.categorie;
            const categoryNom = typeof item.categorie === 'object' ? item.categorie?.nom : '';

            const matchesCategory =
                selectedCategory === 'TOUTES' ||
                categoryId === selectedCategory ||
                categoryNom === selectedCategory;

            const qty = item.quantite ?? item.quantiteActuelle ?? 0;
            const minThreshold = item.seuilAlerte ?? 0;
            const matchesLowStock = !onlyLowStock || qty <= minThreshold;

            return matchesSearch && matchesCategory && matchesLowStock;
        });
    }, [items, search, selectedCategory, onlyLowStock]);

    const lowStockCount = useMemo(() => {
        return items.filter((i) => {
            const qty = i.quantite ?? i.quantiteActuelle ?? 0;
            const minThreshold = i.seuilAlerte ?? 0;
            return qty <= minThreshold;
        }).length;
    }, [items]);
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gestion de Stock</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {items.length} article(s) référencé(s) au total
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOnlyLowStock(!onlyLowStock)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${onlyLowStock
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            }`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Alertes Stock</span>
                        {lowStockCount > 0 && (
                            <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${onlyLowStock ? 'bg-white text-amber-600' : 'bg-amber-200 text-amber-800'
                                    }`}
                            >
                                {lowStockCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={fetchData}
                        className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 transition-all"
                        title="Rafraîchir"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                    </button>
                </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Rechercher un article, un emplacement..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 transition-all text-sm"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
                        <Filter className="w-3.5 h-3.5" /> Catégorie :
                    </span>

                    <button
                        onClick={() => setSelectedCategory('TOUTES')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${selectedCategory === 'TOUTES'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        TOUTES
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => setSelectedCategory(cat._id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${selectedCategory === cat._id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {cat.nom}
                        </button>
                    ))}
                </div>
            </div>
            {error ? (
                <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-center font-medium">
                    {error}
                </div>
            ) : loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-40 bg-slate-200/60 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <p className="text-slate-500 font-medium">Aucun article ne correspond à votre recherche.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                        <StockCard
                            key={item._id}
                            item={item}
                            isOrdered={orderedItemIds.has(item._id)}
                            onAdjustStock={handleAdjustStock}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};