import { newGame, validSavedGame, won } from './game.ts';
import type { Game } from './game.ts';
import { readStorage, STORAGE_KEYS } from '../../shared/lib/storage.ts';
export type Session = {
  game: Game;
  history: Game[];
  seconds: number;
};
export const HISTORY_LIMIT = 100;
export function readSession(): Session | null {
  const value = readStorage(STORAGE_KEYS.solitaire) as Record<string, unknown> | null;
  if (!value || value.version !== 1 || !validSavedGame(value.game))
    return null;
  return {
    game: value.game,
    history: Array.isArray(value.history)
      ? value.history.filter(validSavedGame).slice(-HISTORY_LIMIT)
      : [],
    seconds: typeof value.seconds === 'number' && Number.isFinite(value.seconds)
      ? Math.max(0, Math.floor(value.seconds))
      : 0,
  };
}
export function loadSession(): Session {
  return readSession() ?? { game: newGame(), history: [], seconds: 0 };
}
export function resumableProgress(): Pick<Session, 'seconds'> & {
  moves: number;
} | null {
  const session = readSession();
  return session && session.game.moves > 0 && !won(session.game)
    ? { moves: session.game.moves, seconds: session.seconds }
    : null;
}
