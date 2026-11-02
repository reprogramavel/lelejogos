export const STORAGE_KEYS = {
  solitaire: 'paciencia.v1',
  sound: 'paciencia.sound',
  favorites: 'lele.favorites.v1',
  pife: 'lele.pife.v1',
  termo: 'lele.termo.v1',
  theme: 'lele.theme.v1',
} as const;
export function readStorage(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  }
  catch {
    return null;
  }
}
export function writeStorage(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  }
  catch {
    return false;
  }
}
