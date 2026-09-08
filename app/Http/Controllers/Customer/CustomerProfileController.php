<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            'phone' => 'nullable|string|max:20',
        ]);
        $user->update($validated);
        return back()->with('success', 'تم تحديث ملفك الشخصي.');
    }

    public function submitStudentVerification(Request $request): RedirectResponse
    {
        $customer = auth()->user()->customer;
        abort_if(!$customer, 403);

        $request->validate([
            'university_name' => 'required|string|max:255',
            'student_id_image'=> 'required|file|mimes:jpg,jpeg,png,pdf|max:4096',
        ]);

        $path = $request->file('student_id_image')->store('student-ids', 'public');

        $customer->update([
            'university_name'           => $request->university_name,
            'university_id_card_image'  => $path,
            'student_status'            => 'PENDING',
        ]);

        return back()->with('success', 'تم إرسال طلب التحقق من الهوية الطلابية. سيتم مراجعته قريباً.');
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
