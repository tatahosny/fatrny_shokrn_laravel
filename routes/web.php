<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Public\PublicController;
use App\Http\Controllers\Customer\CustomerDashboardController;
use App\Http\Controllers\Customer\CustomerOrderController;
use App\Http\Controllers\Customer\CustomerProfileController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\RestaurantController as AdminRestaurant;
use App\Http\Controllers\Admin\OrderController as AdminOrder;
use App\Http\Controllers\Admin\CustomerController as AdminCustomer;
use App\Http\Controllers\Admin\UserController as AdminUser;
use App\Http\Controllers\Admin\FinanceController as AdminFinance;
use App\Http\Controllers\Admin\InvoiceController as AdminInvoice;
use App\Http\Controllers\Admin\CollectionController as AdminCollection;
use App\Http\Controllers\Admin\AnalyticsController as AdminAnalytics;
use App\Http\Controllers\Admin\CmsController as AdminCms;
use App\Http\Controllers\Admin\ActivityLogController as AdminActivityLog;
use App\Http\Controllers\Admin\BackupController as AdminBackup;
use App\Http\Controllers\Admin\SettingsController as AdminSettings;
use App\Http\Controllers\Restaurant\DashboardController as RestaurantDashboard;
use App\Http\Controllers\Restaurant\OrderController as RestaurantOrder;
use App\Http\Controllers\Restaurant\CategoryController as RestaurantCategory;
use App\Http\Controllers\Restaurant\MenuItemController as RestaurantMenuItem;
use App\Http\Controllers\Restaurant\OfferController as RestaurantOffer;
use App\Http\Controllers\Restaurant\DeliveryDriverController as RestaurantDriver;
use App\Http\Controllers\Restaurant\AnalyticsController as RestaurantAnalytics;
use App\Http\Controllers\Restaurant\SettingsController as RestaurantSettings;
use App\Http\Controllers\Delivery\DashboardController as DeliveryDashboard;
use App\Http\Controllers\Delivery\OrderController as DeliveryOrder;
use App\Http\Controllers\Delivery\ProfileController as DeliveryProfile;
use Illuminate\Support\Facades\Route;

// =====================================================
// PUBLIC ROUTES — No authentication required
// =====================================================
Route::controller(PublicController::class)->group(function () {
    Route::get('/', 'home')->name('home');
    Route::get('/restaurants', 'restaurants')->name('restaurants');
    Route::get('/restaurants/{slug}', 'restaurantDetails')->name('restaurant.show');
    Route::get('/offers', 'offers')->name('offers');
    Route::get('/leaderboard', 'leaderboard')->name('leaderboard');
    Route::get('/contact', 'contact')->name('contact');
});

