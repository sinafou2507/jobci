import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../lib/supabase";
import { getFavoriteIds } from "../lib/favorites";

const FavoritesContext = createContext({ favIds: new Set(), toggle: async () => false });

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favIds, setFavIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setFavIds(new Set(getFavoriteIds(null)));
      return;
    }
    supabase
      .from("favorites")
      .select("job_id")
      .eq("user_id", user.id)
      .then(({ data }) => setFavIds(new Set((data ?? []).map((f) => f.job_id))));
  }, [user?.id]);

  const toggle = async (jobId) => {
    if (!user) return false;

    if (favIds.has(jobId)) {
      await supabase.from("favorites")
        .delete().eq("user_id", user.id).eq("job_id", jobId);
      setFavIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
    } else {
      await supabase.from("favorites")
        .insert({ user_id: user.id, job_id: jobId });
      setFavIds((prev) => new Set([...prev, jobId]));
    }
    return true;
  };

  return (
    <FavoritesContext.Provider value={{ favIds, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
