# JobCI — Guide développement

PWA offres d'emploi Côte d'Ivoire. Stack : React 18 + Vite + Tailwind CSS + Supabase.

## Commandes utiles

```bash
npm run dev       # Dev server http://localhost:5173
npm run build     # Build production (dist/)
npm run preview   # Prévisualiser le build

cd scraper && pip install -r requirements.txt
python scraper.py # Scraper BeautifulSoup
```

## Variables d'environnement

Copier `.env.example` → `.env` et renseigner les clés Supabase.

## Architecture

```
src/
  lib/supabase.js       # Client Supabase singleton
  pages/
    HomePage.jsx        # Liste offres + filtres (NE PAS MODIFIER)
    JobDetail.jsx       # Détail d'une offre + modal candidature
  components/
    Navbar.jsx          # Barre de navigation
    JobCard.jsx         # Carte offre réutilisable
    Filters.jsx         # Sidebar filtres (commune, contrat, secteur)
    SkeletonCard.jsx    # Loader squelette
    ApplyModal.jsx      # Modal formulaire candidature
scraper/
  scraper.py            # Scraping BeautifulSoup → Supabase
  requirements.txt
```

## Supabase — Table `jobs`

| Colonne          | Type      | Notes                        |
|------------------|-----------|------------------------------|
| id               | uuid      | PK                           |
| title            | text      | Intitulé du poste            |
| company_name     | text      |                              |
| company_logo     | text      | URL logo                     |
| description      | text      |                              |
| contract_type    | text      | CDI, CDD, Stage…             |
| sector           | text      |                              |
| commune          | text      | Plateau, Cocody…             |
| city             | text      | Abidjan par défaut           |
| salary_min       | integer   | FCFA                         |
| salary_max       | integer   | FCFA                         |
| experience_level | text      |                              |
| apply_url        | text      | Lien candidature externe     |
| source_url       | text      | URL source scraper           |
| is_scraped       | boolean   |                              |
| is_active        | boolean   | false = masquée              |
| created_at       | timestampz| Auto                         |

## Couleurs Tailwind custom

- `navy-*` : #0F2050 et ses nuances
- `orange-*` : #F97316 (Tailwind orange-500 natif)

## Conventions

- Monnaie : FCFA, formatage `fr-FR`
- Communes : Plateau, Cocody, Yopougon, Abobo, Adjamé, Marcory, Treichville, Port-Bouët, Koumassi, Bingerville
- Pas de commentaires redondants dans le code
