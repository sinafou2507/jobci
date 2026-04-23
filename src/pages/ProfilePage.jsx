import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { getFavoriteIds } from "../lib/favorites";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const meta = user?.user_metadata ?? {};
  const [fullName, setFullName] = useState(meta.full_name ?? "");
  const [phone, setPhone] = useState(meta.phone ?? "");
  const [location, setLocation] = useState(meta.location ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const favoritesCount = getFavoriteIds(user?.id).length;

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : null;

  const initials = (fullName || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone, location },
    });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900">
        <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-18 h-18 w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-xl leading-tight">
              {fullName || "Mon profil"}
            </h1>
            <p className="text-navy-300 text-sm mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {meta.role && (
                <span className="text-xs bg-orange-500 text-white px-2.5 py-0.5 rounded-full capitalize font-medium">
                  {meta.role}
                </span>
              )}
              {memberSince && (
                <span className="text-xs text-navy-400">Membre depuis {memberSince}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto px-4 pb-0">
          <div className="flex border-t border-navy-800">
            <Link
              to="/favoris"
              className="flex items-center gap-2 px-5 py-3 text-sm text-navy-300 hover:text-white hover:bg-navy-800 transition-colors"
            >
              <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span><strong className="text-white">{favoritesCount}</strong> favori{favoritesCount !== 1 ? "s" : ""}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Quick links */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Navigation</p>
            <nav className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
              <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Toutes les offres
              </Link>
              <Link to="/favoris" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Mes favoris
                {favoritesCount > 0 && (
                  <span className="ml-auto text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                    {favoritesCount}
                  </span>
                )}
              </Link>
              <Link to="/contact" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </Link>
            </nav>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 bg-white rounded-2xl border border-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                Informations personnelles
              </h2>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
              )}
              {saved && (
                <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-4">
                  Profil mis à jour avec succès.
                </p>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Kofi Atta"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+225 07 00 00 00 00"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Cocody, Abidjan"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {saving ? "Enregistrement…" : "Enregistrer les modifications"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
