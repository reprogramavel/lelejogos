import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

test('a entrega contém somente LeleJogos.exe, com toda a interface embutida', async () => {
  assert.deepEqual(await readdir('release'), ['LeleJogos.exe']);
  const [executable, payload, html] = await Promise.all([
    readFile('release/LeleJogos.exe'),
    readFile('dist/app.html.gz'),
    readFile('dist/app.html'),
  ]);
  assert.equal(executable.subarray(0, 2).toString(), 'MZ');
  assert.equal(executable.includes(payload), true, 'A interface compactada está no executável');
  assert.deepEqual(gunzipSync(payload), html, 'O conteúdo embutido corresponde à interface testada');
  assert.ok(html.includes(Buffer.from('Mozilla Public License Version 2.0')), 'A licença dos dados acompanha a interface');
  assert.ok(html.includes(Buffer.from('Copyright 2021 Fernando Serboncini')), 'O aviso MIT da base complementar acompanha a interface');
  assert.ok(executable.length < 200_000, 'O aplicativo portátil não deve incluir bibliotecas inteiras sem uso');
});
