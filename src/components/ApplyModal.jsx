import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

export default function ApplyModal({ job, onClose }) {
  const { user } = useAuth();
  const meta = user?.user_metadata ?? {};

  const [name, setName]       = useState(meta.full_name ?? "");
  const [email, setEmail]     = useState(user?.email ?? "");
  const [phone, setPhone]     = useState(meta.phone ?? "");
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (job.apply_url) {
      window.open(job.apply_url, "_blank", "noopener,noreferrer");
      onClose();
      return;
    }

    setSaving(true);
    setError("");

    const { error: insertError } = await supabase.from("candidatures").insert({
      job_id:      job.id,
      candidat_id: user?.id ?? null,
      nom:         name,
      email,
      telephone:   phone || null,
      message:     message || null,
    });

    setSaving(false);

    if (insertError) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } else {
      setSent(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Postuler</h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
              {job.title} · {job.company_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Candidature envoyée !</h3>
            <p className="text-sm text-gray-500 mb-6">
              Votre candidature pour <strong>{job.title}</strong> a bien été transmise à {job.company_name}.
            </p>
            <button
              onClick={onClose}
              className="bg-navy-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold
                         hover:bg-navy-800 transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {job.apply_url && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800">
                Cette offre redirige vers le site de l'entreprise pour candidater.
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kouassi Jean-Baptiste"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@exemple.ci"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+225 07 00 00 00 00"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lettre de motivation
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre motivation et vos expériences pertinentes..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent
                           resize-none"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm
                           font-semibold hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl
                           text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {saving ? "Envoi…" : job.apply_url ? "Continuer vers le site" : "Envoyer ma candidature"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
