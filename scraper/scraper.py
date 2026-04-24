#!/usr/bin/env python3
"""
JobCI Scraper — emploi.ci + goafricaonline.com/ci/emploi
Usage : python scraper.py [--pages N] [--site emploi.ci|goafricaonline|all]

SQL à exécuter une fois dans Supabase avant le premier run :
--------------------------------------------------------------
create table if not exists public.scraping_logs (
  id          uuid primary key default gen_random_uuid(),
  source      text,
  started_at  timestamptz,
  ended_at    timestamptz,
  inserted    integer default 0,
  updated     integer default 0,
  skipped     integer default 0,
  errors      integer default 0,
  status      text,
  message     text
);
--------------------------------------------------------------
"""

import argparse
import os
import re
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# ── Chargement .env ──────────────────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit("❌  SUPABASE_URL et SUPABASE_SERVICE_KEY requis dans scraper/.env")

# ── Client REST Supabase (HTTP direct, compatible tous formats de clé) ────────
DB_HEADERS = {
    "apikey":        SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type":  "application/json",
    "Prefer":        "return=minimal",
}
REST = f"{SUPABASE_URL}/rest/v1"

DELAY = 0.5

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept":          "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.5",
}

# ── Référentiels ──────────────────────────────────────────────────────────────
COMMUNES = [
    "Plateau", "Cocody", "Yopougon", "Abobo", "Adjamé",
    "Marcory", "Treichville", "Port-Bouët", "Port-Bouet",
    "Koumassi", "Bingerville", "Attécoubé", "Attecoube",
    "Songon", "Anyama",
]
COMMUNES_NORM = {c.lower().replace("-", " "): c for c in COMMUNES}
COMMUNES_NORM.update({"port bouet": "Port-Bouët", "attecoube": "Attécoubé"})

# Villes de Côte d'Ivoire (hors communes d'Abidjan)
CI_CITIES = [
    "Abidjan", "Bouaké", "Yamoussoukro", "San-Pédro", "San Pedro",
    "Daloa", "Korhogo", "Man", "Gagnoa", "Aboisso", "Divo", "Soubré",
    "Agboville", "Dimbokro", "Touba", "Odienné", "Boundiali",
    "Ferkessédougou", "Ferké", "Katiola", "Séguéla", "Mankono",
    "Issia", "Lakota", "Guiglo", "Sassandra", "Grand-Bassam",
    "Tiassalé", "Dabou", "Jacqueville", "Grand-Lahou", "Adzopé",
    "Akoupé", "Abengourou", "Bondoukou", "Bouna", "Tanda",
    "Toumodi", "Daoukro", "Bongouanou", "Sikensi", "Alepe",
    "Djebonoua", "Bouaflé", "Vavoua", "Zouan-Hounien", "Tabou",
    "Méagui", "Grand-Béréby", "Bloléquin", "Duékoué", "Bangolo",
    "Danané", "Biankouma", "Sipilou", "Zoukougbeu", "Sinfra",
    "Oumé", "Tiébissou", "Béoumi", "Sakassou", "M'Bahiakro",
    "Prikro", "Agnibilékrou", "Tiapoum", "Grand-Lahou",
]
CI_CITIES_NORM = {c.lower().replace("-", " ").replace("'", "'"): c for c in CI_CITIES}
CI_CITIES_NORM.update({
    "san pedro": "San-Pédro",
    "ferke": "Ferkessédougou",
    "ferkessedougou": "Ferkessédougou",
    "seguela": "Séguéla",
    "odienne": "Odienné",
})

CONTRACT_KW = {
    "cdi": "CDI", "c.d.i": "CDI",
    "cdd": "CDD", "c.d.d": "CDD", "intérim": "CDD", "interim": "CDD",
    "stage": "Stage", "stagiaire": "Stage", "volontaire": "Stage",
    "freelance": "Freelance", "free-lance": "Freelance", "consultant": "Freelance",
    "alternance": "Alternance", "apprenti": "Alternance",
}

