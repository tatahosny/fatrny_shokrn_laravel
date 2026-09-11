import './bootstrap';
import '../css/app.css';

import { createRoot, type Root } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode, type ReactNode } from 'react';
import AdminLayout from './Layouts/AdminLayout';
import RestaurantLayout from './Layouts/RestaurantLayout';
import ErrorBoundary from './Components/ErrorBoundary';

const appName = document.head.querySelector('meta[name="app-name"]')?.getAttribute('content') ?? 'فطرنا شكراً';
const pages = import.meta.glob('./Pages/**/*.tsx');

function withAdminLayout(page: ReactNode) {
    return <AdminLayout>{page}</AdminLayout>;
}

function withRestaurantLayout(page: ReactNode) {
    return <RestaurantLayout>{page}</RestaurantLayout>;
}

createInertiaApp({
    title: (title) => `${title} — ${appName}`,
    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.tsx`, pages).then((module) => {
            const page = module as { default: { layout?: (page: ReactNode) => ReactNode } };

            if (name.startsWith('Admin/')) {
                page.default.layout ??= withAdminLayout;
            } else if (name.startsWith('Restaurant/')) {
                page.default.layout ??= withRestaurantLayout;
            }

            return module;
        }),
    setup({ el, App, props }) {
        const root: Root = createRoot(el);
        root.render(
            <StrictMode>
                <ErrorBoundary>
                    <App {...props} />
                </ErrorBoundary>
            </StrictMode>
        );
    },
    progress: {
        color: '#f97316',
        showSpinner: true,
        delay: 40,
    },
});
