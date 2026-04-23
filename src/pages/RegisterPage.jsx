import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ROLES = [
  { id: "candidat", label: "Candidat", desc: "Je cherche un emploi" },
  { id: "recruteur", label: "Recruteur", desc: "Je publie des offres" },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidat");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    if (authError) {
      setError(authError.message);
    } else {
      setRegisteredEmail(email);
    }
  };

  if (registeredEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-navy-900 mb-2">Compte créé !</h2>
          <p className="text-sm text-gray-500 mb-5">
            Un email de confirmation a été envoyé à{" "}
            <span className="font-medium text-gray-700">{registeredEmail}</span>.
            Vérifiez votre boîte mail.
          </p>
          <Link
            to="/connexion"
            className="inline-block bg-navy-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-navy-800 transition-colors"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg">J</span>
          <span className="text-navy-900 font-bold text-2xl tracking-tight">JobCI</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-navy-900 mb-1">Créer un compte</h1>
          <p className="text-sm text-gray-500 mb-5">Rejoignez JobCI gratuitement</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`rounded-xl border-2 px-3 py-3 text-left transition-colors ${
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
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Kofi Atta"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
            >
              {loading ? "Création…" : "Créer mon compte"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-5">
            Déjà un compte ?{" "}
            <Link to="/connexion" className="text-orange-500 font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
