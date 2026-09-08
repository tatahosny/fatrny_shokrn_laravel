<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        $driver = auth()->user()->deliveryDriver;
        abort_if(!$driver, 403);
        return Inertia::render('Delivery/Profile', [
            'driver' => $driver->load('user', 'restaurant:id,name'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $driver = auth()->user()->deliveryDriver;
        abort_if(!$driver, 403);

        $validated = $request->validate([
            'phone' => 'nullable|string|max:20',
        ]);

        $driver->update($validated);
        auth()->user()->update(['phone' => $validated['phone']]);

        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('drivers/profiles', 'public');
            $driver->update(['profile_image' => $path]);
        }

        return back()->with('success', 'تم تحديث ملفك الشخصي.');
    }

    public function updateAvailability(Request $request): RedirectResponse
    {
        $driver = auth()->user()->deliveryDriver;
        abort_if(!$driver, 403);

        $request->validate([
            'availability_status' => 'required|in:AVAILABLE,OFFLINE',
        ]);

        // Don't allow changing status if BUSY (has active delivery)
        if ($driver->availability_status === 'BUSY') {
            return back()->with('error', 'لا يمكن تغيير الحالة أثناء وجود توصيل نشط.');
        }

        $driver->update(['availability_status' => $request->availability_status]);
        return back()->with('success', 'تم تحديث حالة التوفر.');
    }
}
