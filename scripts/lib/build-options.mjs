import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, isAbsolute, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
export const projectPath = (...parts) => resolve(projectRoot, ...parts);

// Node can resolve allowed workspace files without esbuild traversing restricted parents.
const workspaceFiles = {
  name: 'workspace-files',
  setup(builder) {
    builder.onResolve({ filter: /.*/ }, args => {
      if (args.path.startsWith('data:')) return { path: args.path, external: true };
      let path;
      if (args.kind === 'entry-point') path = projectPath('src/main.tsx');
      else if (args.path.startsWith('.') || isAbsolute(args.path)) {
        const base = resolve(dirname(args.importer), args.path);
        path = ['', '.ts', '.tsx', '.js', '.mjs', '.jsx', '.css', '.json', '/index.js']
          .map(extension => base + extension).find(existsSync);
        if (!path) throw new Error(`Arquivo não encontrado: ${args.path}`);
      } else {
        const require = createRequire(pathToFileURL(args.importer || projectPath('package.json')));
        if (args.path === 'lucide-react') {
          const packagePath = require.resolve('lucide-react/package.json');
          path = resolve(dirname(packagePath), 'dist/esm/lucide-react.mjs');
        } else path = require.resolve(args.path);
      }
      return {
        path,
        namespace: 'workspace',
        ...(path.includes('lucide-react') ? { sideEffects: false } : {}),
      };
    });
    builder.onLoad({ filter: /.*/, namespace: 'workspace' }, async args => ({
      contents: await readFile(args.path, 'utf8'),
      loader: ({ '.ts': 'ts', '.tsx': 'tsx', '.css': 'css', '.json': 'json' })[extname(args.path)] || 'js',
      watchFiles: [args.path],
    }));
  },
};

export function buildOptions(development = false) {
  return {
    absWorkingDir: projectRoot,
    tsconfigRaw: { compilerOptions: { jsx: 'react-jsx' } },
    entryPoints: ['app'],
    bundle: true,
    outdir: projectPath('dist/assets'),
    entryNames: 'app',
    format: 'iife',
    platform: 'browser',
    target: 'chrome110',
    jsx: 'automatic',
    treeShaking: true,
    minify: !development,
    define: { 'process.env.NODE_ENV': development ? '"development"' : '"production"' },
    legalComments: 'eof',
    plugins: [workspaceFiles],
  };
}
