import { rank, red, suit } from '../../shared/lib/cards.ts';
export { rank, red, suit, label, suits } from '../../shared/lib/cards.ts';

export type Card = {
  id: number;
  faceUp: boolean;
};
export type Source = {
  kind: 'tableau';
  pile: number;
  index: number;
} | {
  kind: 'waste';
} | {
  kind: 'foundation';
  pile: number;
};
export type Target = {
  kind: 'tableau' | 'foundation';
  pile: number;
};
export type Game = {
  stock: number[];
  waste: number[];
  tableau: Card[][];
  foundations: number[][];
  initialDeck: number[];
  drawCount: 1 | 3;
  moves: number;
};
export function shuffledDeck(): number[] {
  const deck = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
export function newGame(drawCount: 1 | 3 = 1, initialDeck = shuffledDeck()): Game {
  const stock = [...initialDeck];
  const tableau = Array.from({ length: 7 }, (_, column) => Array.from({ length: column + 1 }, (_, row) => ({ id: stock.pop()!, faceUp: row === column })));
  return { stock, tableau, waste: [], foundations: [[], [], [], []], initialDeck: [...initialDeck], drawCount, moves: 0 };
}
export function sourceCards(game: Game, source: Source): number[] {
  if (source.kind === 'waste')
    return game.waste.slice(-1);
  if (source.kind === 'foundation')
    return game.foundations[source.pile]?.slice(-1) ?? [];
  const cards = game.tableau[source.pile]?.slice(source.index);
  if (source.index < 0 || !cards?.length || cards.some(c => !c.faceUp))
    return [];
  if (cards.some((c, i) => i > 0 && (rank(cards[i - 1].id) !== rank(c.id) + 1 || red(cards[i - 1].id) === red(c.id))))
    return [];
  return cards.map(c => c.id);
}
export function canMove(game: Game, source: Source, target: Target): boolean {
  if (source.kind === target.kind && 'pile' in source && source.pile === target.pile)
    return false;
  const cards = sourceCards(game, source);
  if (!cards.length || target.pile < 0)
    return false;
  const first = cards[0];
  if (target.kind === 'foundation') {
    const dest = game.foundations[target.pile];
    return !!dest && cards.length === 1 && rank(first) === dest.length + 1 && (!dest.length || suit(first) === suit(dest[0]));
  }
  const dest = game.tableau[target.pile];
  if (!dest)
    return false;
  const last = dest.at(-1);
  return last ? last.faceUp && rank(last.id) === rank(first) + 1 && red(last.id) !== red(first) : rank(first) === 13;
}
export function move(game: Game, source: Source, target: Target): Game | null {
  if (!canMove(game, source, target))
    return null;
  const cards = sourceCards(game, source);
  // Copy only affected piles. Previous states stay immutable for undo.
  const next: Game = { ...game, tableau: [...game.tableau], foundations: [...game.foundations], moves: game.moves + 1 };
  if (source.kind === 'waste')
    next.waste = game.waste.slice(0, -1);
  else if (source.kind === 'foundation')
    next.foundations[source.pile] = game.foundations[source.pile].slice(0, -1);
  else {
    const remaining = game.tableau[source.pile].slice(0, source.index);
    const top = remaining.at(-1);
    if (top && !top.faceUp)
      remaining[remaining.length - 1] = { ...top, faceUp: true };
    next.tableau[source.pile] = remaining;
  }
  if (target.kind === 'foundation')
    next.foundations[target.pile] = [...next.foundations[target.pile], ...cards];
  else
    next.tableau[target.pile] = [...next.tableau[target.pile], ...cards.map(id => ({ id, faceUp: true }))];
  return next;
}
export function draw(game: Game): Game | null {
  if (!game.stock.length && !game.waste.length)
    return null;
  if (!game.stock.length)
    return { ...game, stock: [...game.waste].reverse(), waste: [], moves: game.moves + 1 };
  const count = Math.min(game.drawCount, game.stock.length);
  return {
    ...game,
    stock: game.stock.slice(0, -count),
    waste: [...game.waste, ...game.stock.slice(-count).reverse()],
    moves: game.moves + 1,
  };
}
export const won = (game: Game) => game.foundations.every(p => p.length === 13);
export function automaticTarget(game: Game, source: Source): Target | null {
  if (source.kind === 'foundation') return null;
  for (let pile = 0; pile < 4; pile++) {
    if (canMove(game, source, { kind: 'foundation', pile })) return { kind: 'foundation', pile };
  }
  for (let pile = 0; pile < 7; pile++) {
    if (game.tableau[pile].length && canMove(game, source, { kind: 'tableau', pile })) {
      return { kind: 'tableau', pile };
    }
  }
  if (source.kind !== 'tableau' || source.index > 0) {
    for (let pile = 0; pile < 7; pile++) {
      if (!game.tableau[pile].length && canMove(game, source, { kind: 'tableau', pile })) {
        return { kind: 'tableau', pile };
      }
    }
  }
  return null;
}
export function hint(game: Game): {
  source: Source;
  target: Target;
} | null {
  const sources: Source[] = [{ kind: 'waste' }];
  game.tableau.forEach((pile, p) => pile.forEach((card, i) => {
    if (card.faceUp)
      sources.push({ kind: 'tableau', pile: p, index: i });
  }));
  for (const kind of ['foundation', 'tableau'] as const)
    for (const source of sources)
      for (let pile = 0; pile < (kind === 'foundation' ? 4 : 7); pile++) {
        if (kind === 'tableau' && !game.tableau[pile].length && source.kind === 'tableau' && source.index === 0)
          continue;
        if (canMove(game, source, { kind, pile }))
          return { source, target: { kind, pile } };
      }
  // Returning a foundation card can unlock a tableau sequence. Keep it as a fallback
  // so ordinary building moves remain the first choice.
  for (let sourcePile = 0; sourcePile < 4; sourcePile++) {
    const source: Source = { kind: 'foundation', pile: sourcePile };
    for (let pile = 0; pile < 7; pile++) {
      if (canMove(game, source, { kind: 'tableau', pile })) return { source, target: { kind: 'tableau', pile } };
    }
  }
  return null;
}
export function validSavedGame(value: unknown): value is Game {
  try {
    const g = value as Game;
    if (!g || ![1, 3].includes(g.drawCount) || !Number.isInteger(g.moves) || g.moves < 0 || g.tableau.length !== 7 || g.foundations.length !== 4)
      return false;
    const ids = [...g.stock, ...g.waste, ...g.tableau.flat().map(c => c.id), ...g.foundations.flat()];
    const validDeck = (deck: number[]) => deck.length === 52 && new Set(deck).size === 52 && deck.every(id => Number.isInteger(id) && id >= 0 && id < 52);
    return validDeck(ids) && validDeck(g.initialDeck) && g.tableau.every(p => p.every(c => typeof c.faceUp === 'boolean')) && g.foundations.every(p => p.every((id, i) => rank(id) === i + 1 && suit(id) === suit(p[0])));
  }
  catch {
    return false;
  }
}
