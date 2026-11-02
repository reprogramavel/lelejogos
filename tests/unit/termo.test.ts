import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateGuess, newTermo, submitGuess, termoStatus, validTermo } from '../../src/features/termo/game.ts';
import { allowedWords, answerWords } from '../../src/features/termo/words.ts';

test('vocabulário offline tem mais de dezoito mil palavras e quatrocentas respostas', () => {
  assert.ok(allowedWords.size >= 18000); assert.ok(answerWords.length >= 400);
  assert.equal(validTermo(newTermo()), true);
});
test('letras repetidas só recebem pistas até o limite da resposta', () => {
  assert.deepEqual(evaluateGuess('ARARA', 'CARTA'), ['present', 'present', 'absent', 'absent', 'correct']);
  assert.deepEqual(evaluateGuess('TERRA', 'TERMO'), ['correct', 'correct', 'correct', 'absent', 'absent']);
  assert.deepEqual(evaluateGuess('CARTA', 'CARTA'), ['correct', 'correct', 'correct', 'correct', 'correct']);
});
test('palavras curtas, desconhecidas ou repetidas não gastam tentativas', () => {
  const game = { ...newTermo(), answer: 'CARTA', current: 'CA' };
  assert.equal(submitGuess(game).game, game); assert.ok(submitGuess(game).error);
  game.current = 'ZZZZZ'; assert.equal(submitGuess(game).game, game);
  game.current = 'LIVRO'; const next = submitGuess(game).game;
  assert.equal(next.guesses.length, 1);
  assert.equal(submitGuess({ ...next, current: 'LIVRO' }).game.guesses.length, 1);
});

test('aceita palavras comuns ausentes, acentos e flexões sem inventar grafias', () => {
  for (const current of ['BARCO', 'CIRCO', 'CORES', 'GAITA', 'LASER', 'MAGIA', 'BAMBU', 'CLUBE', 'CIÚME', 'DÓLAR', 'TÊNIS', 'CAÇAS', 'CACEI', 'LACEI', 'GUIEI', 'FALAS', 'FALAM']) {
    const result = submitGuess({ ...newTermo(), answer: 'ZEBRA', current });
    assert.equal(result.error, undefined, current);
    assert.equal(result.game.guesses.length, 1, current);
  }
  for (const current of ['ZZZZZ', 'FICEI', 'TOCEI', 'PEGEI', 'NEGEI']) {
    assert.ok(submitGuess({ ...newTermo(), current }).error, current);
  }
  assert.equal(answerWords.every(word => allowedWords.has(word) && /^[A-Z]{5}$/.test(word)), true);
});
test('acentos são normalizados, vitória atualiza estatísticas uma única vez', () => {
  const game = { ...newTermo(), answer: 'LAPIS', current: 'LÁPIS' };
  const next = submitGuess(game).game;
  assert.equal(termoStatus(next), 'won');
  assert.deepEqual(next.stats, { played: 1, wins: 1, streak: 1, best: 1 });
  assert.equal(submitGuess(next).game, next); assert.equal(validTermo(next), true);
  assert.equal(game.guesses.length, 0);
});
test('seis erros encerram a partida, zeram a sequência e preservam o recorde', () => {
  let game = { ...newTermo({ played: 2, wins: 2, streak: 2, best: 2 }), answer: 'ZEBRA' };
  for (const word of ['CARTA', 'TERMO', 'NUVEM', 'PAPEL', 'AMORA', 'LIVRO']) {
    game = submitGuess({ ...game, current: word }).game;
  }
  assert.equal(termoStatus(game), 'lost');
  assert.deepEqual(game.stats, { played: 3, wins: 2, streak: 0, best: 2 });
  assert.equal(validTermo(game), true);
  const next = newTermo(game.stats, game.answer);
  assert.notEqual(next.answer, game.answer); assert.deepEqual(next.stats, game.stats);
});
test('salvamento restaura partida válida e rejeita resposta ou estatísticas inválidas', () => {
  const game = { ...newTermo(), answer: 'CARTA', guesses: ['LIVRO'], current: 'NU' };
  assert.equal(validTermo(JSON.parse(JSON.stringify(game))), true);
  assert.equal(validTermo({ ...game, answer: 'XXXXX' }), false);
  assert.equal(validTermo({ ...game, guesses: ['CARTA', 'LIVRO'] }), false);
  assert.equal(validTermo({ ...game, stats: { played: -1, wins: 0, streak: 0, best: 0 } }), false);
});
