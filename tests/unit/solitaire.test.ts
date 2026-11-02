import test from 'node:test';
import assert from 'node:assert/strict';
import { automaticTarget, canMove, draw, hint, move, newGame, shuffledDeck, sourceCards, validSavedGame, won } from '../../src/features/solitaire/game.ts';
import type { Game } from '../../src/features/solitaire/game.ts';
const ordered = Array.from({ length: 52 }, (_, i) => i);
const blank = (): Game => ({ ...newGame(), stock: [], waste: [], tableau: [[], [], [], [], [], [], []], foundations: [[], [], [], []] });

test('clique automático prioriza fundações e encontra colunas para cartas e sequências', () => {
  const game = blank();
  game.waste = [0]; game.tableau[0] = [{ id: 14, faceUp: true }];
  assert.deepEqual(automaticTarget(game, { kind: 'waste' }), { kind: 'foundation', pile: 0 });
  game.waste = [];
  game.tableau[0] = [{ id: 17, faceUp: true }, { id: 3, faceUp: true }];
  game.tableau[1] = [{ id: 5, faceUp: true }];
  assert.deepEqual(automaticTarget(game, { kind: 'tableau', pile: 0, index: 0 }), { kind: 'tableau', pile: 1 });
  game.tableau[0] = [{ id: 12, faceUp: true }]; game.tableau[1] = [];
  assert.equal(automaticTarget(game, { kind: 'tableau', pile: 0, index: 0 }), null);
  game.tableau[0] = [{ id: 0, faceUp: false }, { id: 12, faceUp: true }];
  assert.deepEqual(automaticTarget(game, { kind: 'tableau', pile: 0, index: 1 }), { kind: 'tableau', pile: 1 });
  assert.equal(automaticTarget(game, { kind: 'tableau', pile: 0, index: 0 }), null);
  game.foundations[0] = [0];
  assert.equal(automaticTarget(game, { kind: 'foundation', pile: 0 }), null);
});
test('distribui 52 cartas únicas, sete colunas e 24 cartas no monte', () => {
  const game = newGame(1, ordered);
  assert.equal(game.stock.length, 24);
  assert.deepEqual(game.tableau.map(p => p.length), [1, 2, 3, 4, 5, 6, 7]);
  game.tableau.forEach(p => {
    assert.equal(p.filter(c => c.faceUp).length, 1);
    assert.equal(p.at(-1)!.faceUp, true);
  });
  assert.equal(validSavedGame(game), true);
  assert.deepEqual(newGame(1, game.initialDeck), game);
});
test('embaralhamento preserva as 52 cartas', () => {
  for (let i = 0; i < 25; i++)
    assert.deepEqual(shuffledDeck().sort((a, b) => a - b), ordered);
});
test('compra uma ou três cartas sem alterar o estado anterior', () => {
  for (const count of [1, 3] as const) {
    const game = newGame(count, ordered);
    const before = structuredClone(game);
    const next = draw(game)!;
    assert.equal(next.waste.length, count);
    assert.equal(next.stock.length, 24 - count);
    assert.equal(next.waste.at(-1), 24 - count);
    assert.equal(next.moves, 1);
    assert.deepEqual(game, before);
  }
});
test('compra parcial e reciclagem preservam a ordem', () => {
  let game = blank();
  game.stock = [0, 1, 2, 3];
  game.drawCount = 3;
  game = draw(game)!;
  assert.deepEqual(game.waste, [3, 2, 1]);
  game = draw(game)!;
  assert.deepEqual(game.waste, [3, 2, 1, 0]);
  game = draw(game)!;
  assert.deepEqual(game.stock, [0, 1, 2, 3]);
  assert.deepEqual(game.waste, []);
  game = draw(game)!;
  assert.deepEqual(game.waste, [3, 2, 1]);
  assert.equal(draw(blank()), null);
});
test('colunas exigem ordem decrescente e cores alternadas', () => {
  const game = blank();
  game.waste = [17];
  game.tableau[0] = [{ id: 5, faceUp: true }];
  assert.equal(canMove(game, { kind: 'waste' }, { kind: 'tableau', pile: 0 }), true);
  game.waste = [4];
  assert.equal(canMove(game, { kind: 'waste' }, { kind: 'tableau', pile: 0 }), false);
  game.waste = [16];
  assert.equal(canMove(game, { kind: 'waste' }, { kind: 'tableau', pile: 0 }), false);
});
test('move sequência completa e revela a carta que estava coberta', () => {
  const game = blank();
  game.tableau[0] = [{ id: 0, faceUp: false }, { id: 17, faceUp: true }, { id: 3, faceUp: true }];
  game.tableau[1] = [{ id: 5, faceUp: true }];
  const before = structuredClone(game);
  const next = move(game, { kind: 'tableau', pile: 0, index: 1 }, { kind: 'tableau', pile: 1 })!;
  assert.deepEqual(next.tableau[1].map(c => c.id), [5, 17, 3]);
  assert.deepEqual(next.tableau[0], [{ id: 0, faceUp: true }]);
  assert.deepEqual(game, before);
});
test('rejeita cartas cobertas, sequências inválidas e destino na mesma coluna', () => {
  const game = blank();
  game.tableau[0] = [{ id: 12, faceUp: false }];
  assert.deepEqual(sourceCards(game, { kind: 'tableau', pile: 0, index: 0 }), []);
  game.tableau[0] = [{ id: 12, faceUp: true }, { id: 10, faceUp: true }];
  assert.equal(move(game, { kind: 'tableau', pile: 0, index: 0 }, { kind: 'tableau', pile: 1 }), null);
  assert.equal(canMove(game, { kind: 'tableau', pile: 0, index: 1 }, { kind: 'tableau', pile: 0 }), false);
});
test('apenas reis ocupam colunas vazias', () => {
  const game = blank();
  game.waste = [11];
  assert.equal(canMove(game, { kind: 'waste' }, { kind: 'tableau', pile: 0 }), false);
  game.waste = [12];
  assert.equal(canMove(game, { kind: 'waste' }, { kind: 'tableau', pile: 0 }), true);
});
test('fundações exigem ás, mesmo naipe e ordem crescente', () => {
  const game = blank();
  game.waste = [1];
  assert.equal(canMove(game, { kind: 'waste' }, { kind: 'foundation', pile: 0 }), false);
  game.waste = [0];
  const next = move(game, { kind: 'waste' }, { kind: 'foundation', pile: 0 })!;
  next.waste = [14];
  assert.equal(canMove(next, { kind: 'waste' }, { kind: 'foundation', pile: 0 }), false);
  next.waste = [1];
  assert.equal(canMove(next, { kind: 'waste' }, { kind: 'foundation', pile: 0 }), true);
  assert.equal(canMove(next, { kind: 'waste' }, { kind: 'foundation', pile: 9 }), false);
});
test('não envia múltiplas cartas de uma vez à fundação', () => {
  const game = blank();
  game.tableau[0] = [{ id: 14, faceUp: true }, { id: 0, faceUp: true }];
  assert.equal(canMove(game, { kind: 'tableau', pile: 0, index: 0 }, { kind: 'foundation', pile: 0 }), false);
});
test('permite devolver a carta da fundação para uma coluna válida', () => {
  const game = blank();
  game.foundations[0] = [0, 1];
  game.tableau[0] = [{ id: 15, faceUp: true }];
  const next = move(game, { kind: 'foundation', pile: 0 }, { kind: 'tableau', pile: 0 })!;
  assert.deepEqual(next.foundations[0], [0]);
  assert.equal(next.tableau[0].at(-1)!.id, 1);
});
test('dicas propõem movimentos válidos e ignoram mover reis entre colunas vazias', () => {
  const game = blank();
  game.waste = [0];
  const result = hint(game)!;
  assert.equal(canMove(game, result.source, result.target), true);
  game.waste = [];
  game.tableau[0] = [{ id: 12, faceUp: true }];
  assert.equal(hint(game), null);
});

