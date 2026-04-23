import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const CONTRACT_COLORS = {
  CDI:        "bg-emerald-100 text-emerald-800",
  CDD:        "bg-blue-100 text-blue-800",
  Stage:      "bg-amber-100 text-amber-800",
  Freelance:  "bg-purple-100 text-purple-800",
  Alternance: "bg-pink-100 text-pink-800",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [candCounts, setCandCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: jobData } = await supabase
      .from("jobs")
      .select("id, title, company_name, contract_type, commune, city, is_active, created_at, sector, expires_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const jobs = jobData ?? [];
    setJobs(jobs);

    if (jobs.length > 0) {
      const { data: candData } = await supabase
        .from("candidatures")
        .select("job_id")
        .in("job_id", jobs.map((j) => j.id));

      const counts = {};
      (candData ?? []).forEach((c) => {
        counts[c.job_id] = (counts[c.job_id] ?? 0) + 1;
      });
      setCandCounts(counts);
    }

    setLoading(false);
  }

  async function toggleActive(job) {
    setTogglingId(job.id);
    await supabase.from("jobs").update({ is_active: !job.is_active }).eq("id", job.id);
    setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, is_active: !j.is_active } : j));
    setTogglingId(null);
  }

  async function renewJob(id) {
    const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("jobs").update({ expires_at, is_active: true }).eq("id", id);
    setJobs((prev) => prev.map((j) => j.id === id ? { ...j, expires_at, is_active: true } : j));
  }

  async function deleteJob(id) {
    await supabase.from("jobs").delete().eq("id", id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setCandCounts((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setDeletingId(null);
  }

  const total        = jobs.length;
  const actives      = jobs.filter((j) => j.is_active).length;
  const totalCands   = Object.values(candCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
            <p className="text-navy-300 text-sm mt-0.5">Gérez vos offres d'emploi</p>
          </div>
          <Link
            to="/publier"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Publier une offre
          </Link>
        </div>

        {/* Stats */}
        <div className="max-w-5xl mx-auto px-4 pb-0 flex border-t border-navy-800">
          <Stat value={total} label={`offre${total !== 1 ? "s" : ""} publiée${total !== 1 ? "s" : ""}`} />
          <Stat value={actives} label={`active${actives !== 1 ? "s" : ""}`} color="text-emerald-400" />
          <Stat value={total - actives} label={`inactive${(total - actives) !== 1 ? "s" : ""}`} color="text-gray-400" />
          <Stat value={totalCands} label={`candidature${totalCands !== 1 ? "s" : ""}`} color="text-orange-400" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-700 mb-2">Aucune offre publiée</h2>
            <p className="text-sm text-gray-400 mb-5">Créez votre première offre d'emploi.</p>
            <Link to="/publier" className="inline-block bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Publier une offre
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const nbCand = candCounts[job.id] ?? 0;
              const expired = job.expires_at && new Date(job.expires_at) < new Date();
              const expiresSoon = !expired && job.expires_at &&
                new Date(job.expires_at) < new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

              return (
                <div key={job.id} className={`bg-white border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${expired ? "border-red-100 bg-red-50/30" : "border-gray-100"}`}>
                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{job.title}</h3>
                      {job.contract_type && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CONTRACT_COLORS[job.contract_type] ?? "bg-gray-100 text-gray-600"}`}>
                          {job.contract_type}
                        </span>
                      )}
                      {expired && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Expirée
                        </span>
                      )}
                      {expiresSoon && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Expire bientôt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {[job.company_name, job.commune, job.city].filter(Boolean).join(" · ")}
                      {job.sector && <span className="ml-2 text-navy-400">{job.sector}</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Publiée le {new Date(job.created_at).toLocaleDateString("fr-FR")}
                      {job.expires_at && (
                        <span className={`ml-2 ${expired ? "text-red-500" : "text-gray-400"}`}>
                          · Expire le {new Date(job.expires_at).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Candidatures badge */}
                  <Link
                    to={`/candidatures/${job.id}`}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      nbCand > 0
                        ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {nbCand} candidature{nbCand !== 1 ? "s" : ""}
                  </Link>

                  {/* Statut + actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(job)}
                      disabled={togglingId === job.id}
                      title={job.is_active ? "Désactiver" : "Activer"}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        job.is_active ? "bg-emerald-500" : "bg-gray-200"
                      } disabled:opacity-50`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        job.is_active ? "translate-x-4" : "translate-x-0.5"
                      }`} />
                    </button>
                    <span className="text-xs text-gray-400 w-14">{job.is_active ? "Active" : "Inactive"}</span>

                    {expired && (
                      <button
                        onClick={() => renewJob(job.id)}
                        className="text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Renouveler
                      </button>
                    )}
                    <Link
                      to={`/modifier/${job.id}`}
                      className="text-xs font-medium text-navy-700 hover:text-navy-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Modifier
                    </Link>

                    {deletingId === job.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => deleteJob(job.id)} className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">
                          Confirmer
                        </button>
                        <button onClick={() => setDeletingId(null)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5">
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingId(job.id)} className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label, color = "text-white" }) {
  return (
    <div className="px-5 py-3 text-sm text-navy-300 border-r border-navy-800 last:border-r-0">
      <span className={`font-bold text-lg mr-1 ${color}`}>{value}</span>
      {label}
    </div>
  );
}
