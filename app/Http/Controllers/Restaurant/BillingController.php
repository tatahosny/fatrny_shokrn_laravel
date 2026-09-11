<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $staff = $user->restaurantStaff()->first();
        $restaurant = $staff?->restaurant;

        if (!$restaurant) {
            abort(403, 'لا يوجد مطعم مرتبط بهذا الحساب.');
        }

        $invoices = Invoice::where('restaurant_id', $restaurant->id)
            ->where('status', '!=', 'CANCELLED')
            ->with('items')
            ->latest()
            ->paginate(10);

        $pendingInvoice = Invoice::where('restaurant_id', $restaurant->id)
            ->whereNotIn('status', ['PAID', 'CANCELLED'])
            ->orderBy('due_date')
            ->first();

        $daysUntilDue = null;
        if ($pendingInvoice && $pendingInvoice->due_date) {
            $daysUntilDue = (int) now()->startOfDay()->diffInDays(Carbon::parse($pendingInvoice->due_date)->startOfDay(), false);
        } elseif ($restaurant->payment_due_date) {
            $daysUntilDue = (int) now()->startOfDay()->diffInDays(Carbon::parse($restaurant->payment_due_date)->startOfDay(), false);
        }

        $totalPaid = Invoice::where('restaurant_id', $restaurant->id)
            ->where('status', 'PAID')
            ->sum('paid_amount');

        $supportPhone = SystemSetting::where('key', 'support_phone')->value('value') ?? env('SUPPORT_PHONE', '01027961208');

        return Inertia::render('Restaurant/Billing/Index', [
            'restaurant'     => [
                'id'                       => $restaurant->id,
                'name'                     => $restaurant->name,
                'status'                   => $restaurant->status,
                'commission_type'          => $restaurant->commission_type,
                'commission_percentage'    => $restaurant->commission_percentage,
                'monthly_subscription_fee' => $restaurant->monthly_subscription_fee,
                'billing_cycle'            => $restaurant->billing_cycle,
                'payment_due_date'         => $restaurant->payment_due_date?->format('Y-m-d'),
                'billing_suspended_at'     => $restaurant->billing_suspended_at?->format('Y-m-d H:i'),
                'suspension_reason'        => $restaurant->suspension_reason,
            ],
            'invoices'       => $invoices,
            'pendingInvoice' => $pendingInvoice,
            'daysUntilDue'   => $daysUntilDue,
            'totalPaid'      => (float) $totalPaid,
            'supportPhone'   => $supportPhone,
        ]);
    }
}
