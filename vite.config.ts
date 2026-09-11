import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    build: {
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;
                    if (id.includes('leaflet')) return 'maps';
                    if (id.includes('recharts')) return 'charts';
                    if (id.includes('lucide-react')) return 'icons';
                    if (id.includes('react') || id.includes('inertia')) return 'framework';
                },
            },
        },
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        watch: {
            ignored: ['**/storage/**', '**/vendor/**', '**/node_modules/**', '**/فطارنى/**'],
        },
    },
});
