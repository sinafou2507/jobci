import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate("/");
  };

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <nav className="sticky top-0 z-50 bg-navy-900 border-b border-navy-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
            J
          </span>
          <span className="text-white font-semibold text-lg tracking-tight">JobCI</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              pathname === "/" ? "text-white" : "text-navy-300 hover:text-white"
            }`}
          >
            Offres
          </Link>
          <Link
            to="/contact"
            className={`text-sm font-medium transition-colors ${
              pathname === "/contact" ? "text-white" : "text-navy-300 hover:text-white"
            }`}
          >
            Contact
          </Link>

          {!loading && (
            <>
              {user ? (
                <div className="relative ml-1" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <span className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials}
                    </span>
                    <span className="text-white text-sm font-medium hidden sm:block max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-navy-300 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link
                        to="/profil"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mon profil
                      </Link>
                      {user?.user_metadata?.role === "recruteur" ? (
                        <Link
                          to="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                          </svg>
                          Mes offres
                        </Link>
                      ) : (
                        <Link
                          to="/favoris"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Mes favoris
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/connexion"
                    className="text-sm font-medium text-navy-300 hover:text-white transition-colors"
                  >
                    Connexion
                  </Link>
                    <Link
                    to="/inscription"
                    className="ml-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
