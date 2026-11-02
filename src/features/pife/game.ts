import { label, rank, shuffle, suit, suits } from '../../shared/lib/cards.ts';

export type PifeScore = { player: number; cpu: number; draws: number };
export type PifeGame = {
  stock: number[];
  waste: number[];
  player: number[];
  cpu: number[];
  phase: 'draw' | 'discard' | 'cpu' | 'finished';
  result: 'player' | 'cpu' | 'draw' | null;
  drawnCard: number | null;
  fromWaste: boolean;
  turns: number;
  score: PifeScore;
  log: string[];
};
export type Arrangement = { groups: number[][]; loose: number[] };

export function isMeld(cards: readonly number[]): boolean {
  if (cards.length < 3 || new Set(cards).size !== cards.length) return false;
  const ranks = cards.map(rank).sort((a, b) => a - b);
  if (ranks.every(value => value === ranks[0])) return new Set(cards.map(suit)).size >= 3;
  if (!cards.every(card => suit(card) === suit(cards[0]))) return false;
  const consecutive = (values: number[]) => values.every((value, index) => index === 0 || value === values[index - 1] + 1);
  return consecutive(ranks) || (ranks[0] === 1 && consecutive([...ranks.slice(1), 14]));
}

// A bit mask prevents a physical card from being reused in two different combinations.
export function arrangeHand(hand: readonly number[]): Arrangement {
  if (hand.length > 10 || new Set(hand).size !== hand.length) return { groups: [], loose: [...hand] };
  const groups: { mask: number; cards: number[] }[] = [];
  for (let mask = 1; mask < (1 << hand.length); mask++) {
    const cards = hand.filter((_, index) => mask & (1 << index));
    if (!isMeld(cards)) continue;
    const aceHigh = cards.some(card => rank(card) === 13) && cards.some(card => rank(card) === 1);
    cards.sort((a, b) => (aceHigh && rank(a) === 1 ? 14 : rank(a)) - (aceHigh && rank(b) === 1 ? 14 : rank(b)) || suit(a) - suit(b));
    groups.push({ mask, cards });
  }
  const memo = new Map<number, { groups: number[][]; count: number }>();
  function solve(remaining: number): { groups: number[][]; count: number } {
    if (!remaining) return { groups: [], count: 0 };
    const cached = memo.get(remaining);
    if (cached) return cached;
    const first = remaining & -remaining;
    let best = solve(remaining ^ first);
    for (const group of groups) {
      if (!(group.mask & first) || (group.mask & remaining) !== group.mask) continue;
      const rest = solve(remaining ^ group.mask);
      const count = group.cards.length + rest.count;
      if (count > best.count || (count === best.count && rest.groups.length + 1 < best.groups.length)) {
        best = { groups: [group.cards, ...rest.groups], count };
      }
    }
    memo.set(remaining, best);
    return best;
  }
  const result = solve((1 << hand.length) - 1).groups;
  const covered = new Set(result.flat());
  return { groups: result, loose: hand.filter(card => !covered.has(card)) };
}

export const winningHand = (hand: readonly number[]) => (hand.length === 9 || hand.length === 10) &&
  new Set(hand).size === hand.length && arrangeHand(hand).loose.length === 0;
const cardName = (id: number) => `${label(id)}${suits[suit(id)]}`;
const addLog = (game: PifeGame, message: string) => [message, ...game.log].slice(0, 5);

function finish(game: PifeGame, result: NonNullable<PifeGame['result']>, message: string): PifeGame {
  return { ...game, phase: 'finished', result, drawnCard: null, fromWaste: false,
    score: { ...game.score, [result === 'draw' ? 'draws' : result]: game.score[result === 'draw' ? 'draws' : result] + 1 },
    log: addLog(game, message) };
}

export function newPife(score: PifeScore = { player: 0, cpu: 0, draws: 0 }, deck = shuffle(Array.from({ length: 104 }, (_, i) => i))): PifeGame {
  const game: PifeGame = {
    player: deck.slice(0, 9), cpu: deck.slice(9, 18), waste: deck.slice(18, 19), stock: deck.slice(19),
    phase: 'draw', result: null, drawnCard: null, fromWaste: false, turns: 0,
    score: { ...score }, log: ['Sua vez: compre do monte ou pegue a carta do descarte.'],
  };
  return game;
}

function replenish(game: PifeGame): PifeGame {
  if (game.stock.length || game.waste.length < 2) return game;
  return { ...game, stock: shuffle(game.waste.slice(0, -1)), waste: game.waste.slice(-1),
    log: addLog(game, 'As cartas do descarte foram embaralhadas para renovar o monte.') };
}

export function drawPife(game: PifeGame, from: 'stock' | 'waste'): PifeGame | null {
  if (game.phase !== 'draw') return null;
  const current = from === 'stock' ? replenish(game) : game;
  const source = current[from];
  if (!source.length) return from === 'stock'
    ? finish(current, 'draw', 'O monte acabou. Esta rodada terminou empatada.') : null;
  const card = source.at(-1)!;
  return { ...current, [from]: source.slice(0, -1), player: [...current.player, card],
    drawnCard: card, fromWaste: from === 'waste', phase: 'discard',
    log: addLog(current, from === 'waste' ? `Você pegou ${cardName(card)} do descarte.` : 'Você comprou uma carta do monte.') };
}

export function canDiscard(game: PifeGame, card: number): boolean {
  return game.phase === 'discard' && game.player.includes(card) && !(game.fromWaste && game.drawnCard === card);
}