test('dicas encontram uma devolução da fundação quando não há outro movimento na mesa', () => {
  const game = blank();
  game.foundations[0] = [0, 1];
  game.tableau[0] = [{ id: 15, faceUp: true }];
  game.tableau[1] = [{ id: 4, faceUp: true }];
  const result = hint(game)!;
  assert.deepEqual(result, { source: { kind: 'foundation', pile: 0 }, target: { kind: 'tableau', pile: 0 } });
  assert.equal(canMove(game, result.source, result.target), true);
  const next = move(game, result.source, result.target)!;
  assert.equal(next.foundations[0].length, 1);
  assert.deepEqual(next.tableau[0].map(card => card.id), [15, 1]);
});
test('vitória só acontece ao completar as quatro fundações', () => {
  const game = blank();
  assert.equal(won(game), false);
  game.foundations = Array.from({ length: 4 }, (_, s) => Array.from({ length: 13 }, (_, r) => s * 13 + r));
  assert.equal(won(game), true);
  game.foundations[0].pop();
  assert.equal(won(game), false);
});
test('salvamento rejeita dados quebrados, cartas duplicadas e valores inválidos', () => {
  assert.equal(validSavedGame(null), false);
  assert.equal(validSavedGame({}), false);
  const game = newGame();
  assert.equal(validSavedGame(JSON.parse(JSON.stringify(game))), true);
  game.stock[0] = game.stock[1];
  assert.equal(validSavedGame(game), false);
  assert.equal(validSavedGame({ ...newGame(), moves: -1 }), false);
  assert.equal(validSavedGame({ ...newGame(), drawCount: 2 }), false);
});
test('centenas de jogadas preservam todas as cartas e estados válidos', () => {
  for (const count of [1, 3] as const) {
    let game = newGame(count);
    for (let i = 0; i < 500; i++) {
      const result = hint(game);
      const next = result ? move(game, result.source, result.target) : draw(game);
      if (!next)
        break;
      assert.equal(validSavedGame(next), true, `Estado inválido após jogada ${i}`);
      assert.equal(next.moves, game.moves + 1);
      game = next;
    }
  }
});
