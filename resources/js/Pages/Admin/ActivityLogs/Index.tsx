import React from 'react';
import { Head } from '@inertiajs/react';
import { Activity, User, Clock, Info } from 'lucide-react';

interface Log {
    id: number;
    log_name: string;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    causer_type: string | null;
    causer_id: number | null;
    causer_name: string | null;
    properties: any;
    created_at: string;
}

interface Props {
    logs: { data: Log[]; total: number; current_page: number; last_page: number };
}

const logColors: Record<string, string> = {
    default: 'bg-stone-500/20 text-stone-400',
    auth: 'bg-indigo-500/20 text-indigo-400',
    order: 'bg-orange-500/20 text-orange-400',
    restaurant: 'bg-amber-500/20 text-amber-400',
    finance: 'bg-emerald-500/20 text-emerald-400',
    admin: 'bg-red-500/20 text-red-400',
};

export default function AdminActivityLogs({ logs }: Props) {
    return (
        <Head title="سجل النشاطات" />

            <div className="space-y-6" dir="rtl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Activity className="w-6 h-6 text-orange-400" />
                            سجل النشاطات
                        </h1>
                        <p className="text-stone-400 text-sm mt-1">{logs.total} نشاط مسجل</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {logs.data.map(log => (
                            <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
                                <div className={`mt-0.5 p-2 rounded-lg ${logColors[log.log_name] ?? logColors.default}`}>
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm">{log.description}</p>
                                    <div className="flex items-center gap-4 mt-1.5">
                                        {log.causer_name && (
                                            <span className="flex items-center gap-1 text-xs text-stone-400">
                                                <User className="w-3 h-3" />
                                                {log.causer_name}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 text-xs text-stone-500">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.created_at).toLocaleString('ar-EG')}
                                        </span>
                                        {log.subject_type && (
                                            <span className="text-xs text-stone-500">
                                                {log.subject_type.split('\\').pop()} #{log.subject_id}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className={`shrink-0 px-2 py-0.5 rounded text-xs ${logColors[log.log_name] ?? logColors.default}`}>
                                    {log.log_name}
                                </span>
                            </div>
                        ))}
                        {logs.data.length === 0 && (
                            <div className="py-16 text-center">
                                <Activity className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                                <p className="text-stone-400">لا توجد نشاطات مسجلة</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                            <p className="text-stone-400 text-sm">صفحة {logs.current_page} من {logs.last_page}</p>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(5, logs.last_page) }, (_, i) => i + 1).map(page => (
                                    <a key={page} href={`?page=${page}`}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${page === logs.current_page
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-white/5 text-stone-400 hover:bg-white/10'}`}>
                                        {page}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
    );
}
