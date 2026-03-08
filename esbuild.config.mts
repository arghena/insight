import { build } from 'esbuild'

await build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outExtension: { '.js': '.mjs' },
    outdir: 'dist',
    minify: true,
    banner: {
        js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
    },
})
