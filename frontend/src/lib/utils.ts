// Utility functions

/**
 * Format a number as VND currency string.
 * Example: 35000 → "35,000đ"
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

/**
 * Format an ISO date string to Vietnamese locale time.
 * Example: "2026-07-12T14:25:30+07:00" → "14:25"
 */
export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get initials from product name (max 2 chars).
 * Example: "Cà phê sữa" → "CS", "Bánh flan" → "BF"
 */
export function getInitials(name: string): string {
  const words = name.split(" ");
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Generate a simple unique ID (browser-only, not crypto-secure).
 */
export function nanoid(): string {
  return Math.random().toString(36).substring(2, 10);
}
