import { Helmet } from "react-helmet-async";

const SITE_URL  = "https://jobci.vercel.app";
const SITE_NAME = "JobCI";
const DEFAULT_DESC = "Toutes les offres d'emploi de Côte d'Ivoire réunies en un seul endroit. CDI, CDD, Stage, Freelance — Abidjan et toute la Côte d'Ivoire.";
const DEFAULT_IMG  = `${SITE_URL}/icon-512.png`;

export default function SEO({ title, description, url, image, jsonLd }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Emploi Côte d'Ivoire`;
  const desc      = description ?? DEFAULT_DESC;
  const canonical = url ?? SITE_URL;
  const img       = image ?? DEFAULT_IMG;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:image"       content={img} />
      <meta property="og:locale"      content="fr_CI" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image"       content={img} />

      {/* Données structurées JSON-LD (Google Rich Results) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
