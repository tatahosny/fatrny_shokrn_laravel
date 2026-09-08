<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmsController extends Controller
{
    public function index(): Response
    {
        $settings = SystemSetting::where('group', 'cms')
            ->orWhere('group', 'landing')
            ->get()
            ->keyBy('key');

        return Inertia::render('Admin/Cms/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $allowed = [
            'app_name', 'app_slogan', 'hero_title', 'hero_description',
            'hero_image', 'footer_about', 'contact_email', 'contact_phone',
            'facebook_url', 'instagram_url', 'twitter_url', 'whatsapp_number',
            'show_offers_section', 'show_restaurants_section', 'show_stats_section',
        ];

        foreach ($allowed as $key) {
            if ($request->has($key)) {
                SystemSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $request->get($key)]
                );
            }
        }

        // Clear cached settings
        cache()->forget('system_setting.app_name');
        cache()->forget('system_setting.app_slogan');
        cache()->forget('public.stats');
        cache()->forget('public.featured_restaurants');
        cache()->forget('public.active_offers');

        ActivityLog::log('CMS_SETTINGS_UPDATED', null, null);

        return back()->with('success', 'تم تحديث إعدادات الموقع بنجاح.');
    }
}
