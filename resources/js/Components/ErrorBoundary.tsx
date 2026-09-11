import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 my-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-stone-900 dark:text-stone-100 space-y-4 max-w-lg mx-auto text-center" dir="rtl">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-black text-base">
                            {this.props.fallbackMessage || 'تعذر عرض هذا الجزء بشكل كامل مؤقتاً'}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                            حدث خطأ أثناء تحميل بعض عناصر الصفحة، يمكنك تحديث الصفحة للمحاولة مجدداً.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={this.handleReset}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-2 mx-auto cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>إعادة تحميل الصفحة</span>
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
