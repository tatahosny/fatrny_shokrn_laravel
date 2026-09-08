import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, CheckCircle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    variant = 'danger',
}: ConfirmModalProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: <Trash2 className="w-6 h-6 text-red-500" />,
            iconBg: 'bg-red-100 dark:bg-red-950/60',
            button: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-red-600/30',
            title: title || 'تأكيد الحذف',
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
            iconBg: 'bg-amber-100 dark:bg-amber-950/60',
            button: 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-amber-600/30',
            title: title || 'تحذير',
        },
        info: {
            icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
            iconBg: 'bg-blue-100 dark:bg-blue-950/60',
            button: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-600/30',
            title: title || 'تأكيد العملية',
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white dark:bg-stone-900 rounded-3xl shadow-2xl shadow-stone-900/30 w-full max-w-sm border border-stone-100 dark:border-stone-800" style={{animation:'slideUp 0.2s ease'}}>
                <button onClick={onCancel} className="absolute top-4 left-4 p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition">
                    <X className="w-4 h-4" />
                </button>
                <div className="p-8 pt-7 flex flex-col items-center text-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${styles.iconBg} flex items-center justify-center`}>
                        {styles.icon}
                    </div>
                    <div>
                        <h3 className="text-base font-black text-stone-900 dark:text-white mb-1.5">{styles.title}</h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{message}</p>
                    </div>
                    <div className="flex gap-3 w-full mt-1">
                        <button onClick={onCancel} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition">
                            {cancelText}
                        </button>
                        <button onClick={onConfirm} className={`flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-white shadow-lg ${styles.button} transition-all duration-200`}>
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
        </div>
    );
}
