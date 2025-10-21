import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        resolve: {
            alias: {
                // FIX: Replaced process.cwd() with path.resolve('.') to avoid TypeScript type errors.
                '@': path.resolve('.'),
            }
        },
        // 👇 ADDED: Configuration to fix the Rollup build error
        build: {
            rollupOptions: {
                external: [
                    '@google/genai', // Mark the package as external
                ],
            },
        },
    };
});
