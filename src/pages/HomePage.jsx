import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import SEO from "../components/SEO";

// type "all" | "city" | "commune" | "sep" (séparateur visuel)
const LOCALISATIONS = [
  { label: "Toutes",                  value: "Toutes",       type: "all" },
  { label: "Abidjan (toute la ville)",value: "Abidjan",      type: "city" },
  { label: "Communes d'Abidjan",      value: null,           type: "sep" },
  { label: "Plateau",                 value: "Plateau",      type: "commune" },
  { label: "Cocody",                  value: "Cocody",       type: "commune" },
  { label: "Yopougon",                value: "Yopougon",     type: "commune" },
  { label: "Abobo",                   value: "Abobo",        type: "commune" },
  { label: "Adjamé",                  value: "Adjamé",       type: "commune" },
  { label: "Marcory",                 value: "Marcory",      type: "commune" },
  { label: "Treichville",             value: "Treichville",  type: "commune" },
  { label: "Port-Bouët",              value: "Port-Bouët",   type: "commune" },
  { label: "Koumassi",                value: "Koumassi",     type: "commune" },
  { label: "Bingerville",             value: "Bingerville",  type: "commune" },
  { label: "Autres villes CI",        value: null,           type: "sep" },
  { label: "Bouaké",                  value: "Bouaké",       type: "city" },
  { label: "Yamoussoukro",            value: "Yamoussoukro", type: "city" },
  { label: "San-Pédro",               value: "San-Pédro",    type: "city" },
  { label: "Daloa",                   value: "Daloa",        type: "city" },
  { label: "Korhogo",                 value: "Korhogo",      type: "city" },
  { label: "Man",                     value: "Man",          type: "city" },
  { label: "Gagnoa",                  value: "Gagnoa",       type: "city" },
  { label: "Aboisso",                 value: "Aboisso",      type: "city" },
  { label: "Divo",                    value: "Divo",         type: "city" },
  { label: "Soubré",                  value: "Soubré",       type: "city" },
];

const CONTRATS = ["Tous", "CDI", "CDD", "Stage", "Freelance", "Alternance"];

const SECTEURS = [
  "Tous", "Informatique", "Finance & Banque", "BTP & Immobilier",
  "Télécommunications", "Marketing", "Santé", "Éducation",
  "Commerce & Distribution", "Transport & Logistique",
  "Agriculture & Agro-industrie", "Industrie & Production",
  "Hôtellerie & Restauration", "Ressources Humaines", "Juridique",
  "Énergie & Mines", "Secrétariat & Administration", "ONG & International", "Autre",
];

const CONTRACT_COLORS = {
  CDI:        "bg-emerald-100 text-emerald-700 border border-emerald-200",
  CDD:        "bg-blue-100 text-blue-700 border border-blue-200",
  Stage:      "bg-amber-100 text-amber-700 border border-amber-200",
  Freelance:  "bg-purple-100 text-purple-700 border border-purple-200",
  Alternance: "bg-pink-100 text-pink-700 border border-pink-200",
};

const CONTRACT_ACCENT = {
  CDI:        "border-l-emerald-400",
  CDD:        "border-l-blue-400",
  Stage:      "border-l-amber-400",
  Freelance:  "border-l-purple-400",
  Alternance: "border-l-pink-400",
};

function ContractBadge({ type }) {
  const cls = CONTRACT_COLORS[type] ?? "bg-gray-100 text-gray-600 border border-gray-200";
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
      {type}
    </span>
  );
}

