import test from 'node:test';
import assert from 'node:assert/strict';
import { arrangeHand, canDiscard, chooseDiscard, cpuTurn, declarePife, discardPife, drawPife, isMeld, newPife, validPife, winningHand } from '../../src/features/pife/game.ts';
import type { PifeGame } from '../../src/features/pife/game.ts';

const deck = Array.from({ length: 104 }, (_, i) => (i * 37 + 17) % 104);
function fixture(player: number[], phase: PifeGame['phase'] = 'draw', waste = [103], cpu?: number[]): PifeGame {
  const opponent = cpu ?? deck.filter(card => !player.includes(card) && !waste.includes(card)).slice(0, 9);
  return { player, cpu: opponent, waste, stock: deck.filter(card => !player.includes(card) && !opponent.includes(card) && !waste.includes(card)),
    phase, result: null, drawnCard: phase === 'discard' ? player.at(-1)! : null, fromWaste: false,
    turns: 0, score: { player: 0, cpu: 0, draws: 0 }, log: [] };
}

test('Pife distribui nove cartas por jogador e preserva dois baralhos completos', () => {
  const game = newPife(undefined, deck);
  assert.equal(game.phase, 'draw');
  assert.equal(game.player.length, 9); assert.equal(game.cpu.length, 9);
  assert.equal(game.stock.length, 85); assert.equal(game.waste.length, 1);
  assert.equal(validPife(game), true);
});
test('trincas exigem naipes diferentes e sequências respeitam a ordem e o naipe', () => {
  assert.equal(isMeld([0, 13, 26]), true);
  assert.equal(isMeld([0, 52, 13]), false);
  assert.equal(isMeld([0, 1, 2]), true);
  assert.equal(isMeld([11, 12, 0]), true);
  assert.equal(isMeld([12, 0, 1]), false);
  assert.equal(isMeld([0, 1, 15]), false);
  assert.equal(isMeld([0, 0, 0]), false);
});
test('uma carta nunca é reutilizada em duas combinações e nenhuma sobra na batida', () => {
  const hand = [0, 13, 26, 1, 14, 27, 2, 15, 28];
  const arranged = arrangeHand(hand);
  assert.equal(arranged.groups.length, 3);
  assert.equal(new Set(arranged.groups.flat()).size, 9);
  assert.equal(winningHand(hand), true);
  assert.equal(winningHand([...hand, 51]), false);
  assert.equal(arrangeHand([0, 1, 2, 3, 4, 13, 26, 7, 8]).groups.length, 2);
});

test('sequências longas e trincas ampliadas respeitam naipes, cartas físicas e posição do ás', () => {
  assert.equal(isMeld([0, 1, 2, 3, 4]), true);
  assert.equal(isMeld([10, 11, 12, 0]), true);
  assert.equal(isMeld([11, 12, 0, 1]), false);
  assert.equal(isMeld([0, 1, 2, 54]), false);
  assert.equal(isMeld([0, 13, 26, 52]), true);
  assert.equal(isMeld([0, 13, 52, 65]), false);
  assert.equal(isMeld([0, 13, 26, 26]), false);
});

test('batidas de nove e dez cartas aceitam sequências de quatro e cinco sem reutilizar cartas', () => {
  const nine = [0, 1, 2, 3, 17, 18, 19, 20, 21];
  const ten = [0, 1, 2, 3, 4, 17, 18, 19, 20, 21];
  for (const hand of [nine, ten]) {
    const arranged = arrangeHand(hand);
    assert.equal(winningHand(hand), true);
    assert.equal(arranged.loose.length, 0);
    assert.equal(new Set(arranged.groups.flat()).size, hand.length);
    assert.equal(arranged.groups.every(isMeld), true);
  }
  assert.equal(winningHand([0, 0, 0, 1, 1, 1, 2, 2, 2]), false);
  assert.equal(winningHand([...ten, 51]), false);
  assert.equal(winningHand(ten.slice(0, 8)), false);
  // Prefer seven covered cards (a trinca plus a run of four) over one run of five.
  assert.equal(arrangeHand([0, 1, 2, 3, 4, 13, 26, 7, 8]).loose.length, 2);
});

test('receber uma mão pronta não encerra a rodada antes da compra obrigatória', () => {
  const player = [0, 13, 26, 1, 14, 27, 2, 15, 28];
  const cpu = [3, 16, 29, 4, 17, 30, 5, 18, 31];
  const initial = newPife(undefined, [...player, ...cpu, ...deck.filter(card => !player.includes(card) && !cpu.includes(card))]);
  assert.equal(initial.phase, 'draw'); assert.equal(initial.result, null);
  assert.equal(declarePife(initial), null);
  assert.equal(initial.score.player + initial.score.cpu, 0);
  const drawn = drawPife(initial, 'stock')!;
  const won = discardPife(drawn, drawn.drawnCard!)!;
  assert.equal(won.result, 'player'); assert.equal(validPife(won), true);
});

test('bater com dez cartas mantém a compra, não descarta e registra apenas uma vitória', () => {
  const game = fixture([0, 1, 2, 3, 4, 17, 18, 19, 20, 21], 'discard');
  const before = structuredClone(game);
  const won = declarePife(game)!;
  assert.equal(won.result, 'player'); assert.equal(won.player.length, 10);
  assert.deepEqual(won.waste, game.waste); assert.deepEqual(won.stock, game.stock);
  assert.equal(won.turns, 1); assert.equal(won.score.player, 1);
  assert.equal(validPife(JSON.parse(JSON.stringify(won))), true);
  assert.equal(declarePife(won), null); assert.equal(cpuTurn(won), won);
  assert.deepEqual(game, before);
  assert.equal(declarePife(fixture([0, 13, 26, 1, 14, 27, 2, 15, 28, 51], 'discard')), null);
});

