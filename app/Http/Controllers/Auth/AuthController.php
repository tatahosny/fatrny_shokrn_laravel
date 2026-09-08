<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService) {}

    // =====================================================
    // CUSTOMER AUTH
    // =====================================================

    public function showCustomerLogin(): Response
    {
        return Inertia::render('Auth/CustomerLogin');
    }

    public function customerLogin(Request $request): RedirectResponse
    {
        $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        $this->authService->authenticate(
            AuthService::PORTAL_CUSTOMER,
            $request->email,
            $request->password,
            $request->boolean('remember')
        );

        return redirect()->route('customer.dashboard');
    }

    public function showCustomerRegister(): Response
    {
        return Inertia::render('Auth/CustomerRegister');
    }

    public function customerRegister(Request $request): RedirectResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
            'role'     => 'CUSTOMER',
            'is_active'=> true,
        ]);

        // Create Customer profile
        Customer::create([
            'user_id' => $user->id,
        ]);

        // Assign Spatie role
        $user->assignRole('CUSTOMER');

        auth()->login($user);
        $request->session()->regenerate();

        return redirect()->route('customer.dashboard');
    }

    // =====================================================
    // ADMIN AUTH
    // =====================================================

    public function showAdminLogin(): Response
    {
        return Inertia::render('Auth/AdminLogin');
    }

    public function adminLogin(Request $request): RedirectResponse
    {
        $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        $this->authService->authenticate(
            AuthService::PORTAL_ADMIN,
            $request->email,
            $request->password,
            $request->boolean('remember')
        );

        return redirect()->route('admin.dashboard');
    }

    // =====================================================
    // RESTAURANT AUTH
    // =====================================================

    public function showRestaurantLogin(): Response
    {
        return Inertia::render('Auth/RestaurantLogin');
    }

    public function restaurantLogin(Request $request): RedirectResponse
    {
        $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        $this->authService->authenticate(
            AuthService::PORTAL_RESTAURANT,
            $request->email,
            $request->password,
            $request->boolean('remember')
        );

        return redirect()->route('restaurant.dashboard');
    }

    // =====================================================
    // DELIVERY AUTH
    // =====================================================

    public function showDeliveryLogin(): Response
    {
        return Inertia::render('Auth/DeliveryLogin');
    }

    public function deliveryLogin(Request $request): RedirectResponse
    {
        $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        $this->authService->authenticate(
            AuthService::PORTAL_DELIVERY,
            $request->email,
            $request->password,
            $request->boolean('remember')
        );

        return redirect()->route('delivery.dashboard');
    }

    // =====================================================
    // LOGOUT (All portals)
    // =====================================================

    public function logout(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $role = $user?->role;

        $this->authService->logout();

        // Redirect to appropriate login page based on role
        return match (true) {
            in_array($role, ['SUPER_ADMIN', 'ADMIN', 'PLATFORM_STAFF']) => redirect()->route('admin.login'),
            in_array($role, ['RESTAURANT_OWNER', 'RESTAURANT_STAFF'])    => redirect()->route('restaurant.login'),
            $role === 'DELIVERY_DRIVER'                                  => redirect()->route('delivery.login'),
            default                                                      => redirect()->route('login'),
        };
    }
}
