import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// ── Main thread bundle: Figma sandbox, no React, no DOM ────────
export default defineConfig({
    build: {
        target: 'es2015',
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, 'src/main.ts'),
            formats: ['iife'],     // Figma requires a self-executing bundle
            name: 'HeuristicAIMain',
            fileName: () => 'main.js',
        },
        rollupOptions: {
            output: {
                extend: false,
                inlineDynamicImports: true,
            },
        },
    },
});
