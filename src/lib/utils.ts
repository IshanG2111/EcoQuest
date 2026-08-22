import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** DiceBear v8 Adventurer — deterministic from display name seed */
export function getAvatarUrl(seed?: string | null) {
  const finalSeed = encodeURIComponent((seed || 'Explorer').trim());
  return `https://api.dicebear.com/8.x/adventurer/svg?seed=${finalSeed}&backgroundColor=0f172a&radius=50`;
}

