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
    AlertCircle,
    Image as ImageIcon
} from 'lucide-react';
import ConfirmModal from '../../Components/ConfirmModal';

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
    const [confirmDeleteAddressId, setConfirmDeleteAddressId] = useState<number | null>(null);
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
        setConfirmDeleteAddressId(id);
    };

    // Student verification form
    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [backPreview, setBackPreview] = useState<string | null>(null);

    const studentForm = useForm<{
        university_name: string;
        university_id_number: string;
        student_id_front: File | null;
        student_id_back: File | null;
    }>({
        university_name: customer?.university_name || 'جامعة برج العرب التكنولوجية (BATU)',
        university_id_number: customer?.university_id_number || '',
        student_id_front: null,
        student_id_back: null,
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
                            <span>توثيق هوية الطالب الجامعي لخصومات المطاعم</span>
                        </h2>

                        {customer.student_status === 'APPROVED' && (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> كارنيه موثق (الخصم مفعل)
                            </span>
                        )}
                        {customer.student_status === 'PENDING' && (
                            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> قيد مراجعة الإدارة
                            </span>
                        )}
                        {customer.student_status === 'REJECTED' && (
                            <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" /> تم رفض الكارنيه (يرجى إعادة الرفع)
                            </span>
                        )}
                    </div>

                    {customer.student_status === 'APPROVED' ? (
                        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-stone-800/80 border border-emerald-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 space-y-2">
                            <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>تم تأكيد هويتك الطلابية بنجاح من قبل إدارة المنصة!</span>
                            </p>
                            <p><strong>الجامعة المسجلة:</strong> {customer.university_name || 'جامعة معتمدة'}</p>
                            <p className="text-stone-500 dark:text-stone-400">
                                يتم تطبيق الخصومات الطلابية والعروض الحصرية للطلاب تلقائياً على كل طلب تقوم بتقديمه من مطاعم المنصة.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-2xl">
                            {customer.student_status === 'REJECTED' && customer.rejection_reason && (
                                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300 space-y-1">
                                    <p className="font-bold flex items-center gap-1.5 text-sm">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <span>سبب رفض الطلب السابق:</span>
                                    </p>
                                    <p className="text-xs pr-5 text-red-700 dark:text-red-300">{customer.rejection_reason}</p>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400 pr-5">يرجى تعديل البيانات وإعادة رفع صورتي الكارنيه (وجه وظهر) بوضوح أدناه.</p>
                                </div>
                            )}

                            {customer.student_status === 'PENDING' && (
                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                                    <p className="font-bold flex items-center gap-1.5 text-sm">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                        <span>طلبك قيد المراجعة حالياً من قبل الإدارة</span>
                                    </p>
                                    <p className="text-[11px]">
                                        الجامعة: <strong>{customer.university_name}</strong> {customer.university_id_number ? `— رقم الكارنيه: ${customer.university_id_number}` : ''}
                                    </p>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                        يمكنك إعادة رفع صور الكارنيه أو تعديل البيانات أدناه إذا أردت تحديث الطلب المرسل للإدارة:
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleStudentSubmit} className="space-y-5">
                                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                                    <p className="font-bold">🎓 كيف تحصل على خصم الطلاب والعروض الحصرية؟</p>
                                    <p className="text-[11px] leading-relaxed">
                                        ارفع صورتين واضحتين لكارنيه كليتك أو جامعتك (وجه الكارنيه وظهر الكارنيه). فور مراجعة الكارنيه واعتماده من إدارة الموقع، سيتم تطبيق الخصومات تلقائياً على حسابك.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                            الجامعة المقيد بها <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={studentForm.data.university_name}
                                            onChange={(e) => studentForm.setData('university_name', e.target.value)}
                                            className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                        >
                                            <optgroup label="جامعات برج العرب">
                                                <option value="جامعة برج العرب التكنولوجية (BATU)">جامعة برج العرب التكنولوجية (BATU)</option>
                                                <option value="الجامعة المصرية اليابانية للعلوم والتكنولوجيا (E-JUST)">الجامعة المصرية اليابانية للعلوم والتكنولوجيا (E-JUST)</option>
                                                <option value="جامعة سنجور الدولية (Senghor University)">جامعة سنجور الدولية (Senghor University)</option>
                                            </optgroup>
                                            <optgroup label="جامعات ومعاهد أخرى">
                                                <option value="جامعة الإسكندرية">جامعة الإسكندرية</option>
                                                <option value="جامعة مطروح">جامعة مطروح</option>
                                                <option value="الأكاديمية العربية للعلوم والتكنولوجيا (AASTMT)">الأكاديمية العربية للعلوم والتكنولوجيا (AASTMT)</option>
                                                <option value="جامعة فاروس (PUA)">جامعة فاروس (PUA)</option>
                                                <option value="جامعة العلمين الدولية (AIU)">جامعة العلمين الدولية (AIU)</option>
                                                <option value="المعهد العالي للهندسة والتكنولوجيا ببرج العرب">المعهد العالي للهندسة والتكنولوجيا ببرج العرب</option>
                                                <option value="جامعة / معهد آخر في مصر">جامعة / معهد آخر في مصر</option>
                                            </optgroup>
                                        </select>
                                        {studentForm.errors.university_name && (
                                            <p className="text-[11px] text-red-500 mt-1">{studentForm.errors.university_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                            رقم الكارنيه / رقم القيد (اختياري)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="مثال: 2024101234"
                                            value={studentForm.data.university_id_number}
                                            onChange={(e) => studentForm.setData('university_id_number', e.target.value)}
                                            className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-orange-500"
                                        />
                                        {studentForm.errors.university_id_number && (
                                            <p className="text-[11px] text-red-500 mt-1">{studentForm.errors.university_id_number}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Front Image */}
                                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-2">
                                        <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                                            <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                                            <span>وجه الكارنيه (الأمام) <span className="text-red-500">*</span></span>
                                        </label>
                                        <input
                                            type="file"
                                            required
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    studentForm.setData('student_id_front', file);
                                                    setFrontPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="w-full text-xs text-stone-600 dark:text-stone-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange-600 file:text-white cursor-pointer"
                                        />
                                        {frontPreview && (
                                            <div className="mt-2 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 h-32 bg-stone-100 dark:bg-stone-900">
                                                <img src={frontPreview} alt="معاينة وجه الكارنيه" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                        {studentForm.errors.student_id_front && (
                                            <p className="text-[11px] text-red-500">{studentForm.errors.student_id_front}</p>
                                        )}
                                    </div>

                                    {/* Back Image */}
                                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-2">
                                        <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                                            <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                                            <span>ظهر الكارنيه (الخلف) <span className="text-red-500">*</span></span>
                                        </label>
                                        <input
                                            type="file"
                                            required
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    studentForm.setData('student_id_back', file);
                                                    setBackPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="w-full text-xs text-stone-600 dark:text-stone-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange-600 file:text-white cursor-pointer"
                                        />
                                        {backPreview && (
                                            <div className="mt-2 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 h-32 bg-stone-100 dark:bg-stone-900">
                                                <img src={backPreview} alt="معاينة ظهر الكارنيه" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                        {studentForm.errors.student_id_back && (
                                            <p className="text-[11px] text-red-500">{studentForm.errors.student_id_back}</p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={studentForm.processing}
                                    className="py-3 px-8 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>{studentForm.processing ? 'جارٍ رفع الكارنيه للإدارة...' : 'إرسال الكارنيه (وجه وظهر) للمراجعة والتفعيل'}</span>
                                </button>
                            </form>
                        </div>
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
            <ConfirmModal
                isOpen={confirmDeleteAddressId !== null}
                message="هل أنت متأكد من حذف هذا العنوان؟ لن تتمكن من استعادته."
                onConfirm={() => { if (confirmDeleteAddressId) router.delete(`/customer/profile/address/${confirmDeleteAddressId}`); setConfirmDeleteAddressId(null); }}
                onCancel={() => setConfirmDeleteAddressId(null)}
            />
        </CustomerLayout>
    );
}
