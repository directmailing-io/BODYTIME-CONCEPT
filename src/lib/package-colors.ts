// Deterministic color per package based on its ID.
// Always returns the same color for the same package ID.

export interface PackageColor {
  bg: string;
  text: string;
  accent: string; // for dot, border, etc.
}

export const PACKAGE_COLORS: PackageColor[] = [
  { bg: '#eff6ff', text: '#1d4ed8', accent: '#3b82f6' }, // blue
  { bg: '#ecfdf5', text: '#065f46', accent: '#10b981' }, // emerald
  { bg: '#fff7ed', text: '#c2410c', accent: '#f97316' }, // orange
  { bg: '#f5f3ff', text: '#5b21b6', accent: '#7c3aed' }, // violet
  { bg: '#fef2f2', text: '#b91c1c', accent: '#ef4444' }, // red
  { bg: '#f0fdfa', text: '#0f5447', accent: '#14b8a6' }, // teal
  { bg: '#fdf2f8', text: '#9d174d', accent: '#ec4899' }, // pink
  { bg: '#fffbeb', text: '#92400e', accent: '#f59e0b' }, // amber
  { bg: '#eef2ff', text: '#3730a3', accent: '#6366f1' }, // indigo
  { bg: '#ecfeff', text: '#155e75', accent: '#06b6d4' }, // cyan
  { bg: '#fff1f2', text: '#9f1239', accent: '#f43f5e' }, // rose
  { bg: '#f0fdf4', text: '#166534', accent: '#22c55e' }, // green
  { bg: '#fefce8', text: '#713f12', accent: '#eab308' }, // yellow
  { bg: '#faf5ff', text: '#581c87', accent: '#a855f7' }, // purple
  { bg: '#f7fee7', text: '#3f6212', accent: '#84cc16' }, // lime
];

export function getPackageColor(packageId: string): PackageColor {
  let hash = 0;
  for (let i = 0; i < packageId.length; i++) {
    hash = ((hash << 5) - hash) + packageId.charCodeAt(i);
    hash |= 0;
  }
  return PACKAGE_COLORS[Math.abs(hash) % PACKAGE_COLORS.length];
}
