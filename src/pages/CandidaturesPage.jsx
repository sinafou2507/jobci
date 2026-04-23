import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

export default function CandidaturesPage() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function load() {
      const [{ data: jobData }, { data: candData }] = await Promise.all([
        supabase.from("jobs").select("id, title, company_name").eq("id", jobId).eq("user_id", user.id).single(),
        supabase.from("candidatures").select("*").eq("job_id", jobId).order("created_at", { ascending: false }),
      ]);

      if (!jobData) {
        navigate("/dashboard");
        return;
      }

      setJob(jobData);
      setCandidatures(candData ?? []);
      setLoading(false);
    }
    load();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-navy-300 hover:text-white text-sm mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">{job.title}</h1>
          <p className="text-navy-300 text-sm mt-1">
            {job.company_name} ·{" "}
            <span className="text-white font-semibold">{candidatures.length}</span>{" "}
            candidature{candidatures.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {candidatures.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-700 mb-2">Aucune candidature reçue</h2>
            <p className="text-sm text-gray-400">Les candidatures apparaîtront ici dès qu'un candidat postulera.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {candidatures.map((c) => (
              <div key={c.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-sm flex-shrink-0">
                    {c.nom.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{c.nom}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <a href={`mailto:${c.email}`} className="text-xs text-orange-500 hover:underline">
                        {c.email}
                      </a>
                      {c.telephone && (
                        <a href={`tel:${c.telephone}`} className="text-xs text-gray-400 hover:text-gray-600">
                          {c.telephone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Date + toggle message */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {c.message && (
                      <button
                        onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                        className="text-xs font-medium text-navy-700 hover:text-navy-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {expanded === c.id ? "Masquer" : "Voir lettre"}
                      </button>
                    )}
                    <a
                      href={`mailto:${c.email}?subject=Votre candidature — ${job.title}`}
                      className="text-xs font-medium text-white bg-navy-900 hover:bg-navy-800 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Répondre
                    </a>
                  </div>
                </div>

                {/* Message déplié */}
                {expanded === c.id && c.message && (
                  <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Lettre de motivation</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{c.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
