import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame } from '../../src/features/solitaire/game.ts';
import { loadSession, readSession, resumableProgress } from '../../src/features/solitaire/session.ts';
import { readFavorites } from '../../src/features/library/favorites.ts';
import { STORAGE_KEYS, writeStorage } from '../../src/shared/lib/storage.ts';
test('preserva partidas e favoritos no formato da versão anterior', () => {
  const values = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  try {
    const game = newGame(3);
    game.moves = 8;
    const previousVersion = { version: 1, game, history: [newGame(3)], seconds: 143 };
    values.set('paciencia.v1', JSON.stringify(previousVersion));
    values.set('lele.favorites.v1', JSON.stringify(['pife', 'termo']));
    values.set('paciencia.sound', 'true');
    assert.deepEqual(readSession(), { game, history: previousVersion.history, seconds: 143 });
    assert.deepEqual(resumableProgress(), { moves: 8, seconds: 143 });
    assert.deepEqual(readFavorites(), ['pife', 'termo']);
    assert.equal(STORAGE_KEYS.sound, 'paciencia.sound');
    values.set(STORAGE_KEYS.solitaire, 'corrompido');
    assert.equal(readSession(), null);
    assert.equal(loadSession().game.stock.length, 24);
    values.set(STORAGE_KEYS.favorites, '["pife","pife","inexistente"]');
    assert.deepEqual(readFavorites(), ['pife']);
    values.set(STORAGE_KEYS.favorites, 'null');
    assert.deepEqual(readFavorites(), []);
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error('Bloqueado');
        }, setItem: () => {
          throw new Error('Sem espaço');
        }
      },
    });
    assert.equal(readSession(), null);
    assert.deepEqual(readFavorites(), []);
    assert.equal(writeStorage(STORAGE_KEYS.favorites, ['pife']), false);
  }
  finally {
    if (original)
      Object.defineProperty(globalThis, 'localStorage', original);
    else
      Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
