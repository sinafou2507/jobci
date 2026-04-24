import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    closeDrawer();
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

  const isRecruiter = user?.user_metadata?.role === "recruteur";

  const navLinkCls = (path) =>
    `text-sm font-medium transition-colors ${
      pathname === path ? "text-white" : "text-navy-300 hover:text-white"
    }`;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-navy-900 border-b border-navy-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
              J
            </span>
            <span className="text-white font-semibold text-lg tracking-tight">JobCI</span>
          </Link>

          {/* Desktop — liens + user */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className={navLinkCls("/")}>Offres</Link>
            <Link to="/contact" className={navLinkCls("/contact")}>Contact</Link>

            {!loading && (
              <>
                {user ? (
                  <div className="relative ml-1" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((v) => !v)}
                      className="flex items-center gap-2 focus:outline-none"
                    >
                      <span className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initials}
                      </span>
                      <span className="text-white text-sm font-medium hidden sm:block max-w-[120px] truncate">
                        {displayName}
                      </span>
                      <svg
                        className={`w-3.5 h-3.5 text-navy-300 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        <DropdownLinks isRecruiter={isRecruiter} onClose={() => setDropdownOpen(false)} onSignOut={handleSignOut} />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link to="/connexion" className="text-sm font-medium text-navy-300 hover:text-white transition-colors">
                      Connexion
                    </Link>
                    <Link to="/inscription" className="ml-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
                      S'inscrire
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile — avatar (si connecté) + burger */}
          <div className="flex md:hidden items-center gap-3">
            {!loading && user && (
              <span className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </span>
            )}
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-navy-800 transition-colors"
              aria-label="Menu"
            >
              <span className="w-5 h-0.5 bg-white rounded-full" />
              <span className="w-5 h-0.5 bg-white rounded-full" />
              <span className="w-5 h-0.5 bg-white rounded-full" />
            </button>
          </div>
        </div>
      </nav>

      {/* Drawer mobile — overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer mobile — panneau */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-navy-900 shadow-2xl flex flex-col
                    transition-transform duration-300 ease-in-out md:hidden
                    ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-navy-800 flex-shrink-0">
          <Link to="/" onClick={closeDrawer} className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">J</span>
            <span className="text-white font-semibold text-lg tracking-tight">JobCI</span>
          </Link>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-navy-300 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">

          {/* Profil utilisateur connecté */}
          {!loading && user && (
            <div className="flex items-center gap-3 px-3 py-3 mb-4 bg-navy-800 rounded-xl">
              <span className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                <p className="text-navy-400 text-xs truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Navigation principale */}
          <DrawerLink to="/" label="Offres" pathname={pathname} onClick={closeDrawer}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </DrawerLink>

          <DrawerLink to="/contact" label="Contact" pathname={pathname} onClick={closeDrawer}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </DrawerLink>

          {!loading && (
            <>
              {user ? (
                <>
                  <div className="h-px bg-navy-800 my-3" />
                  <DrawerLink to="/profil" label="Mon profil" pathname={pathname} onClick={closeDrawer}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </DrawerLink>

                  {isRecruiter ? (
                    <DrawerLink to="/dashboard" label="Mes offres" pathname={pathname} onClick={closeDrawer}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                    </DrawerLink>
                  ) : (
                    <DrawerLink to="/favoris" label="Mes favoris" pathname={pathname} onClick={closeDrawer}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </DrawerLink>
                  )}

                  <div className="h-px bg-navy-800 my-3" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <div className="h-px bg-navy-800 my-3" />
                  <DrawerLink to="/connexion" label="Connexion" pathname={pathname} onClick={closeDrawer}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </DrawerLink>
                  <Link
                    to="/inscription"
                    onClick={closeDrawer}
                    className="flex items-center justify-center gap-2 mt-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
                  >
                    S'inscrire gratuitement
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function DrawerLink({ to, label, pathname, onClick, children }) {
  const active = pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-orange-500 text-white"
          : "text-navy-300 hover:bg-navy-800 hover:text-white"
      }`}
    >
      <span className="flex-shrink-0">{children}</span>
      {label}
    </Link>
  );
}

function DropdownLinks({ isRecruiter, onClose, onSignOut }) {
  return (
    <>
      <Link to="/profil" onClick={onClose} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Mon profil
      </Link>
      {isRecruiter ? (
        <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          Mes offres
        </Link>
      ) : (
        <Link to="/favoris" onClick={onClose} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Mes favoris
        </Link>
      )}
      <hr className="my-1 border-gray-100" />
      <button onClick={onSignOut} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Déconnexion
      </button>
    </>
  );
}