SECTOR_KW = {
    "informatique": "Informatique", "développeur": "Informatique",
    "developpeur": "Informatique", "digital": "Informatique",
    "réseau": "Informatique", "logiciel": "Informatique",
    "data scientist": "Informatique", "fullstack": "Informatique",
    "webmaster": "Informatique", "infographist": "Informatique",
    "banque": "Finance & Banque", "finance": "Finance & Banque",
    "comptab": "Finance & Banque", "audit": "Finance & Banque",
    "assurance": "Finance & Banque", "trésorerie": "Finance & Banque",
    "btp": "BTP & Immobilier", "bâtiment": "BTP & Immobilier",
    "batiment": "BTP & Immobilier", "immobilier": "BTP & Immobilier",
    "génie civil": "BTP & Immobilier", "terrassement": "BTP & Immobilier",
    "soudeur": "BTP & Immobilier", "électricien": "BTP & Immobilier",
    "telecom": "Télécommunications", "télécommunication": "Télécommunications",
    "marketing": "Marketing", "commercial": "Marketing",
    "communication": "Marketing", "community manager": "Marketing",
    "santé": "Santé", "médecin": "Santé", "pharmacie": "Santé",
    "infirmier": "Santé", "médical": "Santé",
    "éducation": "Éducation", "enseignant": "Éducation", "formateur": "Éducation",
    "scolaire": "Éducation", "pédagog": "Éducation",
    "commerce": "Commerce & Distribution", "vente": "Commerce & Distribution",
    "distribution": "Commerce & Distribution", "merchandis": "Commerce & Distribution",
    "transport": "Transport & Logistique", "logistique": "Transport & Logistique",
    "supply chain": "Transport & Logistique", "chauffeur": "Transport & Logistique",
    "livreur": "Transport & Logistique", "coursier": "Transport & Logistique",
    "agricol": "Agriculture & Agro-industrie", "agro": "Agriculture & Agro-industrie",
    "agroalimentaire": "Agriculture & Agro-industrie", "agropastorale": "Agriculture & Agro-industrie",
    "botaniste": "Agriculture & Agro-industrie", "forestier": "Agriculture & Agro-industrie",
    "industri": "Industrie & Production", "production": "Industrie & Production",
    "machiniste": "Industrie & Production", "opérateur": "Industrie & Production",
    "mécanicien": "Industrie & Production", "maintenance": "Industrie & Production",
    "hôtel": "Hôtellerie & Restauration", "restaur": "Hôtellerie & Restauration",
    "cuisinier": "Hôtellerie & Restauration", "chef de cuisine": "Hôtellerie & Restauration",
    "réceptionniste": "Hôtellerie & Restauration", "bagagiste": "Hôtellerie & Restauration",
    "ressources humaines": "Ressources Humaines", "rh ": "Ressources Humaines",
    "recrutement": "Ressources Humaines", "drh": "Ressources Humaines",
    "juridique": "Juridique", "juriste": "Juridique", "droit": "Juridique",
    "avocat": "Juridique", "notaire": "Juridique",
    "énergie": "Énergie & Mines", "mine": "Énergie & Mines",
    "pétrole": "Énergie & Mines", "offshore": "Énergie & Mines",
    "électrotechni": "Énergie & Mines", "rov": "Énergie & Mines",
    "secrétaire": "Secrétariat & Administration", "secretaire": "Secrétariat & Administration",
    "assistante de direction": "Secrétariat & Administration",
    "assistant de direction": "Secrétariat & Administration",
    "administratif": "Secrétariat & Administration", "administrative": "Secrétariat & Administration",
    "archiviste": "Secrétariat & Administration",
    "ong": "ONG & International", "ngo": "ONG & International",
    "humanitaire": "ONG & International", "coordinat": "ONG & International",
    "coopération": "ONG & International",
}


# ── Stats ─────────────────────────────────────────────────────────────────────
@dataclass
class RunStats:
    source: str
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    inserted: int = 0
    updated: int = 0
    skipped: int = 0
    errors: int = 0

    def log(self, status: str, message: str = ""):
        ended_at = datetime.now(timezone.utc)
        try:
            r = requests.post(f"{REST}/scraping_logs", headers=DB_HEADERS, json={
                "source": self.source,
                "started_at": self.started_at.isoformat(),
                "ended_at": ended_at.isoformat(),
                "inserted": self.inserted,
                "updated": self.updated,
                "skipped": self.skipped,
                "errors": self.errors,
                "status": status,
                "message": message,
            }, timeout=10)
            if not r.ok:
                print(f"  [warn] scraping_logs : {r.text[:100]}")
        except Exception as e:
            print(f"  [warn] scraping_logs : {e}")

        duration = (ended_at - self.started_at).total_seconds()
        print(
            f"\n{'='*58}\n"
            f"  {self.source} — {status.upper()}\n"
            f"  Durée: {duration:.1f}s | "
            f"Insérées: {self.inserted} | MàJ: {self.updated} | "
            f"Ignorées: {self.skipped} | Erreurs: {self.errors}\n"
            f"{'='*58}"
        )


