import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalize<T, K extends keyof T>(
  items: T[],
  key: K,
): Record<Extract<T[K], PropertyKey>, T> {
  return items.reduce(
    (acc, item) => {
      const k = item[key] as Extract<T[K], PropertyKey>;
      acc[k] = item;
      return acc;
    },
    {} as Record<Extract<T[K], PropertyKey>, T>,
  );
}
