<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public const PORTAL_ADMIN = 'ADMIN';
    public const PORTAL_RESTAURANT = 'RESTAURANT';
    public const PORTAL_DELIVERY = 'DELIVERY';
    public const PORTAL_CUSTOMER = 'CUSTOMER';

    /**
     * Map of portal to allowed roles.
     */
    protected array $portalRoles = [
        self::PORTAL_ADMIN => ['SUPER_ADMIN', 'ADMIN', 'PLATFORM_STAFF'],
        self::PORTAL_RESTAURANT => ['RESTAURANT_OWNER', 'RESTAURANT_STAFF'],
        self::PORTAL_DELIVERY => ['DELIVERY_DRIVER'],
        self::PORTAL_CUSTOMER => ['CUSTOMER'],
    ];

    /**
     * Authenticate user for a specific portal with rigid security checks.
     */
    public function authenticate(string $portal, string $login, string $password, bool $remember = false): User
    {
        // Find by email or phone
        $user = User::where('email', $login)
            ->orWhere('phone', $login)
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            ActivityLog::log('FAILED_LOGIN_ATTEMPT', null, null, null, ['login' => $login, 'portal' => $portal]);
            throw ValidationException::withMessages([
                'email' => __('بيانات الاعتماد غير متطابقة مع سجلاتنا.'),
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => __('تم تعطيل هذا الحساب. يرجى التواصل مع الإدارة.'),
            ]);
        }

        // Verify portal role
        $allowedRoles = $this->portalRoles[$portal] ?? [];
        if (!in_array($user->role, $allowedRoles)) {
            ActivityLog::log('UNAUTHORIZED_PORTAL_ACCESS_ATTEMPT', 'User', $user->id, null, ['portal' => $portal, 'user_role' => $user->role]);
            throw ValidationException::withMessages([
                'email' => __('غير مصرح لك بتسجيل الدخول من هذه البوابة.'),
            ]);
        }

        // For restaurant portal, verify restaurant association and status
        if ($portal === self::PORTAL_RESTAURANT) {
            $restaurant = $user->restaurant;
            if (!$restaurant) {
                throw ValidationException::withMessages([
                    'email' => __('هذا الحساب غير مرتبط بأي مطعم مسجل.'),
                ]);
            }
        }

        // For delivery portal, verify driver profile and restaurant
        if ($portal === self::PORTAL_DELIVERY) {
            $driver = $user->deliveryDriver;
            if (!$driver || !$driver->is_active) {
                throw ValidationException::withMessages([
                    'email' => __('حساب مندوب التوصيل غير مفعل أو غير مرتبط بمطعم.'),
                ]);
            }
        }

        Auth::login($user, $remember);
        request()->session()->regenerate();

        ActivityLog::log('USER_LOGIN', 'User', $user->id, null, ['portal' => $portal]);

        return $user;
    }

    /**
     * Log user out and invalidate session.
     */
    public function logout(): void
    {
        if (Auth::check()) {
            ActivityLog::log('USER_LOGOUT', 'User', Auth::id());
            Auth::logout();
        }
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }
}
