<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::with('roles')
            ->whereIn('role', ['SUPER_ADMIN', 'ADMIN', 'PLATFORM_STAFF'])
            ->latest();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $roles = Role::pluck('name');
        if ($roles->isEmpty()) {
            $roles = collect(['SUPER_ADMIN', 'ADMIN', 'PLATFORM_STAFF', 'RESTAURANT_OWNER', 'RESTAURANT_STAFF', 'DELIVERY_DRIVER', 'CUSTOMER']);
        }

        return Inertia::render('Admin/Users/Index', [
            'users'   => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'role']),
            'roles'   => $roles,
        ]);
    }

    public function create(): Response
    {
        $roles = Role::pluck('name');
        if ($roles->isEmpty()) {
            $roles = collect(['ADMIN', 'PLATFORM_STAFF']);
        }

        return Inertia::render('Admin/Users/Create', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'nullable|string|max:20|unique:users,phone',
            'role'     => 'required|in:ADMIN,PLATFORM_STAFF',
            'password' => ['required', Password::min(8)],
        ], [
            'email.unique' => 'البريد الإلكتروني مسجل مسبقاً لدى مستخدم آخر.',
            'phone.unique' => 'رقم الهاتف مسجل مسبقاً لدى مستخدم آخر.',
        ]);

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'phone'     => $validated['phone'] ?? null,
            'password'  => Hash::make($validated['password']),
            'role'      => $validated['role'],
            'is_active' => true,
        ]);

        $user->assignRole($validated['role']);
        ActivityLog::log('USER_CREATED', 'User', $user->id, null, ['role' => $validated['role']]);

        return redirect()->route('admin.users.index')
            ->with('success', 'تم إنشاء المستخدم بنجاح.');
    }

    public function edit(int $id): Response
    {
        $user = User::findOrFail($id);
        $roles = Role::pluck('name');
        if ($roles->isEmpty()) {
            $roles = collect(['SUPER_ADMIN', 'ADMIN', 'PLATFORM_STAFF', 'RESTAURANT_OWNER', 'RESTAURANT_STAFF', 'DELIVERY_DRIVER', 'CUSTOMER']);
        }

        return Inertia::render('Admin/Users/Edit', [
            'user'  => $user,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($id)],
            'phone' => ['nullable', 'string', 'max:20', Rule::unique('users', 'phone')->ignore($id)],
            'role'  => 'required|in:ADMIN,PLATFORM_STAFF',
        ], [
            'email.unique' => 'البريد الإلكتروني مسجل مسبقاً لدى مستخدم آخر.',
            'phone.unique' => 'رقم الهاتف مسجل مسبقاً لدى مستخدم آخر.',
        ]);

        $user->update($validated);
        $user->syncRoles([$validated['role']]);
        ActivityLog::log('USER_UPDATED', 'User', $user->id);

        return redirect()->route('admin.users.index')
            ->with('success', 'تم تحديث بيانات المستخدم.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        if ($user->isSuperAdmin()) {
            return back()->with('error', 'لا يمكن حذف حساب Super Admin.');
        }
        ActivityLog::log('USER_DELETED', 'User', $user->id);
        $user->delete();
        return redirect()->route('admin.users.index')->with('success', 'تم حذف المستخدم.');
    }

    public function toggleActive(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);
        $status = $user->is_active ? 'تفعيل' : 'تعطيل';
        ActivityLog::log('USER_TOGGLE_ACTIVE', 'User', $user->id, null, ['is_active' => $user->is_active]);
        return back()->with('success', "تم {$status} المستخدم.");
    }
}
