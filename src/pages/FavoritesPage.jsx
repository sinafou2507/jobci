import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import JobCard from "../components/JobCard";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favIds } = useFavorites();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ids = [...favIds];
      if (ids.length === 0) { setJobs([]); setLoading(false); return; }
      const { data } = await supabase
        .from("jobs").select("*").in("id", ids).eq("is_active", true);
      setJobs(data ?? []);
      setLoading(false);
    }
    if (!loading || favIds.size >= 0) load();
  }, [favIds]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy-900 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-1">Mes favoris</h1>
          <p className="text-navy-300 text-sm">
            {loading ? "Chargement…" : `${jobs.length} offre${jobs.length !== 1 ? "s" : ""} sauvegardée${jobs.length !== 1 ? "s" : ""}`}
          </p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-700 mb-2">Aucun favori pour l'instant</h2>
            <p className="text-sm text-gray-400 mb-5">
              Survolez une offre et cliquez sur le ❤️ pour la sauvegarder.
            </p>
            <Link to="/"
              className="inline-block bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Parcourir les offres
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </div>
  );
}