# ── Helpers ───────────────────────────────────────────────────────────────────
def detect_commune(text: str) -> str | None:
    t = text.lower().replace("-", " ")
    for key, commune in COMMUNES_NORM.items():
        if key in t:
            return commune
    return None


def detect_city(title: str, region: str = "", full_text: str = "") -> str:
    # 1. Cherche dans le titre après le dernier tiret : "Titre - Ville"
    if " - " in title:
        candidate = title.rsplit(" - ", 1)[-1].strip()
        norm = candidate.lower().replace("-", " ").replace("'", "'")
        if norm in CI_CITIES_NORM:
            return CI_CITIES_NORM[norm]

    # 2. Cherche dans le champ région/localisation
    for text in [region, full_text]:
        t = text.lower().replace("-", " ").replace("'", "'")
        for key, city in CI_CITIES_NORM.items():
            if key in t:
                return city

    return "Abidjan"


def detect_contract(text: str) -> str | None:
    t = text.lower()
    for kw, label in CONTRACT_KW.items():
        if kw in t:
            return label
    return None


def detect_sector(text: str) -> str | None:
    t = text.lower()
    for kw, label in SECTOR_KW.items():
        if kw in t:
            return label
    return None


def clean(text: str | None) -> str | None:
    if not text:
        return None
    return re.sub(r"\s+", " ", text).strip() or None


MONTHS_FR = {
    "janvier": 1, "janv": 1,
    "février": 2, "fevrier": 2, "fév": 2, "fev": 2,
    "mars": 3,
    "avril": 4, "avr": 4,
    "mai": 5,
    "juin": 6,
    "juillet": 7, "juil": 7,
    "août": 8, "aout": 8,
    "septembre": 9, "sept": 9,
    "octobre": 10, "oct": 10,
    "novembre": 11, "nov": 11,
    "décembre": 12, "decembre": 12, "déc": 12, "dec": 12,
}


def parse_date_text(text: str) -> str | None:
    """Convertit un texte de date en ISO 8601. Retourne None si non reconnu."""
    if not text:
        return None
    t = text.lower().strip()
    now = datetime.now(timezone.utc)

    if "aujourd" in t:
        return now.isoformat()
    if "hier" in t:
        return (now - timedelta(days=1)).isoformat()

    # "il y a X jours / semaines / mois"
    m = re.search(r"il y a\s+(\d+)\s+(jour|semaine|mois)", t)
    if m:
        n, unit = int(m.group(1)), m.group(2)
        delta = timedelta(days=n) if unit == "jour" else timedelta(weeks=n) if unit == "semaine" else timedelta(days=n * 30)
        return (now - delta).isoformat()

    # "dd/mm/yyyy", "dd-mm-yyyy" ou "dd.mm.yyyy" (format emploi.ci)
    m = re.search(r"\b(\d{1,2})[/\-\.](\d{1,2})[/\-\.](\d{4})\b", t)
    if m:
        try:
            return datetime(int(m.group(3)), int(m.group(2)), int(m.group(1)), tzinfo=timezone.utc).isoformat()
        except ValueError:
            pass

    # "dd mois yyyy" ou "dd mois. yyyy"
    m = re.search(r"\b(\d{1,2})\s+([a-zéèêàûùôî]+)\.?\s+(\d{4})\b", t)
    if m:
        month_num = MONTHS_FR.get(m.group(2).rstrip("."))
        if month_num:
            try:
                return datetime(int(m.group(3)), month_num, int(m.group(1)), tzinfo=timezone.utc).isoformat()
            except ValueError:
                pass

    return None


def fetch(url: str, session: requests.Session) -> BeautifulSoup | None:
    try:
        r = session.get(url, headers=HEADERS, timeout=20, allow_redirects=True)
        r.raise_for_status()
        return BeautifulSoup(r.content, "lxml")
    except Exception as e:
        print(f"  [err] fetch {url[:70]} → {e}")
        return None


