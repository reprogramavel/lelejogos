import { allowedWords, answerWords, normalizeWord } from './words.ts';

export type LetterMark = 'correct' | 'present' | 'absent';
export type TermoStats = { played: number; wins: number; streak: number; best: number };
export type TermoGame = { answer: string; guesses: string[]; current: string; stats: TermoStats };
export const termoStatus = (game: TermoGame) => game.guesses.includes(game.answer) ? 'won' : game.guesses.length === 6 ? 'lost' : 'playing';

export function newTermo(stats: TermoStats = { played: 0, wins: 0, streak: 0, best: 0 }, previous?: string): TermoGame {
  const choices = answerWords.filter(word => word !== previous);
  return { answer: choices[Math.floor(Math.random() * choices.length)], guesses: [], current: '', stats: { ...stats } };
}

export function evaluateGuess(guess: string, answer: string): LetterMark[] {
  const marks: LetterMark[] = Array.from({ length: 5 }, () => 'absent');
  const remaining = new Map<string, number>();
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) marks[i] = 'correct';
    else remaining.set(answer[i], (remaining.get(answer[i]) ?? 0) + 1);
  }
  for (let i = 0; i < 5; i++) {
    if (marks[i] === 'correct' || !remaining.get(guess[i])) continue;
    marks[i] = 'present';
    remaining.set(guess[i], remaining.get(guess[i])! - 1);
  }
  return marks;
}

export function submitGuess(game: TermoGame): { game: TermoGame; error?: string } {
  if (termoStatus(game) !== 'playing') return { game };
  const word = normalizeWord(game.current);
  if (word.length !== 5) return { game, error: 'Complete as cinco letras antes de tentar.' };
  if (!allowedWords.has(word)) return { game, error: 'Palavra não reconhecida. Experimente outra.' };
  if (game.guesses.includes(word)) return { game, error: 'Você já tentou essa palavra.' };
  const next = { ...game, guesses: [...game.guesses, word], current: '', stats: { ...game.stats } };
  const status = termoStatus(next);
  if (status !== 'playing') {
    const win = status === 'won';
    next.stats.played++;
    next.stats.wins += Number(win);
    next.stats.streak = win ? next.stats.streak + 1 : 0;
    next.stats.best = Math.max(next.stats.best, next.stats.streak);
  }
  return { game: next };
}

export function validTermo(value: unknown): value is TermoGame {
  try {
    const game = value as TermoGame;
    return !!game && answerWords.includes(game.answer) && Array.isArray(game.guesses) && game.guesses.length <= 6 &&
      new Set(game.guesses).size === game.guesses.length && game.guesses.every(word => allowedWords.has(word)) &&
      !game.guesses.slice(0, -1).includes(game.answer) && typeof game.current === 'string' && /^[A-Z]{0,5}$/.test(game.current) &&
      !!game.stats && [game.stats.played, game.stats.wins, game.stats.streak, game.stats.best].every(n => Number.isInteger(n) && n >= 0) &&
      game.stats.wins <= game.stats.played && game.stats.streak <= game.stats.wins && game.stats.best >= game.stats.streak && game.stats.best <= game.stats.wins;
  } catch { return false; }
}
