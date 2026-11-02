export const suits = ['♠', '♥', '♣', '♦'];
export const rank = (id: number) => id % 13 + 1;
export const suit = (id: number) => Math.floor((id % 52) / 13);
export const red = (id: number) => suit(id) % 2 === 1;
export const label = (id: number) => ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][rank(id) - 1];

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
