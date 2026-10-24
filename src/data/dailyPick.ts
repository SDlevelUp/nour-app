// Choisit l'élément du jour dans une liste : le même toute la journée locale,
// le suivant le lendemain, puis on recommence au début.
export function itemOfTheDay<T>(items: readonly T[], date: Date): T | null {
  if (items.length === 0) return null;
  const dayNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return items[dayNumber % items.length];
}
