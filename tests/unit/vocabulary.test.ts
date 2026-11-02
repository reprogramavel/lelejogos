import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { externalWords } from '../../src/features/termo/external-words.ts';
import { allowedWords, answerWords } from '../../src/features/termo/words.ts';

const report = JSON.parse(readFileSync(new URL('../../src/features/termo/external-words.stats.json', import.meta.url), 'utf8'));

test('lista importada contém palavras únicas de cinco letras e relatório corresponde ao jogo', () => {
  assert.ok(externalWords.length > 18000);
  assert.equal(new Set(externalWords).size, externalWords.length);
  assert.equal(externalWords.every(word => /^[A-Z]{5}$/.test(word)), true);
  assert.equal(externalWords.length, report.combinedFiveLetterWords);
  assert.equal(allowedWords.size, report.totalAcceptedWords);
  assert.equal(answerWords.length, report.possibleAnswers);
});

test('snapshot registra os hashes das bases locais e as bibliotecas usadas só na preparação', () => {
  for (const [path, expected] of Object.entries(report.sourceHashes)) {
    const contents = readFileSync(new URL('../../' + path, import.meta.url));
    assert.equal(createHash('sha256').update(contents).digest('hex'), expected, path);
  }
});

test('ampliação cobre flexões e palavras raras sem aceitar protocolos e fragmentos de coleta', () => {
  for (const word of ['ARDUA', 'FIEIS', 'HEROI', 'PNEUS', 'PONEI', 'RAIOS', 'SABEM', 'SAGUI', 'TENIS', 'VIRUS', 'ZINIA']) {
    assert.equal(externalWords.includes(word), true, word);
    assert.equal(allowedWords.has(word), true, word);
  }
  for (const word of ['ASCII', 'HTTPS', 'OOGLE', 'UANDO', 'ZZZZZ']) assert.equal(allowedWords.has(word), false, word);
  assert.equal(answerWords.every(word => allowedWords.has(word)), true);
});