// =====================================================
// AUTHENTICATION ROUTES
// Each portal has its own login page and route
// =====================================================
Route::middleware('guest')->group(function () {

    // Customer Auth
    Route::get('/login', [AuthController::class, 'showCustomerLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'customerLogin'])->name('customer.login.post');
    Route::get('/register', [AuthController::class, 'showCustomerRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'customerRegister'])->name('customer.register.post');

    // Admin Auth — Only SUPER_ADMIN, ADMIN, PLATFORM_STAFF
    Route::get('/admin/login', [AuthController::class, 'showAdminLogin'])->name('admin.login');
    Route::post('/admin/login', [AuthController::class, 'adminLogin'])->name('admin.login.post');

    // Restaurant Auth — Only RESTAURANT_OWNER, RESTAURANT_STAFF
    Route::get('/restaurant/login', [AuthController::class, 'showRestaurantLogin'])->name('restaurant.login');
    Route::post('/restaurant/login', [AuthController::class, 'restaurantLogin'])->name('restaurant.login.post');

    // Delivery Auth — Only DELIVERY_DRIVER
    Route::get('/delivery/login', [AuthController::class, 'showDeliveryLogin'])->name('delivery.login');
    Route::post('/delivery/login', [AuthController::class, 'deliveryLogin'])->name('delivery.login.post');
});

// Logout (any authenticated user)
Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// =====================================================
// CUSTOMER ROUTES — Authenticated customers only
// =====================================================
Route::middleware(['auth', 'portal:CUSTOMER'])->prefix('')->group(function () {
    Route::get('/dashboard', [CustomerDashboardController::class, 'index'])->name('customer.dashboard');
    Route::get('/cart', [CartController::class, 'index'])->name('customer.cart');
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('customer.checkout');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('customer.checkout.store');
    Route::get('/orders', [CustomerOrderController::class, 'index'])->name('customer.orders');
    Route::get('/orders/{orderNumber}', [CustomerOrderController::class, 'show'])->name('customer.order.show');
    Route::get('/profile', [CustomerProfileController::class, 'index'])->name('customer.profile');
    Route::put('/profile', [CustomerProfileController::class, 'update'])->name('customer.profile.update');
    Route::post('/profile/student-verification', [CustomerProfileController::class, 'submitStudentVerification'])->name('customer.student.verify');
    Route::post('/profile/addresses', [CustomerProfileController::class, 'storeAddress'])->name('customer.address.store');
    Route::delete('/profile/addresses/{id}', [CustomerProfileController::class, 'deleteAddress'])->name('customer.address.delete');
});

// =====================================================
// ADMIN ROUTES — SUPER_ADMIN, ADMIN, PLATFORM_STAFF
// =====================================================
Route::middleware(['auth', 'portal:ADMIN'])->prefix('admin')->name('admin.')->group(function () {

    // Dashboard
    Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');

    // Restaurants
    Route::resource('restaurants', AdminRestaurant::class);
    Route::post('/restaurants/{id}/suspend', [AdminRestaurant::class, 'suspend'])->name('restaurants.suspend');
    Route::post('/restaurants/{id}/activate', [AdminRestaurant::class, 'activate'])->name('restaurants.activate');
    Route::put('/restaurants/{id}/financial-config', [AdminRestaurant::class, 'updateFinancialConfig'])->name('restaurants.financial-config');

    // Orders
    Route::get('/orders', [AdminOrder::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [AdminOrder::class, 'show'])->name('orders.show');

    // Customers
    Route::get('/customers', [AdminCustomer::class, 'index'])->name('customers.index');
    Route::get('/customers/{id}', [AdminCustomer::class, 'show'])->name('customers.show');
    Route::post('/customers/{id}/verify-student', [AdminCustomer::class, 'verifyStudent'])->name('customers.verify-student');
    Route::post('/customers/{id}/reject-student', [AdminCustomer::class, 'rejectStudent'])->name('customers.reject-student');

    // Users (admin user management)
    Route::resource('users', AdminUser::class);
    Route::post('/users/{id}/toggle-active', [AdminUser::class, 'toggleActive'])->name('users.toggle-active');

    // Finance
    Route::prefix('finance')->name('finance.')->group(function () {
        Route::get('/', [AdminFinance::class, 'overview'])->name('overview');
        Route::get('/revenue', [AdminFinance::class, 'revenue'])->name('revenue');
        Route::get('/expenses', [AdminFinance::class, 'expenses'])->name('expenses');
        Route::post('/expenses', [AdminFinance::class, 'storeExpense'])->name('expenses.store');
        Route::delete('/expenses/{id}', [AdminFinance::class, 'deleteExpense'])->name('expenses.delete');
        Route::get('/profit-loss', [AdminFinance::class, 'profitLoss'])->name('profit-loss');
    });

    // Invoices
    Route::resource('invoices', AdminInvoice::class);
    Route::post('/invoices/{id}/issue', [AdminInvoice::class, 'issue'])->name('invoices.issue');
    Route::post('/invoices/{id}/mark-paid', [AdminInvoice::class, 'markPaid'])->name('invoices.mark-paid');
    Route::get('/invoices/{id}/pdf', [AdminInvoice::class, 'downloadPdf'])->name('invoices.pdf');

    // Collections
    Route::get('/collections', [AdminCollection::class, 'index'])->name('collections.index');
    Route::post('/collections', [AdminCollection::class, 'store'])->name('collections.store');
    Route::get('/collections/{id}', [AdminCollection::class, 'show'])->name('collections.show');

    // Analytics
    Route::get('/analytics', [AdminAnalytics::class, 'index'])->name('analytics');

    // Landing Page CMS
    Route::get('/cms', [AdminCms::class, 'index'])->name('cms.index');
    Route::put('/cms', [AdminCms::class, 'update'])->name('cms.update');

    // Activity Logs
    Route::get('/activity-logs', [AdminActivityLog::class, 'index'])->name('activity-logs');

    // Backups
    Route::get('/backups', [AdminBackup::class, 'index'])->name('backups.index');
    Route::post('/backups', [AdminBackup::class, 'create'])->name('backups.create');
    Route::delete('/backups/{id}', [AdminBackup::class, 'destroy'])->name('backups.destroy');

    // Settings
    Route::get('/settings', [AdminSettings::class, 'index'])->name('settings.index');
    Route::put('/settings', [AdminSettings::class, 'update'])->name('settings.update');
});

// =====================================================
// RESTAURANT ROUTES — RESTAURANT_OWNER, RESTAURANT_STAFF
// =====================================================
Route::middleware(['auth', 'portal:RESTAURANT'])->prefix('restaurant')->name('restaurant.')->group(function () {

    Route::get('/dashboard', [RestaurantDashboard::class, 'index'])->name('dashboard');

    // Orders
    Route::get('/orders', [RestaurantOrder::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [RestaurantOrder::class, 'show'])->name('orders.show');
    Route::put('/orders/{id}/status', [RestaurantOrder::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/{id}/assign-driver', [RestaurantOrder::class, 'assignDriver'])->name('orders.assign-driver');

    // Categories
    Route::resource('categories', RestaurantCategory::class);
    Route::post('/categories/reorder', [RestaurantCategory::class, 'reorder'])->name('categories.reorder');

    // Menu Items
    Route::resource('menu', RestaurantMenuItem::class);
    Route::post('/menu/{id}/toggle-availability', [RestaurantMenuItem::class, 'toggleAvailability'])->name('menu.toggle');

    // Offers
    Route::resource('offers', RestaurantOffer::class);
    Route::post('/offers/{id}/toggle', [RestaurantOffer::class, 'toggle'])->name('offers.toggle');

    // Delivery Drivers
    Route::resource('delivery-drivers', RestaurantDriver::class);
    Route::post('/delivery-drivers/{id}/toggle', [RestaurantDriver::class, 'toggle'])->name('drivers.toggle');

    // Analytics
    Route::get('/analytics', [RestaurantAnalytics::class, 'index'])->name('analytics');

    // Settings
    Route::get('/settings', [RestaurantSettings::class, 'index'])->name('settings.index');
    Route::put('/settings', [RestaurantSettings::class, 'update'])->name('settings.update');
});

// =====================================================
// DELIVERY DRIVER ROUTES — DELIVERY_DRIVER only
// =====================================================
Route::middleware(['auth', 'portal:DELIVERY'])->prefix('delivery')->name('delivery.')->group(function () {

    Route::get('/dashboard', [DeliveryDashboard::class, 'index'])->name('dashboard');

    // Orders — ONLY assigned orders for THIS driver
    Route::get('/orders', [DeliveryOrder::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [DeliveryOrder::class, 'show'])->name('orders.show');
    Route::put('/orders/{id}/status', [DeliveryOrder::class, 'updateStatus'])->name('orders.status');

    // Profile
    Route::get('/profile', [DeliveryProfile::class, 'index'])->name('profile');
    Route::put('/profile', [DeliveryProfile::class, 'update'])->name('profile.update');
    Route::post('/profile/availability', [DeliveryProfile::class, 'updateAvailability'])->name('profile.availability');
});
