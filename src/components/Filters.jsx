const COMMUNES = [
  "Toutes", "Plateau", "Cocody", "Yopougon", "Abobo",
  "Adjamé", "Marcory", "Treichville", "Port-Bouët",
  "Koumassi", "Bingerville",
];

const CONTRATS = ["Tous", "CDI", "CDD", "Stage", "Freelance", "Alternance"];

const SECTEURS = [
  "Tous", "Informatique", "Finance & Banque", "BTP & Immobilier",
  "Télécommunications", "Marketing", "Santé", "Éducation",
  "Commerce & Distribution", "Transport & Logistique",
];

export default function Filters({ commune, contrat, secteur, onCommune, onContrat, onSecteur, onReset, hasActive }) {
  return (
    <aside className="lg:w-64 flex-shrink-0 space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
          Commune
        </h2>
        <div className="space-y-1">
          {COMMUNES.map(c => (
            <button
              key={c}
              onClick={() => onCommune(c)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                ${commune === c
                  ? "bg-navy-900 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-50"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
          Type de contrat
        </h2>
        <div className="flex flex-wrap gap-2">
          {CONTRATS.map(c => (
            <button
              key={c}
              onClick={() => onContrat(c)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                ${contrat === c
                  ? "bg-navy-900 text-white border-navy-900"
                  : "border-gray-200 text-gray-600 hover:border-navy-300"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
          Secteur d'activité
        </h2>
        <select
          value={secteur}
          onChange={e => onSecteur(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                     text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-400"
        >
          {SECTEURS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {hasActive && (
        <button
          onClick={onReset}
          className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium
                     underline underline-offset-2 text-center"
        >
          Réinitialiser les filtres
        </button>
      )}
    </aside>
  );
}
