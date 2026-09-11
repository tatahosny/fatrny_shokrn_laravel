import React, { useEffect, useState } from 'react';
import { Bike, X } from 'lucide-react';

interface DeliveryFeeConfirmModalProps {
    isOpen: boolean;
    orderNumber?: string;
    onClose: () => void;
    onConfirm: (deliveryFee: number) => void;
}

export default function DeliveryFeeConfirmModal({ isOpen, orderNumber, onClose, onConfirm }: DeliveryFeeConfirmModalProps) {
    const [fee, setFee] = useState('');

    useEffect(() => {
        if (isOpen) setFee('');
    }, [isOpen]);

    if (!isOpen) return null;

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const value = Number(fee);
        if (!Number.isFinite(value) || value < 0) return;
        onConfirm(value);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delivery-fee-title">
            <button className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm" onClick={onClose} aria-label="إغلاق" />
            <form onSubmit={submit} className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-900" dir="rtl">
                <div className="bg-stone-950 px-6 py-5 text-white">
                    <button type="button" onClick={onClose} className="float-left rounded-lg p-1 text-stone-300 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
                    <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500 text-white"><Bike className="h-5 w-5" /></span>
                        <div>
                            <p className="text-[11px] font-bold tracking-wide text-orange-300">تأكيد الطلب {orderNumber ? `#${orderNumber}` : ''}</p>
                            <h2 id="delivery-fee-title" className="text-base font-black">حدد رسوم التوصيل</h2>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 p-6">
                    <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">سيظهر هذا السعر للعميل فور تأكيدك للطلب، ويُضاف إلى إجمالي الطلب.</p>
                    <label className="block">
                        <span className="mb-2 block text-xs font-black text-stone-700 dark:text-stone-200">سعر التوصيل بالجنيه</span>
                        <div className="flex overflow-hidden rounded-2xl border-2 border-stone-200 bg-stone-50 focus-within:border-orange-500 dark:border-stone-700 dark:bg-stone-800">
                            <input autoFocus required min="0" step="0.01" inputMode="decimal" type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="w-full bg-transparent px-4 py-3 text-lg font-black outline-none" placeholder="مثال: 15" />
                            <span className="grid place-items-center border-r border-stone-200 px-4 text-sm font-black text-stone-500 dark:border-stone-700">ج.م</span>
                        </div>
                    </label>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200">إلغاء</button>
                        <button type="submit" className="flex-[1.4] rounded-2xl bg-orange-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/25 hover:bg-orange-700">تأكيد وإرسال السعر</button>
                    </div>
                </div>
            </form>
        </div>
    );
}
