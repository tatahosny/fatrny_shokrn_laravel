<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Customer;
use App\Models\DeliveryDriver;
use App\Models\MenuItem;
use App\Models\Offer;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;

class LandingCmsService
{
    /**
     * Get all dynamic data needed for public Landing Page.
     */
    public function getLandingPageData(): array
    {
        return Cache::remember('landing_page_payload', 300, function () {
            // Active promotional offers
            $offers = Offer::with(['restaurant:id,name,slug,logo', 'menuItem:id,name,price,image'])
                ->active()
                ->latest()
                ->take(8)
                ->get();

            // Featured & Active Restaurants
            $restaurants = Restaurant::where('status', 'ACTIVE')
                ->withCount('menuItems')
                ->take(12)
                ->get();

            // Popular Categories across restaurants
            $categories = Category::where('is_active', true)
                ->select('name')
                ->distinct()
                ->take(10)
                ->pluck('name');

            // Popular / Featured items
            $popularItems = MenuItem::where('is_available', true)
                ->where('is_featured', true)
                ->with('restaurant:id,name,slug,logo')
                ->take(8)
                ->get();

            // Real-time Platform statistics
            $stats = [
                'restaurants_count' => Restaurant::where('status', 'ACTIVE')->count(),
                'orders_delivered_count' => Order::where('status', 'DELIVERED')->count(),
                'drivers_count' => DeliveryDriver::where('is_active', true)->count(),
                'customers_count' => Customer::count(),
            ];

            // CMS Branding and Slogan Settings
            $settings = [
                'platform_name_ar' => SystemSetting::get('platform_name_ar', 'فطرنا شكراً'),
                'platform_name_en' => SystemSetting::get('platform_name_en', 'Fatrna Shokran'),
                'hero_title' => SystemSetting::get('hero_title', 'أسرع وألذ فطار وغدا وعشا في برج العرب'),
                'hero_subtitle' => SystemSetting::get('hero_subtitle', 'اطلب من مطاعم برج العرب المفضلة مع عروض حصرية وتوصيل سريع حتى باب بيتك أو جامعتك'),
                'city_badge' => SystemSetting::get('city_badge', 'برج العرب والإسكندرية'),
                'student_banner_title' => SystemSetting::get('student_banner_title', 'خصومات خاصة لطلاب جامعة برج العرب التكنولوجية'),
                'contact_phone' => SystemSetting::get('contact_phone', '01000000000'),
                'contact_whatsapp' => SystemSetting::get('contact_whatsapp', '201000000000'),
                'contact_email' => SystemSetting::get('contact_email', 'support@fatrna-shokran.com'),
            ];

            return [
                'offers' => $offers,
                'restaurants' => $restaurants,
                'categories' => $categories,
                'popularItems' => $popularItems,
                'stats' => $stats,
                'settings' => $settings,
            ];
        });
    }

    /**
     * Get public CMS/branding settings for landing page (used by PublicController).
     * Cached separately from the full payload for granular invalidation.
     */
    public function getPublicSettings(): array
    {
        return Cache::remember('public.cms_settings', 600, function () {
            return [
                'platform_name_ar'      => SystemSetting::get('platform_name_ar', 'فطرنا شكراً'),
                'platform_name_en'      => SystemSetting::get('platform_name_en', 'Fatrna Shokran'),
                'hero_title'            => SystemSetting::get('hero_title', 'أسرع وألذ فطار وغدا وعشا في برج العرب'),
                'hero_subtitle'         => SystemSetting::get('hero_subtitle', 'اطلب من مطاعم برج العرب المفضلة مع عروض حصرية وتوصيل سريع حتى باب بيتك أو جامعتك'),
                'city_badge'            => SystemSetting::get('city_badge', 'برج العرب والإسكندرية'),
                'student_banner_title'  => SystemSetting::get('student_banner_title', 'خصومات خاصة لطلاب جامعة برج العرب التكنولوجية'),
                'contact_phone'         => SystemSetting::get('contact_phone', '01000000000'),
                'contact_whatsapp'      => SystemSetting::get('contact_whatsapp', '201000000000'),
                'contact_email'         => SystemSetting::get('contact_email', 'support@fatrna-shokran.com'),
                'footer_description'    => SystemSetting::get('footer_description', 'منصة فطرنا شكراً — توصيل الطعام الأسرع في برج العرب والإسكندرية'),
            ];
        });
    }

    /**
     * Clear landing page cache when content changes.
     */
    public function clearCache(): void
    {
        Cache::forget('landing_page_payload');
        Cache::forget('public.cms_settings');
    }
}
