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
use App\Http\Controllers\Admin\BillingHubController as AdminBillingHub;
use App\Http\Controllers\Admin\AnalyticsController as AdminAnalytics;
use App\Http\Controllers\Admin\CmsController as AdminCms;
use App\Http\Controllers\Admin\ActivityLogController as AdminActivityLog;
use App\Http\Controllers\Admin\BackupController as AdminBackup;
use App\Http\Controllers\Admin\SettingsController as AdminSettings;
use App\Http\Controllers\Admin\DeliveryDriverController as AdminDriver;
use App\Http\Controllers\Restaurant\DashboardController as RestaurantDashboard;
use App\Http\Controllers\Restaurant\OrderController as RestaurantOrder;
use App\Http\Controllers\Restaurant\CategoryController as RestaurantCategory;
use App\Http\Controllers\Restaurant\MenuItemController as RestaurantMenuItem;
use App\Http\Controllers\Restaurant\OfferController as RestaurantOffer;
use App\Http\Controllers\Restaurant\DeliveryDriverController as RestaurantDriver;
use App\Http\Controllers\Restaurant\AnalyticsController as RestaurantAnalytics;
use App\Http\Controllers\Restaurant\DriverStatsController as RestaurantDriverStats;
use App\Http\Controllers\Restaurant\SettingsController as RestaurantSettings;
use App\Http\Controllers\Restaurant\BillingController as RestaurantBilling;
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
Route::middleware(['auth', 'portal:CUSTOMER'])->group(function () {
    // Dashboard (both /customer/dashboard and /dashboard)
    Route::get('/dashboard', [CustomerDashboardController::class, 'index'])->name('customer.dashboard');
    Route::get('/customer/dashboard', [CustomerDashboardController::class, 'index'])->name('customer.dashboard.alias');

    // Cart & Checkout
    Route::get('/cart', [CartController::class, 'index'])->name('customer.cart');
    Route::get('/customer/cart', [CartController::class, 'index'])->name('customer.cart.alias');
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('customer.checkout');
    Route::get('/customer/checkout', [CheckoutController::class, 'index'])->name('customer.checkout.alias');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('customer.checkout.store');
    Route::post('/delivery-quote', \App\Http\Controllers\Customer\DeliveryQuoteController::class)->name('customer.delivery-quote');
    Route::post('/orders', [CheckoutController::class, 'store'])->name('customer.orders.store');
    Route::post('/customer/orders', [CheckoutController::class, 'store'])->name('customer.orders.store.alias');

    // Orders History & Details
    Route::get('/orders', [CustomerOrderController::class, 'index'])->name('customer.orders');
    Route::get('/customer/orders', [CustomerOrderController::class, 'index'])->name('customer.orders.alias');
    Route::get('/orders/{orderNumber}', [CustomerOrderController::class, 'show'])->name('customer.order.show');
    Route::get('/customer/orders/{orderNumber}', [CustomerOrderController::class, 'show'])->name('customer.order.show.alias');
    Route::get('/orders/{orderNumber}/driver-location', [CustomerOrderController::class, 'driverLocation'])->name('customer.order.driver-location');

    // Profile & Settings
    Route::get('/profile', [CustomerProfileController::class, 'index'])->name('customer.profile');
    Route::get('/customer/profile', [CustomerProfileController::class, 'index'])->name('customer.profile.alias');
    Route::put('/profile', [CustomerProfileController::class, 'update'])->name('customer.profile.update');
    Route::put('/customer/profile', [CustomerProfileController::class, 'update'])->name('customer.profile.update.alias');

    // Student Verification
    Route::post('/profile/student-verification', [CustomerProfileController::class, 'submitStudentVerification'])->name('customer.student.verify');
    Route::post('/customer/profile/student-verification', [CustomerProfileController::class, 'submitStudentVerification'])->name('customer.student.verify.alias');

    // Addresses Management
    Route::post('/profile/addresses', [CustomerProfileController::class, 'storeAddress'])->name('customer.address.store');
    Route::post('/customer/profile/addresses', [CustomerProfileController::class, 'storeAddress'])->name('customer.address.store.alias');
    Route::post('/customer/profile/address', [CustomerProfileController::class, 'storeAddress'])->name('customer.address.store.single');
    Route::delete('/profile/addresses/{id}', [CustomerProfileController::class, 'deleteAddress'])->name('customer.address.delete');
    Route::delete('/customer/profile/addresses/{id}', [CustomerProfileController::class, 'deleteAddress'])->name('customer.address.delete.alias');
    Route::delete('/customer/profile/address/{id}', [CustomerProfileController::class, 'deleteAddress'])->name('customer.address.delete.single');
});

