export interface UiPreferences {
  sound: boolean;
  motion: "system" | "reduced";
  showHints: boolean;
}

export const PREFERENCES_KEY = "sky-sprout-runner:ui-preferences:v1";
export const DEFAULT_PREFERENCES: UiPreferences = {
  sound: true,
  motion: "system",
  showHints: true,
};
type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;

function browserStorage(): PreferenceStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function readPreferences(storage = browserStorage()): UiPreferences {
  try {
    const value = JSON.parse(storage?.getItem(PREFERENCES_KEY) ?? "null");
    if (!value || typeof value !== "object") return { ...DEFAULT_PREFERENCES };
    return {
      sound: typeof value.sound === "boolean" ? value.sound : true,
      motion: value.motion === "reduced" ? "reduced" : "system",
      showHints: typeof value.showHints === "boolean" ? value.showHints : true,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

let current = readPreferences();
const listeners = new Set<() => void>();
export const getPreferences = () => current;
export function subscribePreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function updatePreferences(
  changes: Partial<UiPreferences>,
  storage = browserStorage(),
): boolean {
  current = { ...current, ...changes };
  listeners.forEach((listener) => listener());
  try {
    if (!storage) return false;
    storage.setItem(PREFERENCES_KEY, JSON.stringify(current));
    return true;
  } catch {
    return false;
  }
}
export function prefersReducedMotion(): boolean {
  return (
    current.motion === "reduced" ||
    (typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
  );
}
