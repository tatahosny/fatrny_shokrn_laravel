import { useCallback, useEffect, useState } from 'react';

export function useThemeMode() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const isDark =
            localStorage.getItem('fatrna_theme') === 'dark' ||
            (!('fatrna_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggleDarkMode = useCallback(() => {
        setDarkMode((current) => {
            const next = !current;
            document.documentElement.classList.toggle('dark', next);
            localStorage.setItem('fatrna_theme', next ? 'dark' : 'light');
            return next;
        });
    }, []);

    return { darkMode, toggleDarkMode };
}
