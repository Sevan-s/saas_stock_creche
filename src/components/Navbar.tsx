import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, History, LogOut, PackagePlus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isAdminOrDirectrice = ['ADMIN_CRECHE', 'ADMIN_GLOBAL', 'DIRECTRICE'].includes(user?.role || '');

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
                PL
              </div>
              <div>
                <span className="font-bold text-slate-800 text-lg leading-none block">Petits Loups</span>
                <span className="text-xs text-slate-400 font-medium">Gestion de Stock</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-1 ml-4">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/')
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Réserve
              </Link>
              <Link
                to="/commandes"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/commandes')
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ShoppingCart className="w-4 h-4" /> Commandes
              </Link>
              <Link
                to="/historique"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/historique')
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <History className="w-4 h-4" /> Historique
              </Link>
              {isAdminOrDirectrice && (
                <Link
                  to="/admin/catalogue"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/admin/catalogue')
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <PackagePlus className="w-4 h-4" /> Catalogue
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {user?.prenom?.[0] || 'U'}
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-slate-700 leading-tight">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-slate-400 font-medium">
                  {user?.role} {user?.sectionPrincipale ? `• ${user.sectionPrincipale}` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="md:hidden flex border-t border-slate-100 bg-white px-2 py-1 justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-xs font-semibold ${
            isActive('/') ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" /> Réserve
        </Link>
        <Link
          to="/commandes"
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-xs font-semibold ${
            isActive('/commandes') ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" /> Commandes
        </Link>
        <Link
          to="/historique"
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-xs font-semibold ${
            isActive('/historique') ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" /> Historique
        </Link>
        {isAdminOrDirectrice && (
          <Link
            to="/admin/catalogue"
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-xs font-semibold ${
              isActive('/admin/catalogue') ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <PackagePlus className="w-5 h-5 mb-0.5" /> Catalogue
          </Link>
        )}
      </div>
    </nav>
  );
};