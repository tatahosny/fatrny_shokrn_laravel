<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Models\Restaurant;
use App\Services\LandingCmsService;
use Inertia\Inertia;
use Inertia\Response;

class PublicController extends Controller
{
    public function __construct(protected LandingCmsService $cmsService) {}

    public function home(): Response
    {
        // Load active offers with restaurant info
        $activeOffers = Offer::with(['restaurant:id,name,slug,logo'])
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->latest()
            ->take(12)
            ->get();

        // Restaurants with item counts for landing page - prioritized by best-selling (most completed & total orders)
        $restaurants = Restaurant::whereIn('status', ['ACTIVE', 'SUSPENDED'])
            ->select([
                'id', 'name', 'slug', 'logo', 'cover_image', 'description',
                'phone', 'address', 'delivery_fee', 'estimated_delivery_time',
                'minimum_order_amount', 'student_discount_percentage',
                'opening_time', 'closing_time', 'status'
            ])
            ->withCount(['menuItems' => fn($q) => $q->where('is_available', true)])
            ->withCount(['offers' => fn($q) => $q->where('is_active', true)])
            ->withCount(['orders as completed_orders_count' => fn($q) => $q->where('status', 'DELIVERED')])
            ->withCount('orders')
            ->orderByRaw("CASE WHEN status = 'ACTIVE' THEN 0 ELSE 1 END")
            ->orderByDesc('completed_orders_count')
            ->orderByDesc('orders_count')
            ->latest()
            ->get();

        // Total available food items
        $totalDishes = \App\Models\MenuItem::where('is_available', true)->count();

        // Leaderboard preview data
        $leaderboard = [
            'rankings' => [
                [
                    'userId' => 1,
                    'userName' => 'زياد طارق (طالب تكنولوجية برج العرب)',
                    'badge' => 'ملك الفطار 👑',
                    'totalOrders' => 42,
                    'totalItems' => 118,
                ],
                [
                    'userId' => 2,
                    'userName' => 'مصطفى حسني (فريق إدارة التقديمات)',
                    'badge' => 'عاشق السندوتشات 🥪',
                    'totalOrders' => 35,
                    'totalItems' => 94,
                ],
                [
                    'userId' => 3,
                    'userName' => 'محمد عادل (كلية تكنولوجيا الصناعة)',
                    'badge' => 'عميد الفطار 🥇',
                    'totalOrders' => 28,
                    'totalItems' => 76,
                ],
            ],
            'kingOfBreakfast' => [
                'userId' => 1,
                'userName' => 'زياد طارق (طالب تكنولوجية برج العرب)',
                'badge' => 'ملك الفطار 👑',
                'totalOrders' => 42,
                'totalItems' => 118,
            ],
            'totalOrdersInSystem' => max(144, \App\Models\Order::count()),
            'totalItemsInSystem' => max(384, $totalDishes * 4),
        ];

        // CMS / system settings for the landing page
        $cms = $this->cmsService->getPublicSettings();

        // Dishes with dedicated student prices
        $studentDishes = \App\Models\MenuItem::with(['restaurant:id,name,slug,logo,cover_image'])
            ->where('is_available', true)
            ->whereNotNull('student_price')
            ->where('student_price', '>', 0)
            ->take(8)
            ->get();

        // Platform statistics
        $stats = [
            'restaurants'      => Restaurant::where('status', 'ACTIVE')->count(),
            'orders'           => \App\Models\Order::where('status', 'DELIVERED')->count(),
            'drivers'          => \App\Models\DeliveryDriver::where('is_active', true)->count(),
            'customers'        => \App\Models\Customer::count(),
            'verifiedStudents' => \App\Models\Customer::where('student_status', 'APPROVED')->count(),
            'totalDishes'      => $totalDishes,
        ];

        return Inertia::render('Public/Home', [
            'restaurants'        => $restaurants,
            'featuredRestaurants'=> $restaurants,
            'totalDishes'        => $totalDishes,
            'studentDishes'      => $studentDishes,
            'activeOffers'       => $activeOffers,
            'leaderboard'        => $leaderboard,
            'cms'                => $cms,
            'stats'              => $stats,
        ]);
    }

