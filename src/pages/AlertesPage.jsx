import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const VILLES = [
  "Abidjan", "Plateau", "Cocody", "Yopougon", "Abobo", "Adjamé",
  "Marcory", "Treichville", "Port-Bouët", "Koumassi", "Bingerville",
  "Bouaké", "Yamoussoukro", "San-Pédro", "Daloa", "Korhogo",
  "Man", "Gagnoa", "Aboisso", "Divo", "Soubré", "Abengourou",
];

export default function AlertesPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setAlerts(data ?? []);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setAdding(true);
    setError("");
    const { data, error: err } = await supabase
      .from("alerts")
      .insert({ user_id: user.id, keyword: keyword.trim(), city: city || null, is_active: true })
      .select()
      .single();
    setAdding(false);
    if (err) { setError("Erreur lors de l'ajout."); return; }
    setAlerts((prev) => [data, ...prev]);
    setKeyword("");
    setCity("");
  }

  async function handleToggle(alert) {
    const { data } = await supabase
      .from("alerts")
      .update({ is_active: !alert.is_active })
      .eq("id", alert.id)
      .select()
      .single();
    if (data) setAlerts((prev) => prev.map((a) => (a.id === alert.id ? data : a)));
  }

  async function handleDelete(id) {
    await supabase.from("alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  const activeCount = alerts.filter((a) => a.is_active).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/profil" className="inline-flex items-center gap-1.5 text-navy-400 hover:text-white text-sm mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
            Retour au profil
          </Link>
          <h1 className="text-2xl font-bold text-white">Mes Alertes Emploi</h1>
          <p className="text-navy-300 text-sm mt-1">
            {loading ? "Chargement…" : `${activeCount} alerte${activeCount !== 1 ? "s" : ""} active${activeCount !== 1 ? "s" : ""} · ${alerts.length} au total`}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Formulaire d'ajout */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Nouvelle alerte</h2>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2 mb-4">{error}</p>
          )}
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Mot-clé (ex: Développeur, Comptable…)"
                required
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="">Toutes les villes</option>
                {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <button
              type="submit"
              disabled={adding || !keyword.trim()}
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold
                         px-5 py-2.5 rounded-xl text-sm transition-all duration-150 disabled:opacity-60 whitespace-nowrap"
            >
              {adding ? "Ajout…" : "+ Ajouter"}
            </button>
          </form>
        </div>

        {/* Liste des alertes */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Aucune alerte configurée</p>
            <p className="text-xs text-gray-400">Ajoutez un mot-clé ci-dessus pour être notifié des nouvelles offres.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert, onToggle, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(alert.id);
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 p-4
                     ${alert.is_active ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
      <div className="flex items-center gap-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {alert.keyword}
          </span>
          {alert.city && (
            <span className="inline-flex items-center gap-1 bg-navy-50 text-navy-700 text-xs font-semibold px-3 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {alert.city}
            </span>
          )}
          {!alert.city && (
            <span className="text-xs text-gray-400 py-1">Toutes les villes</span>
          )}
        </div>

        {/* Toggle + Supprimer */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => onToggle(alert)}
            title={alert.is_active ? "Désactiver" : "Activer"}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                        ${alert.is_active ? "bg-orange-500" : "bg-gray-200"}`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200
                          ${alert.is_active ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Supprimer l'alerte"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300
                       hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2 ml-0.5">
        {alert.is_active ? "Active" : "Désactivée"} · Créée le{" "}
        {new Date(alert.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
      </p>
    </div>
  );
}