def upsert_job(job: dict, stats: RunStats):
    try:
        check = requests.get(
            f"{REST}/jobs",
            headers=DB_HEADERS,
            params={"source_url": f"eq.{job['source_url']}", "select": "id"},
            timeout=15,
        )
        check.raise_for_status()
        exists = check.json()

        if exists:
            r = requests.patch(
                f"{REST}/jobs",
                headers=DB_HEADERS,
                json=job,
                params={"source_url": f"eq.{job['source_url']}"},
                timeout=15,
            )
            r.raise_for_status()
            stats.updated += 1
            print(f"  [upd] {job['title'][:68]}")
        else:
            r = requests.post(f"{REST}/jobs", headers=DB_HEADERS, json=job, timeout=15)
            r.raise_for_status()
            stats.inserted += 1
            print(f"  [new] {job['title'][:68]}")
    except Exception as e:
        stats.errors += 1
        print(f"  [err] upsert — {e}")


def build_job(title, company, source_url, full_text, extra=None, region: str = "") -> dict:
    job = {
        "title":          clean(title),
        "company_name":   clean(company) or "Non précisé",
        "city":           detect_city(title or "", region, full_text),
        "commune":        detect_commune(full_text),
        "contract_type":  detect_contract(full_text),
        "sector":         detect_sector(full_text),
        "source_url":     source_url,
        "is_scraped":     True,
        "is_active":      True,
    }
    if extra:
        job.update({k: v for k, v in extra.items() if v is not None})
    return job


# ═══════════════════════════════════════════════════════════════════════════════
#  SCRAPER 1 — emploi.ci
#  Sélecteurs validés sur le HTML réel du 22/04/2026
# ═══════════════════════════════════════════════════════════════════════════════
BASE_EMPLOI = "https://www.emploi.ci"


def _parse_emploi_card(card) -> dict | None:
    """Extrait les champs d'une card .card-job-detail de emploi.ci"""
    title_el = card.select_one("h3 a, h2 a")
    if not title_el:
        return None
    title = clean(title_el.get_text())
    if not title:
        return None

    href = title_el.get("href", "")
    source_url = href if href.startswith("http") else urljoin(BASE_EMPLOI, href)

    company_el = card.select_one("a.company-name, .card-job-company")
    company = clean(company_el.get_text()) if company_el else None

    # Données structurées dans les <li>
    contract = experience = region = None
    for li in card.select("ul li"):
        txt = li.get_text(" ", strip=True)
        strong = li.select_one("strong")
        val = clean(strong.get_text()) if strong else None
        if not val:
            continue
        if "Contrat" in txt:
            # "CDI & Freelance" → on garde le premier mot-clé reconnu
            contract = detect_contract(val) or val.split("&")[0].strip()
        elif "xpérience" in txt:
            experience = val
        elif "égion" in txt or "ocalisa" in txt:
            region = val

    full_text = f"{title} {company or ''} {region or ''} {card.get_text(' ')}"

    # Extraction date de publication
    posted_at = None
    for el in card.select("time, [class*='date'], [class*='time'], [class*='publi'], li, span"):
        txt = el.get("datetime") or el.get_text(" ", strip=True)
        posted_at = parse_date_text(txt)
        if posted_at:
            break

    extra = {
        "contract_type":    contract or detect_contract(full_text),
        "experience_level": experience,
        "commune":          detect_commune(region or full_text),
    }
    if posted_at:
        extra["created_at"] = posted_at

    return build_job(title, company, source_url, full_text, extra=extra, region=region or "")


def scrape_emploi_ci(max_pages: int = 5):
    stats = RunStats(source="emploi.ci")
    session = requests.Session()
    print(f"\n{'─'*58}")
    print(f"  Scraping emploi.ci (max {max_pages} pages)…")
    print(f"{'─'*58}")

    for page in range(1, max_pages + 1):
        url = f"{BASE_EMPLOI}/recherche-jobs-cote-ivoire" + (f"?page={page}" if page > 1 else "")
        soup = fetch(url, session)
        if not soup:
            break

        cards = soup.select(".card-job-detail")
        if not cards:
            print(f"  [emploi.ci] page {page} — aucune offre, arrêt.")
            break

        print(f"  [emploi.ci] page {page} — {len(cards)} offres")

        for card in cards:
            try:
                job = _parse_emploi_card(card)
                if not job or not job.get("title"):
                    stats.skipped += 1
                    continue
                upsert_job(job, stats)
            except Exception as e:
                stats.errors += 1
                print(f"  [err] parse card : {e}")
            time.sleep(DELAY)

        # Pagination emploi.ci : vérifier s'il y a une page suivante
        next_btn = soup.select_one("a[rel='next'], .pager__item--next a, li.next a")
        if not next_btn and page > 1:
            break

    stats.log("success")