    public function leaderboard(): Response
    {
        $totalDishes = \App\Models\MenuItem::where('is_available', true)->count();
        $leaderboard = [
            'rankings' => [
                [
                    'userId' => 1,
                    'userName' => 'زياد طارق (طالب تكنولوجية برج العرب)',
                    'badge' => 'ملك الفطار 👑',
                    'totalOrders' => 42,
                    'totalItems' => 118,
                ],
                [
                    'userId' => 2,
                    'userName' => 'مصطفى حسني (فريق إدارة التقديمات)',
                    'badge' => 'عاشق السندوتشات 🥪',
                    'totalOrders' => 35,
                    'totalItems' => 94,
                ],
                [
                    'userId' => 3,
                    'userName' => 'محمد عادل (كلية تكنولوجيا الصناعة)',
                    'badge' => 'عميد الفطار 🥇',
                    'totalOrders' => 28,
                    'totalItems' => 76,
                ],
                [
                    'userId' => 4,
                    'userName' => 'أحمد محمود (طالب هندسة)',
                    'badge' => 'صديق المنيو 🌟',
                    'totalOrders' => 21,
                    'totalItems' => 52,
                ],
                [
                    'userId' => 5,
                    'userName' => 'سارة إبراهيم (إدارة التقديمات)',
                    'badge' => 'نجمة الصباح ☕',
                    'totalOrders' => 18,
                    'totalItems' => 44,
                ],
            ],
            'kingOfBreakfast' => [
                'userId' => 1,
                'userName' => 'زياد طارق (طالب تكنولوجية برج العرب)',
                'badge' => 'ملك الفطار 👑',
                'totalOrders' => 42,
                'totalItems' => 118,
            ],
            'totalOrdersInSystem' => max(144, \App\Models\Order::count()),
            'totalItemsInSystem' => max(384, $totalDishes * 4),
        ];

        return Inertia::render('Public/Leaderboard', [
            'leaderboard' => $leaderboard,
        ]);
    }

    public function restaurants(): Response
    {
        $restaurants = Restaurant::whereIn('status', ['ACTIVE', 'SUSPENDED'])
            ->select(['id', 'name', 'slug', 'logo', 'cover_image', 'description',
                'delivery_fee', 'estimated_delivery_time', 'minimum_order_amount',
                'opening_time', 'closing_time', 'address', 'status', 'student_discount_percentage', 'phone'])
            ->withCount(['offers' => fn($q) => $q->where('is_active', true)])
            ->orderByRaw("CASE WHEN status = 'ACTIVE' THEN 0 ELSE 1 END")
            ->latest()
            ->paginate(12);

        return Inertia::render('Public/Restaurants', [
            'restaurants' => $restaurants,
        ]);
    }

    public function restaurantDetails(string $slug): Response
    {
        $restaurant = Restaurant::where('slug', $slug)
            ->whereIn('status', ['ACTIVE', 'SUSPENDED'])
            ->with([
                'categories' => function ($q) {
                    $q->where('is_active', true)
                      ->orderBy('sort_order')
                      ->with(['menuItems' => function ($q) {
                          $q->where('is_available', true)
                            ->orderBy('sort_order')
                            ->with(['options.values', 'addons']);
                      }]);
                },
                'offers' => function ($q) {
                    $q->where('is_active', true)
                      ->where(function ($q) {
                          $q->whereNull('end_date')->orWhere('end_date', '>=', now());
                      });
                },
            ])
            ->firstOrFail();

        return Inertia::render('Public/RestaurantDetails', [
            'restaurant' => $restaurant,
        ]);
    }

    public function offers(): Response
    {
        $offers = Offer::with(['restaurant:id,name,slug,logo'])
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->latest()
            ->paginate(16);

        return Inertia::render('Public/Offers', [
            'offers' => $offers,
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Public/Contact');
    }
}
