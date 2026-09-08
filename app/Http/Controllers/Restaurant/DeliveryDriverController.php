<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\DeliveryDriver;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryDriverController extends Controller
{
    private function restaurant()
    {
        $restaurant = auth()->user()->restaurant;
        abort_if(!$restaurant, 403);
        return $restaurant;
    }

    public function index(): Response
    {
        $restaurant = $this->restaurant();
        return Inertia::render('Restaurant/DeliveryDrivers/Index', [
            'drivers'    => DeliveryDriver::where('restaurant_id', $restaurant->id)->with('user')->paginate(15),
            'restaurant' => $restaurant,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Restaurant/DeliveryDrivers/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $restaurant = $this->restaurant();

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'nullable|string|max:20',
            'password' => ['required', Password::min(8)],
        ]);

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'phone'     => $validated['phone'] ?? null,
            'password'  => Hash::make($validated['password']),
            'role'      => 'DELIVERY_DRIVER',
            'is_active' => true,
        ]);

        $user->assignRole('DELIVERY_DRIVER');

        $driver = DeliveryDriver::create([
            'user_id'             => $user->id,
            'restaurant_id'       => $restaurant->id,
            'name'                => $validated['name'],
            'phone'               => $validated['phone'] ?? null,
            'is_active'           => true,
            'availability_status' => 'AVAILABLE',
        ]);

        ActivityLog::log('DELIVERY_DRIVER_CREATED', 'DeliveryDriver', $driver->id, null, [
            'restaurant_id' => $restaurant->id,
        ]);

        return redirect()->route('restaurant.delivery-drivers.index')
            ->with('success', "تم إنشاء حساب المندوب {$validated['name']}.");
    }

    public function edit(int $id): Response
    {
        $restaurant = $this->restaurant();
        $driver = DeliveryDriver::where('restaurant_id', $restaurant->id)->with('user')->findOrFail($id);
        return Inertia::render('Restaurant/DeliveryDrivers/Edit', ['driver' => $driver]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $driver = DeliveryDriver::where('restaurant_id', $restaurant->id)->findOrFail($id);
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);
        $driver->update($validated);
        $driver->user->update(['name' => $validated['name'], 'phone' => $validated['phone']]);
        return back()->with('success', 'تم تحديث بيانات المندوب.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $driver = DeliveryDriver::where('restaurant_id', $restaurant->id)->findOrFail($id);
        $driver->user()->delete(); // Soft delete the user
        $driver->delete();
        return back()->with('success', 'تم حذف المندوب.');
    }

    public function toggle(int $id): RedirectResponse
    {
        $restaurant = $this->restaurant();
        $driver = DeliveryDriver::where('restaurant_id', $restaurant->id)->findOrFail($id);
        $driver->update(['is_active' => !$driver->is_active]);
        $driver->user->update(['is_active' => $driver->is_active]);
        return back()->with('success', $driver->is_active ? 'تم تفعيل المندوب.' : 'تم تعطيل المندوب.');
    }
}
