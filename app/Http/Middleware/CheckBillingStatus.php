<?php

namespace App\Http\Middleware;

use App\Models\Invoice;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBillingStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // 1. Restaurant Staff / Owner Check
        if ($user->isRestaurantStaff()) {
            $staff = $user->restaurantStaff()->first();
            $restaurant = $staff?->restaurant;

            if ($restaurant) {
                // Check if payment due date has passed with an unpaid invoice
                if ($restaurant->status === 'ACTIVE' && $restaurant->payment_due_date && $restaurant->payment_due_date->isPast()) {
                    $hasUnpaid = Invoice::where('restaurant_id', $restaurant->id)
                        ->whereNotIn('status', ['PAID', 'CANCELLED'])
                        ->where('due_date', '<=', now()->toDateString())
                        ->exists();

                    if ($hasUnpaid) {
                        $restaurant->update([
                            'status' => 'SUSPENDED',
                            'billing_suspended_at' => now(),
                            'suspension_reason' => 'تجاوز موعد الاستحقاق دون تسجيل السداد',
                        ]);
                    }
                }

                // If restaurant is suspended
                if ($restaurant->status === 'SUSPENDED') {
                    $allowedRoutes = ['restaurant.billing', 'restaurant.logout', 'logout'];
                    $currentRoute = $request->route()?->getName();

                    if (!in_array($currentRoute, $allowedRoutes) && !$request->is('logout*') && !$request->is('restaurant/billing*')) {
                        return redirect()->route('restaurant.billing')->with(
                            'error',
                            'حساب المطعم موقوف مؤقتاً لعدم سداد المستحقات. يرجى مراجعة الفواتير والتواصل مع الدعم الفني لإعادة التفعيل.'
                        );
                    }
                }
            }
        }

        // 2. Delivery Driver Check
        if ($user->isDeliveryDriver()) {
            $driver = $user->deliveryDriver;
            $restaurant = $driver?->restaurant;

            if ($restaurant) {
                // Also check if restaurant is overdue
                if ($restaurant->status === 'ACTIVE' && $restaurant->payment_due_date && $restaurant->payment_due_date->isPast()) {
                    $hasUnpaid = Invoice::where('restaurant_id', $restaurant->id)
                        ->whereNotIn('status', ['PAID', 'CANCELLED'])
                        ->where('due_date', '<=', now()->toDateString())
                        ->exists();

                    if ($hasUnpaid) {
                        $restaurant->update([
                            'status' => 'SUSPENDED',
                            'billing_suspended_at' => now(),
                            'suspension_reason' => 'تجاوز موعد الاستحقاق دون تسجيل السداد',
                        ]);
                    }
                }

                if ($restaurant->status === 'SUSPENDED') {
                    $allowedRoutes = ['delivery.suspended', 'delivery.logout', 'logout'];
                    $currentRoute = $request->route()?->getName();

                    if (!in_array($currentRoute, $allowedRoutes) && !$request->is('logout*') && !$request->is('delivery/suspended*')) {
                        return redirect()->route('delivery.suspended');
                    }
                }
            }
        }

        return $next($request);
    }
}
