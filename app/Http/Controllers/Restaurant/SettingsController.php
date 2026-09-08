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
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store("restaurants/{$restaurant->id}", 'public');
        }

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store("restaurants/{$restaurant->id}", 'public');
        }

        $restaurant->update($validated);
        cache()->forget('public.featured_restaurants');

        return back()->with('success', 'تم حفظ إعدادات المطعم.');
    }
}
