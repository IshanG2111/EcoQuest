import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(seed?: string | null) {
  const finalSeed = seed || 'default';
  // Using 'personas' for a more unique, clean, and professional look
  return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(finalSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,c1e1c1`;
}
