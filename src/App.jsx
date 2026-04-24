import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { FavoritesProvider } from "./hooks/useFavorites";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import RecruiterRoute from "./components/RecruiterRoute";
import DashboardPage from "./pages/DashboardPage";
import PublierPage from "./pages/PublierPage";
import CandidaturesPage from "./pages/CandidaturesPage";
import HomePage from "./pages/HomePage";
import JobDetail from "./pages/JobDetail";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ContactPage from "./pages/ContactPage";
import FavoritesPage from "./pages/FavoritesPage";
import AlertesPage from "./pages/AlertesPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
        <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/offres/:id" element={<JobDetail />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/dashboard" element={<RecruiterRoute><DashboardPage /></RecruiterRoute>} />
          <Route path="/publier" element={<RecruiterRoute><PublierPage /></RecruiterRoute>} />
          <Route path="/modifier/:id" element={<RecruiterRoute><PublierPage /></RecruiterRoute>} />
          <Route path="/candidatures/:jobId" element={<RecruiterRoute><CandidaturesPage /></RecruiterRoute>} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/inscription" element={<RegisterPage />} />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/postuler"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                  Page postuler — à venir
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/favoris"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alertes"
            element={
              <ProtectedRoute>
                <AlertesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        </div>
        <Footer />
        </div>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
