import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import { Customer, CustomerAddress } from '../../Types';
import { 
    User, 
    Phone, 
    MapPin, 
    Plus, 
    Trash2, 
    GraduationCap, 
    Upload, 
    CheckCircle2, 
    Clock, 
    AlertCircle 
} from 'lucide-react';

interface ProfileProps {
    customer: Customer;
}

export default function Profile({ customer }: ProfileProps) {
    const user = customer.user;
    const addresses = customer.addresses || [];

    // Personal details form
    const profileForm = useForm({
        name: user?.name || '',
        phone: user?.phone || '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put('/customer/profile');
    };

    // New address form
    const [showAddAddress, setShowAddAddress] = useState(false);
    const addressForm = useForm({
        label: 'سكن الطلاب',
        address: '',
        is_default: false,
    });

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addressForm.post('/customer/profile/address', {
            onSuccess: () => {
                setShowAddAddress(false);
                addressForm.reset();
            }
        });
    };

    const handleDeleteAddress = (id: number) => {
        if (confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
            router.delete(`/customer/profile/address/${id}`);
        }
    };

    // Student verification form
    const studentForm = useForm<{
        university_name: string;
        student_id_image: File | null;
    }>({
        university_name: customer?.university_name || 'جامعة برج العرب التكنولوجية',
        student_id_image: null,
    });

    const handleStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        studentForm.post('/customer/profile/student-verification');
    };

    return (
        <CustomerLayout title="الملف الشخصي والعناوين" customer={customer}>
            <Head title="الملف الشخصي والعناوين — فطرنا شكراً" />

            <div className="space-y-8">
                {/* Personal Information */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <h2 className="text-base font-black text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-orange-500" />
                        <span>البيانات الأساسية</span>
                    </h2>

                    <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                الاسم بالكامل
                            </label>
                            <input
                                type="text"
                                required
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                            />
                            {profileForm.errors.name && <p className="text-[11px] text-red-500 mt-1">{profileForm.errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                رقم الهاتف (للتواصل مع الكابتن)
                            </label>
                            <input
                                type="tel"
                                value={profileForm.data.phone}
                                onChange={(e) => profileForm.setData('phone', e.target.value)}
                                className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                            />
                            {profileForm.errors.phone && <p className="text-[11px] text-red-500 mt-1">{profileForm.errors.phone}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={profileForm.processing}
                            className="py-2.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow transition disabled:opacity-60"
                        >
                            {profileForm.processing ? 'جارٍ الحفظ...' : 'تحديث البيانات'}
                        </button>
                    </form>
                </div>

                {/* Student Verification Section */}
                <div id="student-id" className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-orange-500" />
                            <span>توثيق هوية الطالب الجامعي</span>
                        </h2>

                        {customer.student_status === 'APPROVED' && (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> تم التوثيق بنجاح
                            </span>
                        )}
                        {customer.student_status === 'PENDING' && (
                            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> قيد المراجعة الإدارية
                            </span>
                        )}
                    </div>

                    {customer.student_status === 'APPROVED' ? (
                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-stone-800/80 border border-emerald-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                            <p className="font-bold text-emerald-700 dark:text-emerald-400">
                                أنت مؤهل رسمياً لجميع خصومات الطلاب!
                            </p>
                            <p>الجامعة: {customer.university_name}</p>
                            <p className="text-[11px] text-stone-500">يتم تفعيل الخصم بنسبة 10-20% على أي طلب تقوم بتقديمه تلقائياً.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleStudentSubmit} className="space-y-4 max-w-lg">
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                ارفع صورة واضحة لوجه كارنيه جامعتك (برج العرب التكنولوجية أو الجامعة المصرية اليابانية) للحصول على خصومات الطلاب الدائمة.
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                    الجامعة المقيد بها
                                </label>
                                <select
                                    value={studentForm.data.university_name}
                                    onChange={(e) => studentForm.setData('university_name', e.target.value)}
                                    className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                >
                                    <option value="جامعة برج العرب التكنولوجية">جامعة برج العرب التكنولوجية (BATU)</option>
                                    <option value="الجامعة المصرية اليابانية للعلوم والتكنولوجيا">الجامعة المصرية اليابانية للعلوم والتكنولوجيا (E-JUST)</option>
                                    <option value="أخرى">جامعة / معهد آخر في برج العرب</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                    صورة كارنيه الجامعة (JPG أو PNG أو PDF)
                                </label>
                                <input
                                    type="file"
                                    required
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            studentForm.setData('student_id_image', e.target.files[0]);
                                        }
                                    }}
                                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange-600 file:text-white"
                                />
                                {studentForm.errors.student_id_image && (
                                    <p className="text-[11px] text-red-500 mt-1">{studentForm.errors.student_id_image}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={studentForm.processing}
                                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 text-white font-bold text-xs shadow transition disabled:opacity-60 flex items-center gap-1.5"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{studentForm.processing ? 'جارٍ رفع الكارنيه...' : 'إرسال طلب التوثيق'}</span>
                            </button>
                        </form>
                    )}
                </div>

                {/* Delivery Addresses Management */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span>عناوين التوصيل المحفوظة</span>
                        </h2>

                        <button
                            onClick={() => setShowAddAddress(!showAddAddress)}
                            className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold transition flex items-center gap-1"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>إضافة عنوان جديد</span>
                        </button>
                    </div>

                    {showAddAddress && (
                        <form onSubmit={handleAddressSubmit} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3 max-w-lg">
                            <div>
                                <label className="block text-xs font-bold mb-1">اسم العنوان / الوصف المختصر</label>
                                <input
                                    type="text"
                                    required
                                    value={addressForm.data.label}
                                    onChange={(e) => addressForm.setData('label', e.target.value)}
                                    placeholder="مثال: سكن الطلاب، شقة الإسكندرية، المكتب..."
                                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1">العنوان التفصيلي</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={addressForm.data.address}
                                    onChange={(e) => addressForm.setData('address', e.target.value)}
                                    placeholder="الحي، الشارع، رقم العمارة، الدور..."
                                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_def"
                                    checked={addressForm.data.is_default}
                                    onChange={(e) => addressForm.setData('is_default', e.target.checked)}
                                    className="rounded text-orange-600 focus:ring-orange-500"
                                />
                                <label htmlFor="is_def" className="text-xs cursor-pointer">جعله العنوان الافتراضي</label>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="submit"
                                    disabled={addressForm.processing}
                                    className="py-2 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                                >
                                    حفظ العنوان
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddAddress(false)}
                                    className="py-2 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    )}

                    {addresses.length === 0 ? (
                        <p className="text-xs text-stone-400 py-4">لم تقم بإضافة أي عنوان بعد. أضف عنوان سكنك لتسهيل عملية الطلب بنقرة واحدة.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((addr) => (
                                <div key={addr.id} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-stone-900 dark:text-white">{addr.label}</span>
                                            {addr.is_default && (
                                                <span className="text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-600 font-bold px-1.5 py-0.5 rounded">
                                                    افتراضي
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-stone-500 leading-relaxed">{addr.address}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAddress(addr.id)}
                                        className="text-stone-400 hover:text-red-500 p-1 transition"
                                        title="حذف"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
