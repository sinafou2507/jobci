import { Link } from "react-router-dom";

export default function GuestFavoriteModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                     rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-navy-900 text-center mb-2">
          Ne perdez plus cette offre !
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          Inscrivez-vous gratuitement pour sauvegarder vos offres et les retrouver à tout moment.
        </p>

        <div className="space-y-2.5">
          <Link
            to="/inscription"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full bg-orange-500
                       hover:bg-orange-600 active:scale-95 text-white font-semibold py-3
                       rounded-xl transition-all duration-150 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            S'inscrire gratuitement
          </Link>
          <Link
            to="/connexion"
            onClick={onClose}
            className="flex items-center justify-center w-full bg-gray-50 hover:bg-gray-100
                       text-gray-700 font-medium py-3 rounded-xl transition-colors text-sm"
          >
            J'ai déjà un compte
          </Link>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
          {[
            { icon: "❤️", text: "Favoris sauvegardés" },
            { icon: "📋", text: "Suivi candidatures" },
            { icon: "🔔", text: "Alertes emploi" },
          ].map(({ icon, text }) => (
            <div key={text} className="text-center">
              <span className="text-xl">{icon}</span>
              <p className="text-[10px] text-gray-400 mt-1 leading-tight">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
