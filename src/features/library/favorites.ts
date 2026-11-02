import { games } from './catalog.ts';
import type { GameId } from './catalog.ts';
import { readStorage, STORAGE_KEYS } from '../../shared/lib/storage.ts';
export function readFavorites(): GameId[] {
  const value = readStorage(STORAGE_KEYS.favorites);
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is GameId => games.some(game => game.id === id)))]
    : [];
}
