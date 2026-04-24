import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ROLES = [
  { id: "candidat",  label: "Candidat",  desc: "Je cherche un emploi" },
  { id: "recruteur", label: "Recruteur", desc: "Je publie des offres" },
];

const BENEFITS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "Sauvegardez vos offres",
    desc: "Retrouvez vos favoris à tout moment, depuis n'importe quel appareil.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Centralisez vos recherches",
    desc: "Toutes les offres de Côte d'Ivoire réunies en un seul endroit.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Suivez vos candidatures",
    desc: "Gardez un historique de toutes les offres consultées et postulées.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: "Alertes personnalisées",
    desc: "Recevez les nouvelles offres qui correspondent à votre profil.",
  },
];

export default function RegisterPage() {
  const [fullName, setFullName]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [role, setRole]               = useState("candidat");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    setLoading(false);
    if (authError) setError(authError.message);
    else setRegisteredEmail(email);
  };

  if (registeredEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">Compte créé !</h2>
          <p className="text-sm text-gray-500 mb-6">
            Un email de confirmation a été envoyé à{" "}
            <span className="font-semibold text-gray-700">{registeredEmail}</span>.
            Vérifiez votre boîte mail.
          </p>
          <Link to="/connexion"
            className="inline-block bg-navy-900 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-navy-800 transition-colors">
            Aller à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Panneau gauche — Marketing (desktop uniquement) ── */}
      <div className="hidden lg:flex lg:w-[46%] bg-navy-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Cercles déco */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-orange-500/10" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg">J</span>
            <span className="text-white font-bold text-2xl tracking-tight">JobCI</span>
          </Link>
        </div>

        {/* Message principal */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Trouvez votre emploi idéal en Côte d'Ivoire
            </h2>
            <p className="text-navy-300 text-base leading-relaxed">
              Rejoignez des milliers de candidats qui utilisent JobCI pour accélérer leur recherche d'emploi.
            </p>
          </div>

          <div className="space-y-5">
            {BENEFITS.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0 text-orange-400">
                  {icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-navy-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge bottom */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-dot-pulse" />
          <span className="text-navy-400 text-xs">+1 100 offres disponibles aujourd'hui</span>
        </div>
      </div>

      {/* ── Panneau droit — Formulaire ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* Logo mobile */}
        <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <span className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg">J</span>
          <span className="text-navy-900 font-bold text-2xl tracking-tight">JobCI</span>
        </Link>

        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-navy-900">Créer un compte</h1>
            <p className="text-sm text-gray-500 mt-1">Gratuit et sans engagement</p>
          </div>

          {/* Bénéfices mobile */}
          <div className="lg:hidden grid grid-cols-2 gap-2 mb-6">
            {BENEFITS.map(({ title }) => (
              <div key={title} className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-100 rounded-xl px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                {title}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
            {/* Sélection rôle */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`rounded-xl border-2 px-3 py-3 text-left transition-all duration-200 ${
                    role === r.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className={`text-sm font-semibold ${role === r.id ? "text-orange-600" : "text-gray-800"}`}>
                    {r.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                <input
                  type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  required placeholder="Kofi Atta"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required placeholder="vous@exemple.com"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={6} placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-navy-900 hover:bg-navy-800 active:scale-95 text-white font-semibold
                           py-3 rounded-xl text-sm transition-all duration-150 disabled:opacity-60 mt-2"
              >
                {loading ? "Création du compte…" : "Créer mon compte gratuitement"}
              </button>
            </form>

            <p className="text-sm text-center text-gray-500 mt-5">
              Déjà un compte ?{" "}
              <Link to="/connexion" className="text-orange-500 font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
