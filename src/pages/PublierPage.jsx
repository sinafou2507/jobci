import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const COMMUNES = [
  "Plateau", "Cocody", "Yopougon", "Abobo", "Adjamé",
  "Marcory", "Treichville", "Port-Bouët", "Koumassi", "Bingerville",
];

const CONTRACT_TYPES = ["CDI", "CDD", "Stage", "Freelance", "Alternance"];

const SECTORS = [
  "Informatique", "Finance & Banque", "BTP & Immobilier",
  "Télécommunications", "Marketing", "Santé", "Éducation",
  "Commerce & Distribution", "Transport & Logistique", "Autre",
];

const EXPERIENCE = ["Débutant", "1-2 ans", "3-5 ans", "5+ ans", "Non précisé"];

const defaultExpiry = () =>
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

const EMPTY = {
  title: "", company_name: "", description: "",
  contract_type: "", sector: "", commune: "",
  city: "Abidjan", salary_min: "", salary_max: "",
  experience_level: "", apply_url: "",
  expires_at: defaultExpiry(),
};

export default function PublierPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          navigate("/dashboard");
          return;
        }
        setForm({
          title:            data.title ?? "",
          company_name:     data.company_name ?? "",
          description:      data.description ?? "",
          contract_type:    data.contract_type ?? "",
          sector:           data.sector ?? "",
          commune:          data.commune ?? "",
          city:             data.city ?? "Abidjan",
          salary_min:       data.salary_min ?? "",
          salary_max:       data.salary_max ?? "",
          experience_level: data.experience_level ?? "",
          apply_url:        data.apply_url ?? "",
          expires_at:       data.expires_at ? data.expires_at.split("T")[0] : defaultExpiry(),
        });
        setLoading(false);
      });
  }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      user_id:    user.id,
      is_scraped: false,
      is_active:  true,
    };

    let err;
    if (isEdit) {
      ({ error: err } = await supabase.from("jobs").update(payload).eq("id", id).eq("user_id", user.id));
    } else {
      ({ error: err } = await supabase.from("jobs").insert(payload));
    }

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      navigate("/dashboard");
    }
  };

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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? "Modifier l'offre" : "Publier une offre"}
          </h1>
          <p className="text-navy-300 text-sm mt-1">
            {isEdit ? "Mettez à jour les informations de votre offre." : "Renseignez les détails du poste à pourvoir."}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          {/* Bloc 1 — Poste */}
          <Section title="Le poste">
            <Field label="Intitulé du poste *">
              <input
                type="text"
                value={form.title}
                onChange={set("title")}
                required
                placeholder="Ex : Développeur React Senior"
                className={inputCls}
              />
            </Field>
            <Field label="Entreprise *">
              <input
                type="text"
                value={form.company_name}
                onChange={set("company_name")}
                required
                placeholder="Nom de votre entreprise"
                className={inputCls}
              />
            </Field>
            <Field label="Description *">
              <textarea
                value={form.description}
                onChange={set("description")}
                required
                rows={6}
                placeholder="Décrivez le poste, les missions, le profil recherché…"
                className={`${inputCls} resize-none`}
              />
            </Field>
          </Section>

          {/* Bloc 2 — Détails */}
          <Section title="Détails du contrat">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Type de contrat">
                <select value={form.contract_type} onChange={set("contract_type")} className={inputCls}>
                  <option value="">— Sélectionner —</option>
                  {CONTRACT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Secteur d'activité">
                <select value={form.sector} onChange={set("sector")} className={inputCls}>
                  <option value="">— Sélectionner —</option>
                  {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Commune">
                <select value={form.commune} onChange={set("commune")} className={inputCls}>
                  <option value="">— Sélectionner —</option>
                  {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Expérience requise">
                <select value={form.experience_level} onChange={set("experience_level")} className={inputCls}>
                  <option value="">— Sélectionner —</option>
                  {EXPERIENCE.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* Bloc 3 — Expiration */}
          <Section title="Date de clôture">
            <Field label="L'offre expire le">
              <input
                type="date"
                value={form.expires_at}
                onChange={set("expires_at")}
                min={new Date().toISOString().split("T")[0]}
                className={inputCls}
              />
            </Field>
            <p className="text-xs text-gray-400">
              L'offre sera automatiquement masquée aux candidats après cette date. Vous pourrez la renouveler depuis votre dashboard.
            </p>
          </Section>

          {/* Bloc 4 — Salaire */}
          <Section title="Rémunération (optionnel)">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Salaire min (FCFA/mois)">
                <input
                  type="number"
                  value={form.salary_min}
                  onChange={set("salary_min")}
                  placeholder="150 000"
                  min={0}
                  className={inputCls}
                />
              </Field>
              <Field label="Salaire max (FCFA/mois)">
                <input
                  type="number"
                  value={form.salary_max}
                  onChange={set("salary_max")}
                  placeholder="300 000"
                  min={0}
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          {/* Bloc 5 — Candidature */}
          <Section title="Lien de candidature (optionnel)">
            <Field label="URL externe">
              <input
                type="url"
                value={form.apply_url}
                onChange={set("apply_url")}
                placeholder="https://votre-site.com/postuler"
                className={inputCls}
              />
            </Field>
            <p className="text-xs text-gray-400">
              Si renseigné, les candidats seront redirigés vers ce lien. Sinon, ils postulent via JobCI.
            </p>
          </Section>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-7 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Publier l'offre"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-sm text-gray-400 hover:text-gray-600 font-medium px-4 py-2.5 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white";

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