test('o computador bate com dez cartas comprando do descarte ou do monte', () => {
  const hand = [0, 1, 2, 3, 4, 17, 18, 19, 20, 21];
  for (const from of ['waste', 'stock']) {
    const cpu = hand.slice(0, 9);
    const waste = from === 'waste' ? [103, 21] : [103];
    const player = deck.filter(card => !hand.includes(card) && !waste.includes(card)).slice(0, 9);
    const game = fixture(player, 'cpu', waste, cpu);
    if (from === 'stock') game.stock = [...game.stock.filter(card => card !== 21), 21];
    const next = cpuTurn(game);
    assert.equal(next.result, 'cpu'); assert.equal(next.cpu.length, 10);
    assert.equal(next.score.cpu, 1); assert.deepEqual(next.waste, [103]);
    assert.equal(validPife(JSON.parse(JSON.stringify(next))), true);
    assert.equal(validPife({ ...next, result: 'player' }), false);
  }
});

test('a rodada continua e pode ser restaurada depois de duzentas jogadas', () => {
  const drawn = drawPife(newPife(undefined, deck), 'stock')!;
  const card = drawn.player.find(id => !winningHand(drawn.player.filter(other => other !== id)))!;
  const next = discardPife({ ...drawn, turns: 199 }, card)!;
  assert.equal(next.turns, 200); assert.equal(next.phase, 'cpu');
  assert.equal(next.result, null); assert.equal(next.score.draws, 0);
  assert.equal(validPife({ ...next, turns: 1000 }), true);
});
test('compra e descarte alternam fases sem modificar estados anteriores', () => {
  const initial = newPife(undefined, deck);
  const snapshot = structuredClone(initial);
  const drawn = drawPife(initial, 'stock')!;
  assert.equal(drawn.player.length, 10); assert.equal(drawn.phase, 'discard');
  assert.equal(drawPife(drawn, 'stock'), null);
  assert.equal(discardPife(initial, initial.player[0]), null);
  const discarded = discardPife(drawn, drawn.player[0])!;
  assert.equal(discarded.player.length, 9); assert.equal(discarded.phase, 'cpu');
  assert.equal(validPife(discarded), true); assert.deepEqual(initial, snapshot);
});
test('quem compra do descarte precisa descartar outra carta', () => {
  const game = drawPife(newPife(undefined, deck), 'waste')!;
  assert.equal(canDiscard(game, game.drawnCard!), false);
  assert.equal(discardPife(game, game.drawnCard!), null);
  assert.equal(canDiscard(game, game.player[0]), true);
});
test('bater termina a rodada e registra a vitória uma única vez', () => {
  const game = fixture([0, 13, 26, 1, 14, 27, 2, 15, 28, 51], 'discard');
  const next = discardPife(game, 51)!;
  assert.equal(next.result, 'player'); assert.equal(next.phase, 'finished');
  assert.equal(next.score.player, 1); assert.equal(validPife(next), true);
  assert.equal(cpuTurn(next), next); assert.equal(discardPife(next, 0), null);
  assert.deepEqual(newPife(next.score, deck).score, next.score);
});
test('adversário aproveita uma carta visível que completa a mão e bate', () => {
  const cpu = [0, 13, 26, 1, 14, 27, 2, 15, 50];
  const player = deck.filter(card => !cpu.includes(card) && card !== 28).slice(0, 9);
  const game = fixture(player, 'cpu', [28], cpu);
  const next = cpuTurn(game);
  assert.equal(next.result, 'cpu'); assert.equal(next.score.cpu, 1);
  assert.equal(next.waste.at(-1), 50); assert.equal(validPife(next), true);
});
test('monte vazio recicla o descarte preservando a carta de cima e todos os IDs', () => {
  const game = newPife(undefined, deck);
  game.waste = [...game.stock, ...game.waste]; game.stock = [];
  const top = game.waste.at(-1);
  const next = drawPife(game, 'stock')!;
  assert.equal(next.waste.at(-1), top); assert.equal(next.stock.length, 84);
  assert.equal(validPife(next), true);
});
test('centenas de turnos preservam todas as cartas, fases e placar sem forçar empate', () => {
  for (let round = 0; round < 3; round++) {
    let game = newPife(undefined, Array.from({ length: 104 }, (_, i) => (i * 37 + 17 + round * 19) % 104));
    let steps = 0;
    while (game.phase !== 'finished' && steps++ < 400) {
      if (game.phase === 'draw') game = drawPife(game, 'stock')!;
      if (game.phase === 'discard') game = declarePife(game) ?? discardPife(game, chooseDiscard(game.player, game.fromWaste ? game.drawnCard! : undefined))!;
      if (game.phase === 'cpu') game = cpuTurn(game);
      assert.equal(validPife(game), true);
    }
    assert.equal(game.score.player + game.score.cpu + game.score.draws, game.phase === 'finished' ? 1 : 0);
    assert.equal(game.result === 'draw', false);
  }
});
test('salvamentos inválidos são rejeitados', () => {
  assert.equal(validPife(null), false); assert.equal(validPife({}), false);
  const game = newPife(undefined, deck); game.stock[0] = game.stock[1];
  assert.equal(validPife(game), false);
});
