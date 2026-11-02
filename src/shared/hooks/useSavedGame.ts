import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../lib/storage';

export function useSavedGame<T>(key: string, validate: (value: unknown) => value is T, create: () => T) {
  const [game, setGame] = useState<T>(() => {
    const saved = readStorage(key) as { version?: number; game?: unknown } | null;
    return saved?.version === 1 && validate(saved.game) ? saved.game : create();
  });
  const [saveError, setSaveError] = useState(false);
  useEffect(() => { setSaveError(!writeStorage(key, { version: 1, game })); }, [key, game]);
  return { game, setGame, saveError };
}
