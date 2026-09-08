<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\DeliveryDriver;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryDriverController extends Controller
{
    public function index(Request $request): Response
    {
        $query = DeliveryDriver::with(['user', 'restaurant:id,name'])
            ->latest();

        if ($request->filled('restaurant_id')) {
            $query->where('restaurant_id', $request->restaurant_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($uq) => $uq->where('email', 'like', "%{$search}%"));
            });
        }

        return Inertia::render('Admin/DeliveryDrivers/Index', [
            'drivers'     => $query->paginate(20)->withQueryString(),
            'restaurants' => Restaurant::active()->get(['id', 'name']),
            'filters'     => $request->only(['search', 'restaurant_id']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/DeliveryDrivers/Create', [
            'restaurants' => Restaurant::active()->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'phone'         => 'required|string|max:20|unique:users,phone',
            'password'      => ['required', Password::min(8)],
            'restaurant_id' => 'required|exists:restaurants,id',
        ], [
            'email.unique'         => 'البريد الإلكتروني مسجل مسبقاً.',
            'phone.unique'         => 'رقم الهاتف مسجل مسبقاً.',
            'restaurant_id.required' => 'يجب تحديد المطعم التابع له المندوب.',
            'restaurant_id.exists'   => 'المطعم المحدد غير موجود.',
        ]);

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'phone'     => $validated['phone'],
            'password'  => Hash::make($validated['password']),
            'role'      => 'DELIVERY_DRIVER',
            'is_active' => true,
        ]);

        $user->assignRole('DELIVERY_DRIVER');

        $driver = DeliveryDriver::create([
            'user_id'             => $user->id,
            'restaurant_id'       => $validated['restaurant_id'],
            'name'                => $validated['name'],
            'phone'               => $validated['phone'],
            'is_active'           => true,
            'availability_status' => 'AVAILABLE',
        ]);

        ActivityLog::log('DELIVERY_DRIVER_CREATED', 'DeliveryDriver', $driver->id, null, [
            'restaurant_id' => $validated['restaurant_id'],
            'created_by'    => 'admin',
        ]);

        return redirect()->route('admin.delivery-drivers.index')
            ->with('success', "تم إنشاء حساب المندوب {$validated['name']} وتعيينه للمطعم بنجاح.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $driver = DeliveryDriver::findOrFail($id);
        ActivityLog::log('DELIVERY_DRIVER_DELETED', 'DeliveryDriver', $driver->id);
        $driver->user()->delete();
        $driver->delete();
        return back()->with('success', 'تم حذف المندوب بنجاح.');
    }

    public function toggle(int $id): RedirectResponse
    {
        $driver = DeliveryDriver::findOrFail($id);
        $driver->update(['is_active' => !$driver->is_active]);
        $driver->user->update(['is_active' => $driver->is_active]);
        return back()->with('success', $driver->is_active ? 'تم تفعيل المندوب.' : 'تم تعطيل المندوب.');
    }
}