// =====================================================
// ADMIN ROUTES — SUPER_ADMIN, ADMIN, PLATFORM_STAFF
// =====================================================
Route::middleware(['auth', 'portal:ADMIN'])->prefix('admin')->name('admin.')->group(function () {

    // Dashboard
    Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');

    // Restaurants
    Route::match(['post', 'patch'], '/restaurants/{id}/suspend', [AdminRestaurant::class, 'suspend'])->name('restaurants.suspend');
    Route::match(['post', 'patch'], '/restaurants/{id}/activate', [AdminRestaurant::class, 'activate'])->name('restaurants.activate');
    Route::match(['post', 'patch'], '/restaurants/{id}/toggle-status', [AdminRestaurant::class, 'toggleStatus'])->name('restaurants.toggle-status');
    Route::delete('/restaurants/{id}/account', [AdminRestaurant::class, 'destroyAccount'])->name('restaurants.destroy-account');
    Route::put('/restaurants/{id}/financial-config', [AdminRestaurant::class, 'updateFinancialConfig'])->name('restaurants.financial-config');
    Route::resource('restaurants', AdminRestaurant::class);

    // Orders
    Route::get('/orders', [AdminOrder::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [AdminOrder::class, 'show'])->name('orders.show');
    Route::match(['put', 'patch'], '/orders/{id}/status', [AdminOrder::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/{id}/assign-driver', [AdminOrder::class, 'assignDriver'])->name('orders.assign-driver');

    // Customers
    Route::get('/customers', [AdminCustomer::class, 'index'])->name('customers.index');
    Route::get('/customers/{id}', [AdminCustomer::class, 'show'])->name('customers.show');
    Route::match(['post', 'patch'], '/customers/{id}/verify-student', [AdminCustomer::class, 'verifyStudent'])->name('customers.verify-student');
    Route::match(['post', 'patch'], '/customers/{id}/reject-student', [AdminCustomer::class, 'rejectStudent'])->name('customers.reject-student');

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
    Route::post('/invoices/auto-generate', [AdminInvoice::class, 'autoGenerateMonthly'])->name('invoices.auto-generate');
    Route::resource('invoices', AdminInvoice::class);
    Route::match(['post', 'patch'], '/invoices/{id}/issue', [AdminInvoice::class, 'issue'])->name('invoices.issue');
    Route::match(['post', 'patch'], '/invoices/{id}/mark-paid', [AdminInvoice::class, 'markPaid'])->name('invoices.mark-paid');
    Route::match(['post', 'patch'], '/invoices/{id}/suspend-restaurant', [AdminInvoice::class, 'suspendRestaurant'])->name('invoices.suspend-restaurant');
    Route::match(['post', 'patch'], '/invoices/{id}/cancel', [AdminInvoice::class, 'destroy'])->name('invoices.cancel');
    Route::get('/invoices/{id}/pdf', [AdminInvoice::class, 'downloadPdf'])->name('invoices.pdf');

    // Collections
    Route::get('/collections', [AdminCollection::class, 'index'])->name('collections.index');
    Route::post('/collections', [AdminCollection::class, 'store'])->name('collections.store');
    Route::get('/collections/{id}', [AdminCollection::class, 'show'])->name('collections.show');

    // ─── Billing Hub (replaces Invoices + Collections pages) ─────
    Route::get('/billing', [AdminBillingHub::class, 'index'])->name('billing.index');
    Route::post('/billing/auto-generate', [AdminBillingHub::class, 'autoGenerate'])->name('billing.auto-generate');
    Route::post('/billing/auto-lock-overdue', [AdminBillingHub::class, 'autoLockOverdue'])->name('billing.auto-lock');
    Route::post('/billing/collection', [AdminBillingHub::class, 'recordCollection'])->name('billing.collection.store');
    Route::post('/billing/invoice', [AdminBillingHub::class, 'createInvoice'])->name('billing.invoice.store');
    Route::put('/billing/invoice/{id}', [AdminBillingHub::class, 'updateInvoice'])->name('billing.invoice.update');
    Route::post('/billing/invoice/{id}/mark-paid', [AdminBillingHub::class, 'markInvoicePaid'])->name('billing.invoice.mark-paid');
    Route::post('/billing/invoice/{id}/suspend', [AdminBillingHub::class, 'suspendRestaurant'])->name('billing.invoice.suspend');
    Route::post('/billing/invoice/{id}/cancel', [AdminBillingHub::class, 'cancelInvoice'])->name('billing.invoice.cancel');
    Route::get('/billing/invoice/{id}/download', [AdminBillingHub::class, 'downloadInvoice'])->name('billing.invoice.download');

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
    Route::match(['put', 'post'], '/settings', [AdminSettings::class, 'update'])->name('settings.update');

    // Delivery Drivers (Admin-level management across all restaurants)
    Route::get('/delivery-drivers', [AdminDriver::class, 'index'])->name('delivery-drivers.index');
    Route::get('/delivery-drivers/create', [AdminDriver::class, 'create'])->name('delivery-drivers.create');
    Route::post('/delivery-drivers', [AdminDriver::class, 'store'])->name('delivery-drivers.store');
    Route::delete('/delivery-drivers/{id}', [AdminDriver::class, 'destroy'])->name('delivery-drivers.destroy');
    Route::post('/delivery-drivers/{id}/toggle', [AdminDriver::class, 'toggle'])->name('delivery-drivers.toggle');
});

// =====================================================
// RESTAURANT ROUTES — RESTAURANT_OWNER, RESTAURANT_STAFF
// =====================================================
Route::middleware(['auth', 'portal:RESTAURANT', 'billing.check'])->prefix('restaurant')->name('restaurant.')->group(function () {

    Route::get('/dashboard', [RestaurantDashboard::class, 'index'])->name('dashboard');

    // Billing & Invoices
    Route::get('/billing', [RestaurantBilling::class, 'index'])->name('billing');

    // Orders
    Route::get('/orders', [RestaurantOrder::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [RestaurantOrder::class, 'show'])->name('orders.show');
    Route::match(['put', 'patch'], '/orders/{id}/status', [RestaurantOrder::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/{id}/assign-driver', [RestaurantOrder::class, 'assignDriver'])->name('orders.assign-driver');
    Route::get('/orders/{id}/driver-location', [RestaurantOrder::class, 'driverLocation'])->name('orders.driver-location');

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

    // Driver Statistics
    Route::get('/driver-stats', [RestaurantDriverStats::class, 'index'])->name('driver-stats');

    // Settings
    Route::get('/settings', [RestaurantSettings::class, 'index'])->name('settings.index');
    Route::match(['put', 'post'], '/settings', [RestaurantSettings::class, 'update'])->name('settings.update');
});

// =====================================================
// DELIVERY DRIVER ROUTES — DELIVERY_DRIVER only
// =====================================================
Route::middleware(['auth', 'portal:DELIVERY', 'billing.check'])->prefix('delivery')->name('delivery.')->group(function () {

    Route::get('/dashboard', [DeliveryDashboard::class, 'index'])->name('dashboard');
    Route::get('/suspended', [DeliveryDashboard::class, 'suspended'])->name('suspended');

    // Orders — ONLY assigned orders for THIS driver
    Route::get('/orders', [DeliveryOrder::class, 'index'])->name('orders.index');
    Route::get('/order-history', [DeliveryOrder::class, 'index'])->name('orders.history');
    Route::get('/active-order', [DeliveryOrder::class, 'activeOrder'])->name('orders.active');
    Route::get('/orders/{id}', [DeliveryOrder::class, 'show'])->name('orders.show');
    Route::match(['put', 'patch'], '/orders/{id}/status', [DeliveryOrder::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/{id}/location', [DeliveryOrder::class, 'updateLocation'])->name('orders.location');
    Route::post('/location', [DeliveryOrder::class, 'updateGlobalLocation'])->name('location');

    // Profile
    Route::get('/profile', [DeliveryProfile::class, 'index'])->name('profile');
    Route::put('/profile', [DeliveryProfile::class, 'update'])->name('profile.update');
    Route::post('/profile/availability', [DeliveryProfile::class, 'updateAvailability'])->name('profile.availability');
});
