<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $restaurant = auth()->user()->restaurant;
        abort_if(!$restaurant, 403);
        return Inertia::render('Restaurant/Settings/Index', ['restaurant' => $restaurant]);
    }

    public function update(Request $request): RedirectResponse
    {
        $restaurant = auth()->user()->restaurant;
        abort_if(!$restaurant, 403);

        // Sanitize times if provided with seconds (e.g. 08:00:00 -> 08:00)
        if ($request->filled('opening_time')) {
            $request->merge(['opening_time' => substr($request->opening_time, 0, 5)]);
        }
        if ($request->filled('closing_time')) {
            $request->merge(['closing_time' => substr($request->closing_time, 0, 5)]);
        }

        $validated = $request->validate([
            'name'                    => 'required|string|max:255',
            'description'             => 'nullable|string',
            'phone'                   => 'nullable|string|max:20',
            'whatsapp'                => 'nullable|string|max:20',
            'email'                   => 'nullable|email',
            'address'                 => 'nullable|string',
            'opening_time'            => 'nullable|date_format:H:i',
            'closing_time'            => 'nullable|date_format:H:i',
            'minimum_order_amount'    => 'nullable|numeric|min:0',
            'estimated_delivery_time' => 'nullable|integer|min:1',
            'delivery_fee_per_km'     => 'nullable|numeric|min:0',
            'delivery_base_fee'       => 'nullable|numeric|min:0',
            'latitude'                => 'nullable|numeric',
            'longitude'               => 'nullable|numeric',
            'logo'                    => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
            'cover_image'             => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'student_discount_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        if ($request->hasFile('logo') || $request->hasFile('cover_image')) {
            $file = $request->file('logo') ?? $request->file('cover_image');
            $path = $file->store("restaurants/{$restaurant->id}", 'public');
            // Cover image and logo are unified as one
            $validated['logo'] = $path;
            $validated['cover_image'] = $path;
        }

        $restaurant->update($validated);
        cache()->forget('public.featured_restaurants');

        \App\Models\ActivityLog::log('RESTAURANT_SETTINGS_UPDATED', 'Restaurant', $restaurant->id, null, [
            'name' => $restaurant->name,
            'has_logo' => !empty($validated['logo']),
            'has_cover' => !empty($validated['cover_image']),
        ]);

        return back()->with('success', 'تم حفظ إعدادات وصور المطعم بنجاح.');
    }
}
