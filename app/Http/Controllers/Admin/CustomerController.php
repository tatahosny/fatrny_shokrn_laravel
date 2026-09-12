<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Customer::with('user')
            ->latest();

        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('student_status')) {
            $query->where('student_status', $request->student_status);
        }

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $query->withCount('orders')->paginate(20)->withQueryString(),
            'filters'   => $request->only('search', 'student_status'),
        ]);
    }

    public function show(int $id): Response
    {
        $customer = Customer::with(['user', 'addresses'])
            ->withCount('orders')
            ->findOrFail($id);

        $recentOrders = $customer->orders()
            ->with('restaurant:id,name')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Admin/Customers/Show', [
            'customer'      => $customer,
            'recent_orders' => $recentOrders,
        ]);
    }

    public function verifyStudent(int $id): RedirectResponse
    {
        $customer = Customer::findOrFail($id);
        $customer->update([
            'student_status'      => 'APPROVED',
            'student_verified_at' => now(),
            'rejection_reason'    => null,
        ]);
        ActivityLog::log('STUDENT_VERIFIED', 'Customer', $customer->id);
        return back()->with('success', 'تم قبول وتوثيق الكارنيه الجامعي للطالب. تم تفعيل خصم الطلاب على حسابه.');
    }

    public function rejectStudent(Request $request, int $id): RedirectResponse
    {
        $customer = Customer::findOrFail($id);
        $reason = $request->input('rejection_reason', 'لم يتم التحقق من صحة الكارنيه.');
        $customer->update([
            'student_status'   => 'REJECTED',
            'rejection_reason' => $reason,
        ]);
        ActivityLog::log('STUDENT_REJECTED', 'Customer', $customer->id, null, ['reason' => $reason]);
        return back()->with('success', 'تم رفض طلب توثيق الكارنيه. تم إبلاغ الطالب بسبب الرفض.');
    }
}