# ═══════════════════════════════════════════════════════════════════════════════
#  SCRAPER 2 — goafricaonline.com/ci/emploi
#  Sélecteurs validés sur le HTML réel du 22/04/2026
# ═══════════════════════════════════════════════════════════════════════════════
BASE_GOAFRICA = "https://www.goafricaonline.com"


def _parse_goafrica_card(card) -> dict | None:
    """Extrait les champs d'une card job de goafricaonline."""
    link_el = card.select_one("a[href*='/ci/emploi/job-']")
    if not link_el:
        return None
    title = clean(link_el.get_text())
    source_url = link_el.get("href", "")
    if not source_url.startswith("http"):
        source_url = urljoin(BASE_GOAFRICA, source_url)

    # Intitulé du poste (ligne en dessous du titre)
    job_title_el = card.select_one("p.text-gray-800, [class*='jobtitle']")
    job_subtitle = clean(job_title_el.get_text()) if job_title_el else ""

    # Entreprise : div.font-bold qui n'est pas le titre de l'offre
    company_el = card.select_one("div.font-bold:not(a), [class*='company']")
    company = clean(company_el.get_text()) if company_el else None

    # Secteur entreprise (texte italique sous le nom)
    sector_el = card.select_one("[class*='italic'], [class*='font-italic']")
    sector_txt = clean(sector_el.get_text()) if sector_el else ""

    # Localisation (texte après le drapeau CI)
    loc_el = card.select_one("img[alt=\"Côte d'Ivoire\"]")
    loc_text = ""
    if loc_el:
        loc_parent = loc_el.parent
        loc_text = clean(loc_parent.get_text()) or ""

    full_text = f"{title} {job_subtitle} {company or ''} {sector_txt} {loc_text} {card.get_text(' ')}"

    # Extraction date de publication
    posted_at = None
    for el in card.select("time, [class*='date'], [class*='time'], [class*='publi'], span"):
        txt = el.get("datetime") or el.get_text(" ", strip=True)
        posted_at = parse_date_text(txt)
        if posted_at:
            break

    extra = {
        "sector":  detect_sector(f"{sector_txt} {job_subtitle} {title}"),
        "commune": detect_commune(loc_text + " " + full_text),
    }
    if posted_at:
        extra["created_at"] = posted_at

    return build_job(title, company, source_url, full_text, extra=extra, region=loc_text)


def scrape_goafricaonline(max_pages: int = 5):
    stats = RunStats(source="goafricaonline.com")
    session = requests.Session()
    print(f"\n{'─'*58}")
    print(f"  Scraping goafricaonline.com (max {max_pages} pages)…")
    print(f"{'─'*58}")

    for page in range(1, max_pages + 1):
        url = f"{BASE_GOAFRICA}/ci/emploi" + (f"?page={page}" if page > 1 else "")
        soup = fetch(url, session)
        if not soup:
            break

        # Cards : parent des liens /ci/emploi/job-XXXXX
        job_links = soup.find_all("a", href=re.compile(r"/ci/emploi/job-\d+"))
        if not job_links:
            print(f"  [goafrica] page {page} — aucune offre, arrêt.")
            break

        # Remonter au conteneur flex englobant chaque offre
        cards = []
        seen = set()
        for a in job_links:
            p = a.parent
            for _ in range(6):
                if p is None:
                    break
                pid = id(p)
                if pid not in seen and p.name == "div" and "flex" in " ".join(p.get("class", [])):
                    seen.add(pid)
                    cards.append(p)
                    break
                p = p.parent

        print(f"  [goafrica] page {page} — {len(cards)} offres")

        for card in cards:
            try:
                job = _parse_goafrica_card(card)
                if not job or not job.get("title"):
                    stats.skipped += 1
                    continue
                upsert_job(job, stats)
            except Exception as e:
                stats.errors += 1
                print(f"  [err] parse card : {e}")
            time.sleep(DELAY)

        # Pagination : ?page=N (les numéros sont dans les liens)
        next_pages = soup.select("a[href*='?page=']")
        current_max = max(
            (int(re.search(r"page=(\d+)", a["href"]).group(1))
             for a in next_pages if re.search(r"page=(\d+)", a.get("href", ""))),
            default=0,
        )
        if page >= current_max:
            break

    stats.log("success")


