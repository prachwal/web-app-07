import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 *
 * @param inputs - Class names, arrays, or conditional objects to merge
 * @returns Merged class string with Tailwind conflicts resolved
 *
 * @example
 * ```ts
 * cn('px-2 py-1', 'px-4') // → 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500') // conditional
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
