import { build, context } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { buildOptions, projectPath } from './lib/build-options.mjs';

const development = process.argv.includes('--serve');
const entryTag = '<script type="module" src="/src/main.tsx"></script>';
const template = await readFile(projectPath('index.html'), 'utf8');
await mkdir(projectPath('dist'), { recursive: true });
await writeFile(projectPath('dist/index.html'), template.replace(entryTag,
  '<link rel="stylesheet" href="./assets/app.css"/><script defer src="./assets/app.js"></script>'));

if (development) {
  const builder = await context(buildOptions(true));
  await builder.watch();
  const server = await builder.serve({ servedir: projectPath('dist'), host: '127.0.0.1', port: 5173 });
  console.log(`Desenvolvimento: http://${server.hosts[0]}:${server.port}`);
} else {
  await build(buildOptions());
  const [js, css] = await Promise.all([
    readFile(projectPath('dist/assets/app.js'), 'utf8'),
    readFile(projectPath('dist/assets/app.css'), 'utf8'),
  ]);
  const notices = await Promise.all(['react', 'react-dom', 'lucide-react'].map(async name =>
    `${name}\n${await readFile(projectPath('node_modules', name, 'LICENSE'), 'utf8')}`));
  notices.push(...await Promise.all([
    'vendor/vocabulary-NOTICE.txt', 'vendor/dictionary-pt/license',
    'vendor/dictionary-pt/MPL-2.0.txt', 'vendor/pt-br/LICENSE',
  ].map(path => readFile(projectPath(path), 'utf8'))));
  const standalone = template
    .replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
    .replace(entryTag, () => `<style>${css}</style><script>${js.replace(/<\/script/gi, '<\\/script')}</script>`)
    + `\n<!-- Third-party notices\n${notices.join('\n\n').replace(/-->/g, '-- >')}\n-->\n`;
  const payload = gzipSync(Buffer.from(standalone), { level: 9 });
  await Promise.all([
    writeFile(projectPath('dist/app.html'), standalone),
    writeFile(projectPath('dist/app.html.gz'), payload),
    writeFile(projectPath('dist/build-info.json'), JSON.stringify({
      javascriptBytes: Buffer.byteLength(js),
      cssBytes: Buffer.byteLength(css),
      htmlBytes: Buffer.byteLength(standalone),
      compressedBytes: payload.length,
    }, null, 2) + '\n'),
  ]);
  console.log(`Interface: ${(Buffer.byteLength(js) / 1024).toFixed(0)} KB de JavaScript; ${(payload.length / 1024).toFixed(0)} KB compactados para o aplicativo.`);
}
