import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import ApplyModal from "../components/ApplyModal";
import GuestFavoriteModal from "../components/GuestFavoriteModal";

const CONTRACT_COLORS = {
  CDI:        "bg-emerald-100 text-emerald-800",
  CDD:        "bg-blue-100 text-blue-800",
  Stage:      "bg-amber-100 text-amber-800",
  Freelance:  "bg-purple-100 text-purple-800",
  Alternance: "bg-pink-100 text-pink-800",
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favIds, toggle } = useFavorites();
  const [job, setJob]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showModal, setModal]       = useState(false);
  const [showGuestModal, setGuestModal] = useState(false);
  const [favAnimating, setFavAnimating] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        navigate("/", { replace: true });
        return;
      }
      setJob(data);
      setLoading(false);
    }
    fetchJob();
  }, [id, navigate]);

  const favored = job ? favIds.has(job.id) : false;

  const handleFavorite = async () => {
    if (!user) { setGuestModal(true); return; }
    setFavAnimating(true);
    await toggle(job.id);
    setTimeout(() => setFavAnimating(false), 300);
  };

  const handleApplyClick = async () => {
    if (user && job) {
      supabase.from("job_views").insert({ user_id: user.id, job_id: job.id }).then(() => {});
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-6 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (!job) return null;

  const daysAgo = Math.floor((Date.now() - new Date(job.created_at)) / 86_400_000);
  const contractCls = CONTRACT_COLORS[job.contract_type] ?? "bg-gray-100 text-gray-700";
  const sourceSite = getSourceSite(job.source_url);
  const applyTarget = job.source_url || job.apply_url || null;

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          to="/"
          className="animate-fade-in inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700
                     transition-colors mb-6"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          Retour aux offres
        </Link>

        {/* Carte principale */}
        <div className="animate-fade-up bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center
                            flex-shrink-0 border border-gray-100 overflow-hidden">
              {job.company_logo ? (
                <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain p-1.5" />
              ) : (
                <span className="text-navy-700 font-bold text-2xl">
                  {(job.company_name ?? "?")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">{job.company_name}</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1 leading-snug">
                {job.title}
              </h1>
            </div>
            {/* Bouton favori */}
            <button
              onClick={handleFavorite}
              title={favored ? "Retirer des favoris" : "Sauvegarder l'offre"}
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl
                          border-2 transition-all duration-200
                          ${favored
                            ? "border-orange-400 bg-orange-50 text-orange-500"
                            : "border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-400 hover:bg-orange-50"}
                          ${favAnimating ? "scale-125" : "scale-100"}`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"
                fill={favored ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {job.contract_type && (
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${contractCls}`}>
                {job.contract_type}
              </span>
            )}
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

          {/* Infos clés */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 p-5 bg-gray-50 rounded-xl">
            <InfoItem
              icon={<LocationIcon />}
              label="Localisation"
              value={[job.commune, job.city].filter(Boolean).join(", ") || "Non précisé"}
            />
            {job.salary_min && (
              <InfoItem
                icon={<SalaryIcon />}
                label="Salaire"
                value={`${job.salary_min.toLocaleString("fr-FR")}${job.salary_max ? ` – ${job.salary_max.toLocaleString("fr-FR")}` : "+"} FCFA`}
              />
            )}
            <InfoItem
              icon={<CalendarIcon />}
              label="Publiée"
              value={daysAgo === 0 ? "Aujourd'hui" : daysAgo === 1 ? "Hier" : `Il y a ${daysAgo} jours`}
            />
          </div>

          {/* Description */}
          {job.description && (
            <div className="mt-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Description du poste</h2>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            {applyTarget ? (
              <a
                href={applyTarget}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleApplyClick}
                className="flex items-center justify-center gap-2 w-full bg-orange-500
                           hover:bg-orange-600 active:scale-95 text-white font-semibold py-3.5 rounded-xl
                           transition-all duration-150"
              >
                {sourceSite ? `Postuler sur ${sourceSite}` : "Postuler maintenant"}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <button
                onClick={() => setModal(true)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold
                           py-3.5 rounded-xl transition-colors"
              >
                Postuler maintenant
              </button>
            )}

            {sourceSite && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-3">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Offre publiée originalement sur{" "}
                <a
                  href={job.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-600 hover:underline font-medium"
                >
                  {sourceSite}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {showModal && <ApplyModal job={job} onClose={() => setModal(false)} />}
    </>
  );
}

function getSourceSite(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-gray-400">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function LocationIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function SalaryIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
