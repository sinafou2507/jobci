import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isFavorite, toggleFavorite } from "../lib/favorites";

const CONTRACT_COLORS = {
  CDI:        "bg-emerald-100 text-emerald-800",
  CDD:        "bg-blue-100 text-blue-800",
  Stage:      "bg-amber-100 text-amber-800",
  Freelance:  "bg-purple-100 text-purple-800",
  Alternance: "bg-pink-100 text-pink-800",
};

function ContractBadge({ type }) {
  const cls = CONTRACT_COLORS[type] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
      {type}
    </span>
  );
}

export default function JobCard({ job }) {
  const { user } = useAuth();
  const [favored, setFavored] = useState(() => isFavorite(job.id, user?.id));
  const daysAgo = Math.floor((Date.now() - new Date(job.created_at)) / 86_400_000);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(job.id, user?.id);
    setFavored((v) => !v);
  };

  return (
    <div className="relative group">
      <Link
        to={`/offres/${job.id}`}
        className="block bg-white border border-gray-100 rounded-2xl p-5
                   hover:border-navy-400 hover:shadow-lg hover:shadow-navy-900/5
                   transition-all duration-200"
      >
        <div className="flex items-start gap-4 pr-8">
          <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center
                          flex-shrink-0 border border-gray-100 overflow-hidden">
            {job.company_logo ? (
              <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-navy-700 font-bold text-lg">
                {(job.company_name ?? "?")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 truncate">{job.company_name}</p>
            <h3 className="text-base font-semibold text-gray-900 leading-tight mt-0.5
                           group-hover:text-navy-700 transition-colors line-clamp-2">
              {job.title}
            </h3>
          </div>
        </div>

        {job.salary_min && (
          <p className="mt-3 text-sm font-semibold text-navy-700">
            {job.salary_min.toLocaleString("fr-FR")}
            {job.salary_max ? ` – ${job.salary_max.toLocaleString("fr-FR")}` : "+"} FCFA/mois
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          {job.contract_type && <ContractBadge type={job.contract_type} />}
          {job.experience_level && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
              {job.experience_level}
            </span>
          )}
          {job.sector && (
            <span className="text-xs bg-navy-50 text-navy-700 px-2.5 py-0.5 rounded-full">
              {job.sector}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span>{[job.commune, job.city].filter(Boolean).join(", ")}</span>
          </div>
          <span className="text-xs text-gray-400">
            {daysAgo === 0 ? "Aujourd'hui" : daysAgo === 1 ? "Hier" : `Il y a ${daysAgo}j`}
          </span>
        </div>
      </Link>

      {/* Favorites button — outside Link, absolute positioned */}
      <button
        onClick={handleFavorite}
        title={favored ? "Retirer des favoris" : "Ajouter aux favoris"}
        className={`absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
          favored
            ? "text-orange-500 bg-orange-50"
            : "text-gray-300 hover:text-orange-400 hover:bg-orange-50 opacity-0 group-hover:opacity-100"
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={favored ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  );
}
