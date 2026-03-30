// Image utilities — avatar color generation and cache helpers.
// Phase 3 will add full image compression when expo-image-manipulator is added.

export function getAvatarColor(name: string): string {
  // Deterministic color from name — used when no avatar image is available
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#22c55e',
    '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
