import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ConfirmModal from '../../../Components/ConfirmModal';
import { Database, Plus, Trash2, Download, HardDrive, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Backup {
    id: number;
    filename: string;
    disk: string;
    size: number;
    status: string;
    created_at: string;
    created_by: { name: string } | null;
}

interface Props {
    backups: Backup[];
}

export default function AdminBackupsIndex({ backups }: Props) {
    const [confirmCreate, setConfirmCreate] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    const handleCreate = () => {
        setConfirmCreate(true);
    };

    const handleDelete = (id: number) => {
        setConfirmDeleteId(id);
    };

    const fmtSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Head title="النسخ الاحتياطية" />

            <div className="space-y-6" dir="rtl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <HardDrive className="w-6 h-6 text-orange-400" />
                            النسخ الاحتياطية
                        </h1>
                        <p className="text-stone-400 text-sm mt-1">إدارة نسخ قاعدة البيانات الاحتياطية</p>
                    </div>
                    <button onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        نسخة احتياطية جديدة
                    </button>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-amber-300 text-sm">
                        💡 يتم حفظ النسخ الاحتياطية على القرص المحلي. يُنصح بنقلها إلى تخزين خارجي بشكل دوري.
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    {backups.length === 0 ? (
                        <div className="py-16 text-center">
                            <Database className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                            <p className="text-stone-400">لا توجد نسخ احتياطية بعد</p>
                            <button onClick={handleCreate}
                                className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-medium transition-colors">
                                إنشاء أول نسخة
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {backups.map(backup => (
                                <div key={backup.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${backup.status === 'completed' ? 'bg-emerald-500/20' : backup.status === 'failed' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                                            {backup.status === 'completed' ? (
                                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                            ) : backup.status === 'failed' ? (
                                                <AlertCircle className="w-5 h-5 text-red-400" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-amber-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">{backup.filename}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-stone-400 text-xs">{fmtSize(backup.size)}</span>
                                                <span className="text-stone-500 text-xs">•</span>
                                                <span className="text-stone-400 text-xs">{backup.disk}</span>
                                                {backup.created_by && (
                                                    <>
                                                        <span className="text-stone-500 text-xs">•</span>
                                                        <span className="text-stone-400 text-xs">{backup.created_by.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-stone-400 text-sm">{new Date(backup.created_at).toLocaleString('ar-EG')}</span>
                                        <div className="flex items-center gap-2">
                                            <button className="p-1.5 text-stone-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(backup.id)}
                                                className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmCreate}
                title="إنشاء نسخة احتياطية"
                message="هل تريد بدء عملية إنشاء نسخة احتياطية لقاعدة البيانات الآن؟ قد يستغرق ذلك بضع لحظات."
                confirmText="بدء النسخ الاحتياطي"
                cancelText="إلغاء"
                variant="info"
                onConfirm={() => {
                    router.post('/admin/backups');
                    setConfirmCreate(false);
                }}
                onCancel={() => setConfirmCreate(false)}
            />

            <ConfirmModal
                isOpen={confirmDeleteId !== null}
                title="حذف النسخة الاحتياطية"
                message="هل أنت متأكد من حذف هذا الملف الاحتياطي نهائياً؟ لا يمكن استعادته بعد الحذف."
                confirmText="نعم، احذف الملف"
                cancelText="إلغاء"
                variant="danger"
                onConfirm={() => {
                    if (confirmDeleteId !== null) {
                        router.delete(`/admin/backups/${confirmDeleteId}`);
                        setConfirmDeleteId(null);
                    }
                }}
                onCancel={() => setConfirmDeleteId(null)}
            />
    );
}
