import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// ── UI bundle: React app inlined into a single HTML file ────────
// vite-plugin-singlefile requires a SINGLE entry point.
export default defineConfig({
    plugins: [react(), viteSingleFile()],
    root: resolve(__dirname, 'src/ui'),
    build: {
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: false,
        rollupOptions: {
            input: resolve(__dirname, 'src/ui/index.html'),
            output: {
                entryFileNames: 'ui-unused.js', // singlefile replaces this anyway
            },
        },
    },
});