export function declarePife(game: PifeGame): PifeGame | null {
  if (game.phase !== 'discard' || !winningHand(game.player)) return null;
  return finish({ ...game, turns: game.turns + 1 }, 'player', 'Você combinou as dez cartas e bateu sem descartar!');
}

export function discardPife(game: PifeGame, card: number): PifeGame | null {
  if (!canDiscard(game, card)) return null;
  const next: PifeGame = { ...game, player: game.player.filter(id => id !== card), waste: [...game.waste, card],
    phase: 'cpu', drawnCard: null, fromWaste: false, turns: game.turns + 1,
    log: addLog(game, `Você descartou ${cardName(card)}.`) };
  if (winningHand(next.player)) return finish(next, 'player', 'Você combinou as nove cartas e bateu!');
  return next;
}

function handScore(hand: readonly number[]): number {
  const arrangement = arrangeHand(hand);
  let potential = 0;
  for (let i = 0; i < arrangement.loose.length; i++) for (let j = i + 1; j < arrangement.loose.length; j++) {
    const a = arrangement.loose[i], b = arrangement.loose[j];
    if (rank(a) === rank(b) && suit(a) !== suit(b)) potential += 25;
    if (suit(a) === suit(b)) {
      const distance = Math.abs(rank(a) - rank(b));
      if (distance === 1) potential += 18;
      if (distance === 2) potential += 8;
      if (rank(a) + rank(b) === 14 && distance === 12) potential += 12;
    }
  }
  return (hand.length - arrangement.loose.length) * 1000 + potential - arrangement.loose.reduce((sum, card) => sum + rank(card), 0) / 100;
}

export function chooseDiscard(hand: readonly number[], forbidden?: number): number {
  let best = -Infinity;
  let selected = hand.find(card => card !== forbidden)!;
  for (const card of hand) {
    if (card === forbidden) continue;
    const score = handScore(hand.filter(id => id !== card));
    if (score > best) { best = score; selected = card; }
  }
  return selected;
}

export function cpuTurn(game: PifeGame): PifeGame {
  if (game.phase !== 'cpu') return game;
  let current = game;
  const top = game.waste.at(-1);
  const option = top === undefined ? [] : [...game.cpu, top];
  const discardOption = top === undefined ? undefined : chooseDiscard(option, top);
  // The opponent only considers its own cards and the visible discard, never future stock cards.
  const takeWaste = top !== undefined && (winningHand(option) || handScore(option.filter(card => card !== discardOption)) > handScore(game.cpu));
  if (!takeWaste) current = replenish(game);
  const source = takeWaste ? current.waste : current.stock;
  if (!source.length) return finish(current, 'draw', 'As cartas disponíveis acabaram. Rodada empatada.');
  const drawn = source.at(-1)!;
  const hand = [...current.cpu, drawn];
  if (winningHand(hand)) {
    return finish({ ...current, cpu: hand, turns: current.turns + 1,
      stock: takeWaste ? current.stock : current.stock.slice(0, -1),
      waste: takeWaste ? current.waste.slice(0, -1) : current.waste,
    }, 'cpu', 'Lelê combinou as dez cartas e bateu sem descartar.');
  }
  const discarded = chooseDiscard(hand, takeWaste ? drawn : undefined);
  const next: PifeGame = {
    ...current,
    stock: takeWaste ? current.stock : current.stock.slice(0, -1),
    waste: [...(takeWaste ? current.waste.slice(0, -1) : current.waste), discarded],
    cpu: hand.filter(card => card !== discarded), phase: 'draw', turns: current.turns + 1,
    log: addLog(current, `Lelê ${takeWaste ? `pegou ${cardName(drawn)} do descarte` : 'comprou do monte'} e descartou ${cardName(discarded)}.`),
  };
  if (winningHand(next.cpu)) return finish(next, 'cpu', 'Lelê combinou as nove cartas e bateu. Mais uma?');
  return next;
}

export function validPife(value: unknown): value is PifeGame {
  try {
    const game = value as PifeGame;
    const cards = [...game.stock, ...game.waste, ...game.player, ...game.cpu];
    if (cards.length !== 104 || new Set(cards).size !== 104 || cards.some(id => !Number.isInteger(id) || id < 0 || id >= 104)) return false;
    if (!['draw', 'discard', 'cpu', 'finished'].includes(game.phase) || ![null, 'player', 'cpu', 'draw'].includes(game.result)) return false;
    const cpuSizeValid = game.cpu.length === 9 || (game.phase === 'finished' && game.result === 'cpu' && game.cpu.length === 10);
    const playerSizeValid = game.player.length === (game.phase === 'discard' ? 10 : 9) || (game.phase === 'finished' && game.result === 'player' && game.player.length === 10);
    if (!cpuSizeValid || !playerSizeValid || typeof game.fromWaste !== 'boolean') return false;
    if (game.phase === 'discard' && (game.drawnCard === null || !game.player.includes(game.drawnCard))) return false;
    if (game.phase !== 'discard' && (game.drawnCard !== null || game.fromWaste)) return false;
    if ((game.phase === 'finished') !== (game.result !== null)) return false;
    if (game.result === 'player' && !winningHand(game.player)) return false;
    if (game.result === 'cpu' && !winningHand(game.cpu)) return false;
    return Number.isSafeInteger(game.turns) && game.turns >= 0 &&
      !!game.score && [game.score.player, game.score.cpu, game.score.draws].every(n => Number.isInteger(n) && n >= 0) &&
      Array.isArray(game.log) && game.log.length <= 5 && game.log.every(line => typeof line === 'string');
  } catch { return false; }
}
