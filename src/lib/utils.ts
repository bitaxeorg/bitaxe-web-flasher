import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// Matches basePath in next.config.js; plain <img> tags don't get it prepended automatically
export const basePath = process.env.NODE_ENV === 'production' ? '/bitaxe-web-flasher' : ''