function JobCard({ job }) {
  const daysAgo = Math.floor((Date.now() - new Date(job.created_at)) / 86_400_000);
  const accent = CONTRACT_ACCENT[job.contract_type] ?? "border-l-gray-300";
  const isNew = daysAgo === 0;

  return (
    <Link
      to={`/offres/${job.id}`}
      className={`group block bg-white border border-gray-100 border-l-4 ${accent}
                 rounded-2xl p-5 hover:shadow-xl hover:shadow-navy-900/10 hover:-translate-y-1
                 hover:border-gray-200 transition-all duration-250`}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100
                        flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
          {job.company_logo ? (
            <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-navy-700 font-bold text-base">
              {(job.company_name ?? "?")[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 truncate font-medium">{job.company_name}</p>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug mt-0.5
                         group-hover:text-navy-700 transition-colors line-clamp-2">
            {job.title}
          </h3>
        </div>
        {isNew && (
          <span className="flex-shrink-0 text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">
            Nouveau
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {job.contract_type && <ContractBadge type={job.contract_type} />}
        {job.sector && (
          <span className="text-xs bg-navy-50 text-navy-600 px-2.5 py-0.5 rounded-full border border-navy-100">
            {job.sector}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 border-l-4 border-l-gray-200 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-4/5" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <div className="h-5 w-12 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-3 bg-gray-200 rounded w-1/6" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [jobs, setJobs]             = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearch]    = useState("");
  const [localisation, setLocalisation] = useState("Toutes");
  const [contrat, setContrat]       = useState("Tous");
  const [secteur, setSecteur]       = useState("Tous");
  const [page, setPage]             = useState(1);

  const PAGE_SIZE = 12;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("jobs")
        .select("*", { count: "exact" })
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (localisation !== "Toutes") {
        const loc = LOCALISATIONS.find(l => l.value === localisation);
        if (loc?.type === "city")    query = query.eq("city", localisation);
        if (loc?.type === "commune") query = query.eq("commune", localisation);
      }
      if (contrat !== "Tous")   query = query.eq("contract_type", contrat);
      if (secteur !== "Tous")   query = query.eq("sector", secteur);
      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      const { data, count, error } = await query;
      if (error) throw error;
      setJobs(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      console.error("Erreur chargement offres :", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, localisation, contrat, secteur, page]);

  useEffect(() => { setPage(1); }, [searchQuery, localisation, contrat, secteur]);
  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasFilters = localisation !== "Toutes" || contrat !== "Tous" || secteur !== "Tous" || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Offres d'emploi en Côte d'Ivoire"
        description={`${totalCount ? `${totalCount}+ ` : ""}offres d'emploi en Côte d'Ivoire. CDI, CDD, Stage, Freelance à Abidjan, Bouaké, Yamoussoukro et partout en Côte d'Ivoire.`}
        url="https://jobci.vercel.app"
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <header className="bg-navy-900">
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-14 md:pt-16 md:pb-16">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 bg-white/10 border border-white/20
                          rounded-full px-3 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-dot-pulse" />
            <span className="text-navy-300 text-xs font-medium">
              {totalCount > 0
                ? `${totalCount.toLocaleString("fr-FR")} offres disponibles`
                : "Côte d'Ivoire · Abidjan & Intérieur"}
            </span>
          </div>

          <h1 className="animate-fade-up text-3xl md:text-5xl font-bold text-white leading-tight mb-3 max-w-2xl"
              style={{ animationDelay: "80ms" }}>
            Trouvez votre <span className="hero-highlight">emploi idéal</span>
          </h1>
          <p className="animate-fade-up text-navy-300 text-base md:text-lg mb-8 max-w-lg"
             style={{ animationDelay: "160ms" }}>
            Toutes les offres d'emploi de Côte d'Ivoire réunies en un seul endroit.
          </p>

          {/* Barre de recherche */}
          <div className="animate-fade-up flex flex-col sm:flex-row gap-2 max-w-2xl"
               style={{ animationDelay: "240ms" }}>
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Titre, entreprise, mot-clé..."
                value={searchQuery}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchJobs()}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
              />
            </div>
            <button
              onClick={fetchJobs}
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white
                         font-semibold px-7 py-3.5 rounded-xl transition-colors whitespace-nowrap
                         shadow-lg shadow-orange-500/30 text-sm"
            >
              Rechercher
            </button>
          </div>

          {/* Stats rapides */}
          <div className="animate-fade-up flex flex-wrap gap-6 mt-8"
               style={{ animationDelay: "320ms" }}>
            {[
              { label: "emploi.ci", icon: "🔗" },
              { label: "goafricaonline.com", icon: "🔗" },
              { label: "educarriere.ci", icon: "🔗" },
              { label: "Mis à jour quotidiennement", icon: "🔄" },
            ].map(({ label, icon }) => (
              <div key={label} className="flex items-center gap-1.5 text-navy-300 text-xs">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── CONTENU PRINCIPAL ────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar filtres */}
          <aside className="lg:w-60 flex-shrink-0 space-y-4">

            {/* Localisation */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                Localisation
              </h2>
              <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1">
                {LOCALISATIONS.map((loc, i) =>
                  loc.type === "sep" ? (
                    <p key={i} className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-3 pt-3 pb-1">
                      {loc.label}
                    </p>
                  ) : (
                    <button
                      key={loc.value}
                      onClick={() => setLocalisation(loc.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                        ${localisation === loc.value
                          ? "bg-navy-900 text-white font-medium shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                        ${loc.type === "commune" ? "pl-5 text-xs" : ""}`}
                    >
                      {loc.label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Type de contrat */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Contrat
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {CONTRATS.map(c => (
                  <button
                    key={c}
                    onClick={() => setContrat(c)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all
                      ${contrat === c
                        ? "bg-navy-900 text-white border-navy-900 shadow-sm"
                        : "border-gray-200 text-gray-500 hover:border-navy-300 hover:text-navy-700"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Secteur */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
                Secteur
              </h2>
              <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1">
                {SECTEURS.map(s => (
                  <button
                    key={s}
                    onClick={() => setSecteur(s)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                      ${secteur === s
                        ? "bg-navy-900 text-white font-medium shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            {hasFilters && (
              <button
                onClick={() => { setLocalisation("Toutes"); setContrat("Tous"); setSecteur("Tous"); setSearch(""); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-orange-600
                           hover:text-orange-700 font-semibold bg-orange-50 hover:bg-orange-100
                           rounded-xl py-2.5 transition-colors border border-orange-100"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
                Réinitialiser les filtres
              </button>
            )}
          </aside>

          {/* Grille des offres */}
          <div className="flex-1 min-w-0">
            {/* Compteur */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-medium text-gray-700">
                {loading ? (
                  <span className="text-gray-400">Chargement...</span>
                ) : totalCount > 0 ? (
                  <>
                    <span className="text-navy-900 font-bold">{totalCount.toLocaleString("fr-FR")}</span>
                    {" "}offre{totalCount > 1 ? "s" : ""} trouvée{totalCount > 1 ? "s" : ""}
                  </>
                ) : "Aucune offre trouvée"}
              </p>
              {!loading && totalCount > 0 && (
                <span className="text-xs text-gray-400">
                  Page {page} / {totalPages}
                </span>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <p className="text-gray-700 font-semibold">Aucune offre trouvée</p>
                <p className="text-gray-400 text-sm mt-1">Essayez d'élargir vos critères de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jobs.map((job, i) => (
                  <div key={job.id} className="animate-fade-up"
                       style={{ animationDelay: `${i * 45}ms` }}>
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium
                             disabled:opacity-30 hover:bg-white hover:shadow-sm transition-all text-gray-600"
                >
                  ← Préc.
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all
                        ${page === p
                          ? "bg-navy-900 text-white shadow-sm"
                          : "text-gray-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium
                             disabled:opacity-30 hover:bg-white hover:shadow-sm transition-all text-gray-600"
                >
                  Suiv. →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
