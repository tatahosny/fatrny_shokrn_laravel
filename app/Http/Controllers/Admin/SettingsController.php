<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $settings = SystemSetting::all()->groupBy('group');
        return Inertia::render('Admin/Settings/Index', ['settings' => $settings]);
    }

    public function update(Request $request): RedirectResponse
    {
        $settings = $request->validate([
            'settings' => 'required|array',
            'settings.*.key'   => 'required|string',
            'settings.*.value' => 'nullable|string',
        ]);

        foreach ($settings['settings'] as $setting) {
            SystemSetting::where('key', $setting['key'])->update(['value' => $setting['value']]);
            cache()->forget("system_setting.{$setting['key']}");
        }

        ActivityLog::log('SYSTEM_SETTINGS_UPDATED', null, null);
        return back()->with('success', 'تم حفظ الإعدادات.');
    }
}
