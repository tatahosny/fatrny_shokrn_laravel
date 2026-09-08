<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tightenco\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Share global data with every Inertia response.
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Get app name from system settings (cached)
        $appName = cache()->remember('system_setting.app_name', 3600, function () {
            return SystemSetting::where('key', 'app_name')->value('value') ?? 'فطرنا شكراً';
        });

        $appSlogan = cache()->remember('system_setting.app_slogan', 3600, function () {
            return SystemSetting::where('key', 'app_slogan')->value('value') ?? 'أكلك من برة';
        });

        $supportPhone = cache()->remember('system_setting.support_phone', 3600, function () {
            return SystemSetting::where('key', 'support_phone')->value('value') ?? env('SUPPORT_PHONE', '01027961208');
        });

        return array_merge(parent::share($request), [
            'auth' => [
                'user'        => $user ? $user->only('id', 'name', 'email', 'phone', 'role', 'is_active', 'avatar') : null,
                'permissions' => $user ? $user->getAllPermissions()->pluck('name')->toArray() : [],
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info'    => $request->session()->get('info'),
            ],
            'app_name'      => $appName,
            'app_slogan'    => $appSlogan,
            'support_phone' => $supportPhone,
        ]);
    }
}