# ═══════════════════════════════════════════════════════════════════════════════
#  SCRAPER 3 — educarriere.ci
#  Sélecteurs validés sur le HTML réel du 24/04/2026
# ═══════════════════════════════════════════════════════════════════════════════
BASE_EDUCARRIERE = "https://emploi.educarriere.ci"

CONTRACT_EDUCARRIERE = {
    "emploi": "CDI",
    "stage": "Stage",
    "consultance": "Freelance",
    "alternance": "Alternance",
    "bénévolat": "Stage",
    "benevolat": "Stage",
}


def _parse_educarriere_card(card) -> dict | None:
    title_el = card.select_one("h4.post-title > a")
    if not title_el:
        return None
    title = clean(title_el.get_text())
    if not title:
        return None

    href = title_el.get("href", "")
    source_url = href if href.startswith("http") else urljoin(BASE_EDUCARRIERE, href)

    # Société dans img[title] : "SOCIÉTÉ recrute TITRE"
    company = None
    img_el = card.select_one("img[title]")
    if img_el:
        img_title = img_el.get("title", "")
        if " recrute " in img_title:
            company = clean(img_title.split(" recrute ")[0])

    # Type de contrat via le badge "racing"
    contract_el = card.select_one("a.racing")
    contract_raw = clean(contract_el.get_text()).lower() if contract_el else ""
    contract = CONTRACT_EDUCARRIERE.get(contract_raw) or detect_contract(contract_raw) or "CDI"

    # Date de publication dans span.rt-meta
    posted_at = None
    for li in card.select("span.rt-meta ul li"):
        txt = li.get_text(" ", strip=True)
        if "dition" in txt:
            posted_at = parse_date_text(txt)
            if posted_at:
                break

    full_text = f"{title} {company or ''} {card.get_text(' ')}"

    extra = {"contract_type": contract}
    if posted_at:
        extra["created_at"] = posted_at

    return build_job(title, company, source_url, full_text, extra=extra)


def scrape_educarriere(max_pages: int = 5):
    stats = RunStats(source="educarriere.ci")
    session = requests.Session()
    print(f"\n{'─'*58}")
    print(f"  Scraping educarriere.ci (max {max_pages} pages)…")
    print(f"{'─'*58}")

    for page in range(1, max_pages + 1):
        # Page 1 = /emploi/page/all, pages suivantes = /emploi/page/emploi/N
        url = (f"{BASE_EDUCARRIERE}/emploi/page/all" if page == 1
               else f"{BASE_EDUCARRIERE}/emploi/page/emploi/{page}")
        soup = fetch(url, session)
        if not soup:
            break

        cards = soup.select("div.rt-post.post-md.style-8")
        if not cards:
            print(f"  [educarriere] page {page} — aucune offre, arrêt.")
            break

        print(f"  [educarriere] page {page} — {len(cards)} offres")

        for card in cards:
            try:
                job = _parse_educarriere_card(card)
                if not job or not job.get("title"):
                    stats.skipped += 1
                    continue
                upsert_job(job, stats)
            except Exception as e:
                stats.errors += 1
                print(f"  [err] parse card : {e}")
            time.sleep(DELAY)

        # Continuer seulement s'il y a un lien "Suivant"
        next_btn = soup.select_one("a[href*='/emploi/page/emploi/']")
        if not next_btn:
            break

    stats.log("success")


# ── CLI ────────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="JobCI Scraper")
    parser.add_argument(
        "--site",
        choices=["emploi.ci", "goafricaonline", "educarriere", "all"],
        default="all",
        help="Site à scraper (défaut: all)",
    )
    parser.add_argument(
        "--pages",
        type=int,
        default=5,
        help="Nombre max de pages par site (défaut: 5)",
    )
    args = parser.parse_args()

    print(f"\n{'═'*58}")
    print(f"  JobCI Scraper — {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print(f"  Site: {args.site} | Pages max: {args.pages}")
    print(f"{'═'*58}")

    if args.site in ("emploi.ci", "all"):
        scrape_emploi_ci(max_pages=args.pages)

    if args.site in ("goafricaonline", "all"):
        scrape_goafricaonline(max_pages=args.pages)

    if args.site in ("educarriere", "all"):
        scrape_educarriere(max_pages=args.pages)

    print("\nTerminé.\n")


if __name__ == "__main__":
    main()
