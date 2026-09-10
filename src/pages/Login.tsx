import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Building2, Tablet, Mail, Lock, ShieldCheck,
    PackageCheck, HeartHandshake, ArrowRight, Delete, AlertCircle
} from 'lucide-react';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { loginClassique, loginPin } = useAuth();
    const [mode, setMode] = useState<'PIN' | 'PASSWORD'>('PIN');
    const [codeRattachement, setCodeRattachement] = useState('');
    const [pin, setPin] = useState('');
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePinPress = (val: string) => {
        if (pin.length < 4) setPin((prev) => prev + val);
    };

    const handlePinDelete = () => {
        setPin((prev) => prev.slice(0, -1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mode === 'PIN') {
                await loginPin(codeRattachement, pin);
            } else {
                await loginClassique(email, motDePasse);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Identifiants invalides.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8 font-sans">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
                <div className="lg:col-span-5 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                <Building2 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight">Les P'tits Loups</h1>
                                <p className="text-xs text-teal-100 font-medium tracking-wide uppercase">LOGISTIQUE PETITE ENFANCE</p>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-teal-50 mb-6 border border-white/10">
                            <ShieldCheck className="w-4 h-4 text-emerald-300" />
                            Portail Sécurisé Personnel de Crèche
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold leading-snug mb-4">
                            Un quotidien serein pour veiller sur l'essentiel.
                        </h2>
                        <p className="text-sm text-teal-100/90 leading-relaxed mb-8">
                            Gérez vos stocks de couches, laits infantiles et trousses d'urgence sans friction, depuis le bureau ou directement en section d'éveil.
                        </p>
                        <div className="space-y-3">
                            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-start gap-3">
                                <PackageCheck className="w-5 h-5 text-teal-200 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-xs font-bold">Gestion simplifiée des stocks</h3>
                                    <p className="text-[11px] text-teal-100/80">Seuils d'alerte automatiques et réapprovisionnements en un clic.</p>
                                </div>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-start gap-3">
                                <HeartHandshake className="w-5 h-5 text-teal-200 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-xs font-bold">Suivi hygiène & conformité PMI</h3>
                                    <p className="text-[11px] text-teal-100/80">Traçabilité des lots et respect strict des protocoles sanitaires.</p>
                                </div>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-start gap-3">
                                <Tablet className="w-5 h-5 text-teal-200 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-xs font-bold">Pointage rapide tablette en section</h3>
                                    <p className="text-[11px] text-teal-100/80">Ergonomie adaptée aux écrans tactiles muraux et tablettes volantes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-teal-200">
                        <span>● Données chiffrées & certifiées</span>
                        <span>v2.4 Crèche Connect</span>
                    </div>
                </div>
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
                    <div>
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
                            <button
                                type="button"
                                onClick={() => setMode('PIN')}
                                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'PIN' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                <Tablet className="w-4 h-4" /> Mode Tablette (PIN)
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('PASSWORD')}
                                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'PASSWORD' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                <Mail className="w-4 h-4" /> Email / Mot de passe
                            </button>
                        </div>
                        {error && (
                            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {mode === 'PIN' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Code de rattachement crèche
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="ex: CRECHE-139-75012"
                                            value={codeRattachement}
                                            onChange={(e) => setCodeRattachement(e.target.value.toUpperCase())}
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-slate-800 font-mono text-sm uppercase tracking-wider transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            Code PIN Personnel (4 chiffres)
                                        </label>
                                        <div className="flex justify-center gap-3 mb-4">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${pin.length > i
                                                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                                                            : 'border-slate-200 bg-slate-50'
                                                        }`}
                                                >
                                                    {pin.length > i ? '•' : ''}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                                            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => handlePinPress(num)}
                                                    className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-teal-100 text-slate-800 font-bold text-lg transition-colors flex items-center justify-center"
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setPin('')}
                                                className="h-12 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 font-semibold text-xs transition-colors flex items-center justify-center"
                                            >
                                                Effacer
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handlePinPress('0')}
                                                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-teal-100 text-slate-800 font-bold text-lg transition-colors flex items-center justify-center"
                                            >
                                                0
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handlePinDelete}
                                                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center justify-center"
                                            >
                                                <Delete className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Identifiant ou Email professionnel
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                                            <input
                                                type="email"
                                                placeholder="prenom.nom@lespetitsloups.fr"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-slate-800 transition-all text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Mot de passe de session
                                        </label>
                                        <div className="relative">
                                            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                                            <input
                                                type="password"
                                                placeholder="••••••••••••"
                                                value={motDePasse}
                                                onChange={(e) => setMotDePasse(e.target.value)}
                                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-slate-800 transition-all text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            <button
                                type="submit"
                                disabled={loading || (mode === 'PIN' && pin.length < 4)}
                                className="w-full h-13 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 active:scale-[0.99] disabled:opacity-50 rounded-2xl shadow-lg shadow-teal-700/20 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Se connecter à l'espace crèche</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                        <span>Vous n'avez pas d'espace ?</span>
                        <Link to="/register" className="font-bold text-teal-700 hover:underline">
                            Créer un compte / Adhésion
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};