
const key = (userId) => `jobci_favorites_${userId ?? "guest"}`;

export function getFavoriteIds(userId) {
  try {
    return JSON.parse(localStorage.getItem(key(userId)) ?? "[]");
  } catch {
    return [];
  }
}

export function isFavorite(jobId, userId) {
  return getFavoriteIds(userId).includes(jobId);
}

export function toggleFavorite(jobId, userId) {
  const ids = getFavoriteIds(userId);
  const updated = ids.includes(jobId)
    ? ids.filter((id) => id !== jobId)
    : [...ids, jobId];
  localStorage.setItem(key(userId), JSON.stringify(updated));
  return updated;
}
