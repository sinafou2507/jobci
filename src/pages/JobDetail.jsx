import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import ApplyModal from "../components/ApplyModal";
import GuestFavoriteModal from "../components/GuestFavoriteModal";
import SEO from "../components/SEO";

const CONTRACT_COLORS = {
  CDI:        "bg-emerald-100 text-emerald-700",
  CDD:        "bg-blue-100 text-blue-700",
  Stage:      "bg-amber-100 text-amber-700",
  Freelance:  "bg-purple-100 text-purple-700",
  Alternance: "bg-pink-100 text-pink-700",
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
      if (error || !data) { navigate("/", { replace: true }); return; }
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

  const handleApplyClick = () => {
    if (user && job) {
      supabase.from("job_views").insert({ user_id: user.id, job_id: job.id }).then(() => {});
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200" />
        <div className="max-w-2xl mx-auto px-4 -mt-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-200" />
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const daysAgo  = Math.floor((Date.now() - new Date(job.created_at)) / 86_400_000);
  const contractCls = CONTRACT_COLORS[job.contract_type] ?? "bg-gray-100 text-gray-600";
  const sourceSite  = getSourceSite(job.source_url);
  const applyTarget = job.source_url || job.apply_url || null;
  const lieu = [job.commune, job.city].filter(Boolean).join(", ") || "Côte d'Ivoire";
  const hasCompany = job.company_name && job.company_name !== "Non précisé";

  const seoTitle = `${job.title}${hasCompany ? ` — ${job.company_name}` : ""} · ${lieu}`;
  const seoDesc  = job.description
    ? job.description.slice(0, 155).replace(/\s+/g, " ").trim() + "…"
    : `${job.contract_type ?? "Offre"} · ${lieu} — Postulez sur JobCI`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description ?? seoDesc,
    datePosted: new Date(job.created_at).toISOString().split("T")[0],
    hiringOrganization: { "@type": "Organization", name: job.company_name ?? "Entreprise" },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.commune ?? job.city ?? "Abidjan", addressCountry: "CI" } },
    employmentType: job.contract_type === "CDI" ? "FULL_TIME" : job.contract_type === "CDD" ? "TEMPORARY" : job.contract_type === "Stage" ? "INTERN" : "OTHER",
  };

  return (
    <>
      <SEO title={seoTitle} description={seoDesc} url={`https://jobci.vercel.app/offres/${job.id}`} image={job.company_logo ?? undefined} jsonLd={jsonLd} />

      {/* ── HERO ── */}
      <div className="bg-navy-900 pt-4 pb-16 px-4 relative">
        <Link to="/" className="inline-flex items-center gap-1.5 text-navy-300 hover:text-white text-sm transition-colors mb-5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
          Retour
        </Link>

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {hasCompany && (
              <p className="text-orange-400 text-sm font-medium mb-1 truncate">{job.company_name}</p>
            )}
            <h1 className="text-white text-xl font-bold leading-snug">{job.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {job.contract_type && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${contractCls}`}>
                  {job.contract_type}
                </span>
              )}
              {job.sector && (
                <span className="text-xs bg-white/10 text-white/80 px-2.5 py-1 rounded-full">
                  {job.sector}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleFavorite}
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all duration-200
              ${favored ? "border-orange-400 bg-orange-400/20 text-orange-400" : "border-white/20 text-white/50 hover:border-orange-400 hover:text-orange-400"}
              ${favAnimating ? "scale-125" : "scale-100"}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={favored ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 pb-10 space-y-4">

        {/* Carte infos clés */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="grid grid-cols-2 gap-4">
            <InfoTile
              icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>}
              label="Lieu"
              value={lieu}
            />
            <InfoTile
              icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              label="Publiée"
              value={daysAgo === 0 ? "Aujourd'hui" : daysAgo === 1 ? "Hier" : `Il y a ${daysAgo}j`}
            />
            {job.experience_level && (
              <InfoTile
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
                label="Expérience"
                value={job.experience_level}
              />
            )}
            {job.salary_min && (
              <InfoTile
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>}
                label="Salaire"
                value={`${job.salary_min.toLocaleString("fr-FR")}${job.salary_max ? `–${job.salary_max.toLocaleString("fr-FR")}` : "+"} FCFA`}
              />
            )}
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 text-gray-400">
              Description du poste
            </h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>
        )}

        {/* CTA postuler */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {applyTarget ? (
            <a
              href={applyTarget}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApplyClick}
              className="flex items-center justify-center gap-2 w-full bg-orange-500
                         hover:bg-orange-600 active:scale-95 text-white font-semibold py-4 rounded-xl
                         transition-all duration-150 text-base"
            >
              Postuler maintenant
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
          ) : (
            <button
              onClick={() => setModal(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-colors text-base"
            >
              Postuler maintenant
            </button>
          )}

          {sourceSite && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-3">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              Source :{" "}
              <a href={job.source_url} target="_blank" rel="noopener noreferrer" className="text-navy-600 hover:underline font-medium">
                {sourceSite}
              </a>
            </p>
          )}
        </div>
      </div>

      {showModal    && <ApplyModal job={job} onClose={() => setModal(false)} />}
      {showGuestModal && <GuestFavoriteModal onClose={() => setGuestModal(false)} />}
    </>
  );
}

function getSourceSite(url) {
  if (!url) return null;
  try { return new URL(url).hostname.replace("www.", ""); } catch { return null; }
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <span className="text-navy-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
