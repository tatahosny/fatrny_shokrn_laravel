<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomerProfileController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $customer = $user->customer ?? \App\Models\Customer::firstOrCreate(
            ['user_id' => $user->id],
            ['student_status' => 'PENDING']
        );
        return Inertia::render('Customer/Profile', [
            'customer'  => $customer->load(['user', 'addresses']),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => ['nullable', 'string', 'max:20', Rule::unique('users', 'phone')->ignore($user->id)],
        ], [
            'phone.unique' => 'رقم الهاتف مسجل مسبقاً لدى مستخدم آخر.',
        ]);
        $user->update($validated);
        return back()->with('success', 'تم تحديث ملفك الشخصي.');
    }

    public function submitStudentVerification(Request $request): RedirectResponse
    {
        $customer = auth()->user()->customer;
        abort_if(!$customer, 403);

        $request->validate([
            'university_name'     => 'required|string|max:255',
            'university_id_number'=> 'nullable|string|max:100',
            'student_id_front'    => 'required|file|mimes:jpg,jpeg,png,webp|max:5120',
            'student_id_back'     => 'required|file|mimes:jpg,jpeg,png,webp|max:5120',
        ], [
            'student_id_front.required' => 'يرجى رفع صورة وجه الكارنيه الجامعي.',
            'student_id_front.mimes'    => 'يجب أن تكون الصورة بصيغة JPG أو PNG أو WEBP.',
            'student_id_back.required'  => 'يرجى رفع صورة ظهر الكارنيه الجامعي.',
            'student_id_back.mimes'     => 'يجب أن تكون الصورة بصيغة JPG أو PNG أو WEBP.',
        ]);

        $frontPath = $request->file('student_id_front')->store('student-ids', 'public');
        $backPath  = $request->file('student_id_back')->store('student-ids', 'public');

        $customer->update([
            'university_name'               => $request->university_name,
            'university_id_number'          => $request->university_id_number,
            'university_id_card_image'      => $frontPath,
            'university_id_card_back_image' => $backPath,
            'student_status'                => 'PENDING',
            'rejection_reason'              => null,
        ]);

        return back()->with('success', 'تم إرسال طلب توثيق الكارنيه الجامعي. سيتم مراجعته قريباً وستصلك النتيجة.');
    }

    public function storeAddress(Request $request): RedirectResponse
    {
        $customer = auth()->user()->customer;
        abort_if(!$customer, 403);

        $validated = $request->validate([
            'label'     => 'required|string|max:100',
            'address'   => 'required|string|max:500',
            'latitude'  => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_default'=> 'boolean',
        ]);

        if ($validated['is_default'] ?? false) {
            $customer->addresses()->update(['is_default' => false]);
        }

        $customer->addresses()->create($validated);
        return back()->with('success', 'تم إضافة العنوان.');
    }

    public function deleteAddress(int $id): RedirectResponse
    {
        $customer = auth()->user()->customer;
        CustomerAddress::where('customer_id', $customer->id)->findOrFail($id)->delete();
        return back()->with('success', 'تم حذف العنوان.');
    }
}
