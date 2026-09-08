<?php

namespace App\Http\Middleware;

use App\Services\AuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to enforce that authenticated users belong to the correct portal role.
 *
 * Usage in routes: ->middleware('portal:ADMIN') or 'portal:RESTAURANT'
 */
class EnsurePortalRole
{
    protected array $portalRoles = [
        AuthService::PORTAL_ADMIN      => ['SUPER_ADMIN', 'ADMIN', 'PLATFORM_STAFF'],
        AuthService::PORTAL_RESTAURANT => ['RESTAURANT_OWNER', 'RESTAURANT_STAFF'],
        AuthService::PORTAL_DELIVERY   => ['DELIVERY_DRIVER'],
        AuthService::PORTAL_CUSTOMER   => ['CUSTOMER'],
    ];

    public function handle(Request $request, Closure $next, string $portal): Response
    {
        $user = $request->user();

        if (!$user) {
            return $this->redirectToLogin($portal);
        }

        if (!$user->is_active) {
            auth()->logout();
            return $this->redirectToLogin($portal)->withErrors([
                'email' => 'تم تعطيل هذا الحساب.',
            ]);
        }

        $allowedRoles = $this->portalRoles[$portal] ?? [];

        if (!in_array($user->role, $allowedRoles)) {
            auth()->logout();
            return $this->redirectToLogin($portal)->withErrors([
                'email' => 'غير مصرح لك بالوصول إلى هذه البوابة.',
            ]);
        }

        return $next($request);
    }

    protected function redirectToLogin(string $portal): \Illuminate\Http\RedirectResponse
    {
        return match ($portal) {
            AuthService::PORTAL_ADMIN      => redirect()->route('admin.login'),
            AuthService::PORTAL_RESTAURANT => redirect()->route('restaurant.login'),
            AuthService::PORTAL_DELIVERY   => redirect()->route('delivery.login'),
            default                        => redirect()->route('login'),
        };
    }
}
