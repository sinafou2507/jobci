import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 border-t border-navy-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">J</span>
              <span className="text-white font-semibold text-lg tracking-tight">JobCI</span>
            </Link>
            <p className="text-navy-300 text-sm leading-relaxed">
              Toutes les offres d'emploi de Côte d'Ivoire réunies en un seul endroit.
            </p>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-navy-300 hover:text-white text-sm transition-colors">
                  Offres d'emploi
                </Link>
              </li>
              <li>
                <Link to="/connexion" className="text-navy-300 hover:text-white text-sm transition-colors">
                  Connexion
                </Link>
              </li>
              <li>
                <Link to="/inscription" className="text-navy-300 hover:text-white text-sm transition-colors">
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Contact</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-navy-300 hover:text-white text-sm transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@jobci.ci"
                  className="text-navy-300 hover:text-white text-sm transition-colors"
                >
                  contact@jobci.ci
                </a>
              </li>
              <li>
                <span className="text-navy-300 text-sm">Abidjan, Côte d'Ivoire</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-navy-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-navy-400 text-xs">
            © {year} JobCI. Tous droits réservés.
          </p>
          <div className="flex items-center gap-1 text-navy-400 text-xs">
            <span>Sources :</span>
            <span className="text-navy-300">emploi.ci</span>
            <span>·</span>
            <span className="text-navy-300">jobafricaonline.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
