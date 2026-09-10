import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Building2,
  UserPlus
} from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<'USER' | 'CRECHE'>('CRECHE');
  const [nomCreche, setNomCreche] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [ville, setVille] = useState('');
  // const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [codeRattachement, setCodeRattachement] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('AUXILIAIRE');
  const [sectionPrincipale, setSectionPrincipale] = useState('GLOBAL');
  const [motDePasse, setMotDePasse] = useState('');
  const [codePIN, setCodePIN] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !motDePasse || !prenom || !nom) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (codePIN && (codePIN.length !== 4 || !/^\d+$/.test(codePIN))) {
      setError('Le code PIN doit comporter exactement 4 chiffres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'CRECHE') {
        if (!nomCreche || !codePostal) {
          setError('Veuillez indiquer le nom et le code postal de la crèche.');
          setLoading(false);
          return;
        }
        const res = await API.post('/auth/register-creche', {
          nomCreche,
          // adresse,
          codePostal,
          ville,
          telephone,
          nom,
          prenom,
          email,
          motDePasse,
          codePIN,
        });

        navigate('/login', {
          state: {
            message: `Crèche créée ! Votre code de rattachement : ${res.data.codeRattachement}`,
          },
        });
      } else {
        if (!codeRattachement) {
          setError('Veuillez saisir un code de rattachement valide.');
          setLoading(false);
          return;
        }

        await API.post('/auth/register-user', {
          codeRattachement,
          nom,
          prenom,
          email,
          motDePasse,
          codePIN,
          role,
          sectionPrincipale,
        });

        navigate('/login', { state: { message: 'Compte collaborateur créé avec succès !' } });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Une erreur est survenue lors de l’inscription.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950/5 flex flex-col justify-between p-4 sm:p-8 font-sans">
      <div className="max-w-6xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 bg-emerald-800 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-bold text-lg">
                  🐾
                </div>
                <div>
                  <h1 className="font-extrabold text-xl tracking-tight leading-none">Les P'tits Pas</h1>
                  <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-medium mt-1">
                    LOGISTIQUE PETITE ENFANCE
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-900/60 border border-emerald-600/40 text-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Portail Sécurisé
              </span>
            </div>
            <div className="space-y-3 pt-4">
              <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                {mode === 'CRECHE'
                  ? 'Inscrivez votre structure et centralisez vos stocks.'
                  : 'Rejoignez votre équipe et simplifiez votre quotidien.'}
              </h2>
              <p className="text-emerald-100/80 text-sm leading-relaxed">
                Approvisionnements fluides, inventaires instantanés et traçabilité sereine pour se consacrer pleinement au bien-être des tout-petits.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <div className="bg-emerald-900/40 border border-emerald-700/50 rounded-2xl p-4 flex gap-4 items-start backdrop-blur-sm">
                <div className="p-2.5 bg-emerald-700/50 rounded-xl text-emerald-200 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Traçabilité PMI conforme</h3>
                  <p className="text-xs text-emerald-200/70 mt-0.5 leading-relaxed">
                    Chaque action est horodatée en conformité avec les exigences de la Petite Enfance.
                  </p>
                </div>
              </div>
              <div className="bg-emerald-900/40 border border-emerald-700/50 rounded-2xl p-4 flex gap-4 items-start backdrop-blur-sm">
                <div className="p-2.5 bg-emerald-700/50 rounded-xl text-emerald-200 flex-shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Accès par section</h3>
                  <p className="text-xs text-emerald-200/70 mt-0.5 leading-relaxed">
                    Vue directe sur les stocks de votre groupe (Bébés, Moyens, Grands, Réserve).
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 pt-8 border-t border-emerald-700/50 flex items-center justify-between text-[11px] text-emerald-200/70">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Données chiffrées HDS
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-900/80 font-semibold border border-emerald-700/50 text-emerald-300">
              Certifié PMI
            </span>
          </div>
        </div>
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="inline-flex p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
                <Link to="/login" className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition-all">
                  🔑 Se connecter
                </Link>
                <button className="px-4 py-2 bg-emerald-800 text-white rounded-xl shadow-sm">
                  👤+ Créer un compte
                </button>
              </div>
            </div>
            <div className="mb-6 bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setMode('CRECHE'); setError(''); }}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  mode === 'CRECHE'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Créer une crèche (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('USER'); setError(''); }}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  mode === 'USER'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Rejoindre une équipe</span>
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-800">
                {mode === 'CRECHE' ? 'Nouvelle structure' : 'Rejoindre un établissement'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'CRECHE'
                  ? 'Enregistrez votre crèche pour obtenir votre code de rattachement.'
                  : 'Renseignez le code fourni par votre direction pour lier votre compte.'}
              </p>
            </div>
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'CRECHE' ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[11px] flex items-center justify-center">1</span>
                    Informations sur l'établissement
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nom de la crèche *</label>
                      <input
                        type="text"
                        placeholder="Les P'tits Loups - Nation"
                        value={nomCreche}
                        onChange={(e) => setNomCreche(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Code Postal *</label>
                      <input
                        type="text"
                        placeholder="75012"
                        value={codePostal}
                        onChange={(e) => setCodePostal(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ville</label>
                      <input
                        type="text"
                        placeholder="Paris"
                        value={ville}
                        onChange={(e) => setVille(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Téléphone</label>
                      <input
                        type="text"
                        placeholder="01 45 22 88 00"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[11px] flex items-center justify-center">1</span>
                    Code de rattachement
                  </span>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="CRECHE-XXXX-75012"
                      value={codeRattachement}
                      onChange={(e) => setCodeRattachement(e.target.value.toUpperCase())}
                      className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 tracking-wider uppercase focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      required
                    />
                    <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold text-xs">🏢</span>
                  </div>
                </div>
              )}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[11px] flex items-center justify-center">2</span>
                  {mode === 'CRECHE' ? 'Identité du Responsable' : 'Identité & Contact'}
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prénom *</label>
                    <input
                      type="text"
                      placeholder="Sevan"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nom *</label>
                    <input
                      type="text"
                      placeholder="Sarikaya"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email professionnel *</label>
                  <input
                    type="email"
                    placeholder="contact@lespetitsloups.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                    required
                  />
                </div>
                {mode === 'USER' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fonction *</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-slate-700"
                      >
                        <option value="AUXILIAIRE">Auxiliaire de puériculture (AP)</option>
                        <option value="EDUCATEUR">Éducateur / Éducatrice jeunes enfants (EJE)</option>
                        <option value="DIRECTION">Direction / Responsable</option>
                        <option value="ADMIN_CRECHE">Administrateur Crèche</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Section principale *</label>
                      <select
                        value={sectionPrincipale}
                        onChange={(e) => setSectionPrincipale(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-slate-700"
                      >
                        <option value="BEBES">Bébés</option>
                        <option value="MOYENS">Moyens</option>
                        <option value="GRANDS">Grands</option>
                        <option value="CUISINE">Cuisine</option>
                        <option value="GLOBAL">Global / Multi-section</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[11px] flex items-center justify-center">3</span>
                  Sécurité & Authentification
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mot de passe *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={motDePasse}
                        onChange={(e) => setMotDePasse(e.target.value)}
                        className="w-full h-10 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Code PIN (4 chiffres)</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="1234"
                      value={codePIN}
                      onChange={(e) => setCodePIN(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono tracking-widest text-center focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'CRECHE' ? 'Créer la crèche & mon compte' : 'Rejoindre l’établissement'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Besoin d'aide ?
            </span>
            <span className="font-semibold text-slate-600">Support : 01 45 22 88 00</span>
          </div>
        </div>
      </div>
    </div>
  );
};