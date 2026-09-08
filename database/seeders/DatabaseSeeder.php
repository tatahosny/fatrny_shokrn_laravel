<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\DeliveryDriver;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\MenuItem;
use App\Models\MenuItemAddon;
use App\Models\MenuItemOption;
use App\Models\MenuItemOptionValue;
use App\Models\Offer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Restaurant;
use App\Models\RestaurantStaff;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles & Permissions
        $roles = [
            'SUPER_ADMIN',
            'ADMIN',
            'PLATFORM_STAFF',
            'RESTAURANT_OWNER',
            'RESTAURANT_STAFF',
            'DELIVERY_DRIVER',
            'CUSTOMER',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        $permissions = [
            'restaurants.view', 'restaurants.create', 'restaurants.update', 'restaurants.delete',
            'orders.view', 'orders.manage',
            'finance.view', 'finance.manage',
            'offers.view', 'offers.manage',
            'users.view', 'users.manage',
            'settings.manage',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        $superAdminRole = Role::findByName('SUPER_ADMIN');
        $superAdminRole->syncPermissions(Permission::all());

        $adminRole = Role::findByName('ADMIN');
        $adminRole->syncPermissions([
            'restaurants.view', 'restaurants.create', 'restaurants.update',
            'orders.view', 'orders.manage',
            'finance.view', 'offers.view', 'offers.manage',
            'users.view',
        ]);

        // 2. System Settings & CMS
        $settings = [
            ['key' => 'app_name', 'value' => 'فطرنا شكراً', 'group' => 'branding', 'type' => 'string', 'description' => 'اسم المنصة'],
            ['key' => 'app_slogan', 'value' => 'أشهى المأكولات في برج العرب بضغطة زر', 'group' => 'branding', 'type' => 'string', 'description' => 'شعار المنصة'],
            ['key' => 'hero_title', 'value' => 'اطلب أكلتك المفضلة من مطاعم برج العرب', 'group' => 'cms', 'type' => 'string', 'description' => 'عنوان الهيرو الرئيسي'],
            ['key' => 'hero_description', 'value' => 'منصة متكاملة لطلب وتوصيل الطعام لجميع أحياء برج العرب وجامعة برج العرب التكنولوجية والجامعة اليابانية.', 'group' => 'cms', 'type' => 'string', 'description' => 'وصف الهيرو'],
            ['key' => 'contact_email', 'value' => 'support@fatrna.com', 'group' => 'cms', 'type' => 'string', 'description' => 'بريد التواصل'],
            ['key' => 'contact_phone', 'value' => '01000000000', 'group' => 'cms', 'type' => 'string', 'description' => 'هاتف التواصل'],
            ['key' => 'whatsapp_number', 'value' => '+201000000000', 'group' => 'cms', 'type' => 'string', 'description' => 'واتساب المنصة'],
            ['key' => 'show_offers_section', 'value' => '1', 'group' => 'cms', 'type' => 'boolean', 'description' => 'إظهار قسم العروض'],
            ['key' => 'show_restaurants_section', 'value' => '1', 'group' => 'cms', 'type' => 'boolean', 'description' => 'إظهار قسم المطاعم المميزة'],
            ['key' => 'show_stats_section', 'value' => '1', 'group' => 'cms', 'type' => 'boolean', 'description' => 'إظهار الإحصائيات'],
        ];

        foreach ($settings as $s) {
            SystemSetting::updateOrCreate(['key' => $s['key']], $s);
        }

        // 3. Super Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@fatrna.com'],
            [
                'name' => 'المدير العام',
                'phone' => '01011112222',
                'password' => Hash::make('password'),
                'role' => 'SUPER_ADMIN',
                'is_active' => true,
            ]
        );
        $admin->assignRole('SUPER_ADMIN');

        // 4. Expense Categories & Sample Expenses
        $expenseCategories = [
            'سيرفرات واستضافة' => 'تكاليف الخوادم وقواعد البيانات',
            'تسويق وإعلانات' => 'حملات فيسبوك وإنستجرام ببرج العرب',
            'رواتب ودعم فني' => 'فريق خدمة العملاء والتشغيل',
            'صيانة وتطوير' => 'خدمات برمجية وتقنية',
        ];

        $createdExpCats = [];
        foreach ($expenseCategories as $name => $desc) {
            $createdExpCats[] = ExpenseCategory::firstOrCreate(['name' => $name], ['description' => $desc]);
        }

        if (count($createdExpCats) > 0) {
            Expense::firstOrCreate(
                ['description' => 'استضافة سحابية وسيرفر التطبيق'],
                [
                    'expense_category_id' => $createdExpCats[0]->id,
                    'amount' => 1200.00,
                    'expense_date' => now()->subDays(5)->toDateString(),
                    'created_by_user_id' => $admin->id,
                ]
            );
        }

        // 5. Demo Restaurant 1: الشبراوي - برج العرب
        $shabrawy = Restaurant::firstOrCreate(
            ['slug' => 'el-shabrawy-borg-el-arab'],
            [
                'name' => 'الشبراوي - برج العرب',
                'description' => 'أشهى وجبات الفول والفلافل والساندوتشات الشرقية والوجبات السريعة في برج العرب.',
                'phone' => '01234567890',
                'whatsapp' => '01234567890',
                'email' => 'shabrawy@example.com',
                'address' => 'ميدان البنوك، الحي الأول، مدينة برج العرب الجديدة',
                'latitude' => 30.9167,
                'longitude' => 29.6167,
                'status' => 'ACTIVE',
                'opening_time' => '06:00',
                'closing_time' => '23:30',
                'minimum_order_amount' => 40.00,
                'delivery_fee' => 15.00,
                'estimated_delivery_time' => 30,
                'student_discount_percentage' => 10.00,
                'commission_type' => 'PERCENTAGE',
                'commission_percentage' => 10.00,
                'monthly_subscription_fee' => 300.00,
                'billing_cycle' => 'MONTHLY',
            ]
        );

        // Shabrawy Owner User
        $ownerUser = User::firstOrCreate(
            ['email' => 'owner@shabrawy.com'],
            [
                'name' => 'الحاج أحمد الشبراوي',
                'phone' => '01234567891',
                'password' => Hash::make('password'),
                'role' => 'RESTAURANT_OWNER',
                'is_active' => true,
            ]
        );
        $ownerUser->assignRole('RESTAURANT_OWNER');

        RestaurantStaff::firstOrCreate(
            ['user_id' => $ownerUser->id, 'restaurant_id' => $shabrawy->id],
            ['role' => 'OWNER']
        );

        // Shabrawy Categories
        $catFoul = Category::firstOrCreate(
            ['restaurant_id' => $shabrawy->id, 'slug' => 'foul-falafel'],
            ['name' => 'فول وفلافل', 'sort_order' => 1, 'is_active' => true]
        );

        $catSandwiches = Category::firstOrCreate(
            ['restaurant_id' => $shabrawy->id, 'slug' => 'sandwiches'],
            ['name' => 'ساندوتشات متنوعة', 'sort_order' => 2, 'is_active' => true]
        );

        $catDrinks = Category::firstOrCreate(
            ['restaurant_id' => $shabrawy->id, 'slug' => 'drinks'],
            ['name' => 'مشروبات وعصائر', 'sort_order' => 3, 'is_active' => true]
        );

        // Shabrawy Menu Items
        $itemFalafel = MenuItem::firstOrCreate(
            ['restaurant_id' => $shabrawy->id, 'name' => 'ساندوتش فلافل إكسترا محشية'],
            [
                'category_id' => $catFoul->id,
                'description' => 'فلافل مقرمشة محشية خلطة سرية بالبصل والطماطم والسمسم مع صوص الطحينة المميز.',
                'price' => 12.00,
                'is_available' => true,
                'is_featured' => true,
                'preparation_time' => 5,
                'sort_order' => 1,
            ]
        );

        // Options for Falafel
        $optBread = MenuItemOption::firstOrCreate(
            ['menu_item_id' => $itemFalafel->id, 'name' => 'نوع الخبز'],
            ['is_required' => true]
        );

        MenuItemOptionValue::firstOrCreate(
            ['menu_item_option_id' => $optBread->id, 'name' => 'عيش بلدي'],
            ['price' => 0.00]
        );
        MenuItemOptionValue::firstOrCreate(
            ['menu_item_option_id' => $optBread->id, 'name' => 'عيش شامي'],
            ['price' => 2.00]
        );

        // Addons for Falafel
        MenuItemAddon::firstOrCreate(
            ['menu_item_id' => $itemFalafel->id, 'name' => 'إضافة جبنة بيضاء'],
            ['price' => 5.00, 'is_available' => true]
        );
        MenuItemAddon::firstOrCreate(
            ['menu_item_id' => $itemFalafel->id, 'name' => 'إضافة باذنجان مقلي'],
            ['price' => 4.00, 'is_available' => true]
        );

        $itemFoul = MenuItem::firstOrCreate(
            ['restaurant_id' => $shabrawy->id, 'name' => 'طبق فول بالزيت الحار والليمون'],
            [
                'category_id' => $catFoul->id,
                'description' => 'فول بلدي مدمس على أصوله مع زيت حار طازج ولمسة ليمون وطحينة وتوابل الشبراوي الخاصة.',
                'price' => 25.00,
                'discount_price' => 20.00,
                'is_available' => true,
                'is_featured' => true,
                'preparation_time' => 5,
                'sort_order' => 2,
            ]
        );

        MenuItem::firstOrCreate(
            ['restaurant_id' => $shabrawy->id, 'name' => 'ساندوتش بطاطس بانيه بالمايونيز'],
            [
                'category_id' => $catSandwiches->id,
                'description' => 'أصابع بطاطس مقرمشة متبلة ومغطاة بالبقسماط مع الكاتشب والمايونيز والجرجير.',
                'price' => 18.00,
                'is_available' => true,
                'is_featured' => false,
                'preparation_time' => 7,
                'sort_order' => 3,
            ]
        );

        // Shabrawy Offer for Public Slider
        Offer::firstOrCreate(
            ['restaurant_id' => $shabrawy->id, 'title' => 'عرض ملوك الإفطار — وفر 30%'],
            [
                'description' => '2 ساندوتش فلافل محشية + طبق فول بالزيت الحار + بيبسي كانز بسعر خاص جداً لطلاب التكنولوجية والجامعة اليابانية!',
                'original_price' => 65.00,
                'discount_price' => 45.00,
                'discount_percentage' => 30.7,
                'is_active' => true,
                'start_date' => now()->subDay(),
                'end_date' => now()->addDays(30),
            ]
        );

        // 6. Delivery Driver for Shabrawy
        $driverUser = User::firstOrCreate(
            ['email' => 'driver@shabrawy.com'],
            [
                'name' => 'كابتن محمود عادل (طيار الشبراوي)',
                'phone' => '01099887766',
                'password' => Hash::make('password'),
                'role' => 'DELIVERY_DRIVER',
                'is_active' => true,
            ]
        );
        $driverUser->assignRole('DELIVERY_DRIVER');

        $driver = DeliveryDriver::firstOrCreate(
            ['user_id' => $driverUser->id],
            [
                'restaurant_id' => $shabrawy->id,
                'name' => 'كابتن محمود عادل',
                'phone' => '01099887766',
                'is_active' => true,
                'availability_status' => 'AVAILABLE',
            ]
        );

        // 7. Demo Restaurant 2: فطاطري البرنس
        $prince = Restaurant::firstOrCreate(
            ['slug' => 'fetatri-el-prince'],
            [
                'name' => 'فطاطري البرنس - برج العرب',
                'description' => 'أفضل فطير مشلتت وفطير شرقي بالسجق والكيري واللحم المفروم والحلويات في الإسكندرية.',
                'phone' => '01122334455',
                'whatsapp' => '01122334455',
                'email' => 'prince@example.com',
                'address' => 'شارع جمال عبد الناصر، بجوار السنترال، برج العرب',
                'latitude' => 30.9180,
                'longitude' => 29.6200,
                'status' => 'ACTIVE',
                'opening_time' => '10:00',
                'closing_time' => '02:00',
                'minimum_order_amount' => 80.00,
                'delivery_fee' => 20.00,
                'estimated_delivery_time' => 45,
                'student_discount_percentage' => 15.00,
                'commission_type' => 'PERCENTAGE',
                'commission_percentage' => 12.00,
                'monthly_subscription_fee' => 500.00,
                'billing_cycle' => 'MONTHLY',
            ]
        );

        $catFeteer = Category::firstOrCreate(
            ['restaurant_id' => $prince->id, 'slug' => 'feteer-meshaltet'],
            ['name' => 'فطير مشلتت وشرقي', 'sort_order' => 1, 'is_active' => true]
        );

        MenuItem::firstOrCreate(
            ['restaurant_id' => $prince->id, 'name' => 'فطيرة كيري بالسجق الإسكندراني سوبر كرانشي'],
            [
                'category_id' => $catFeteer->id,
                'description' => 'عجينة مورقة بالسمن البلدي محشوة سجق إسكندراني بلدي وجبنة كيري وموزاريلا وزيتون وفلفل رومي.',
                'price' => 140.00,
                'discount_price' => 120.00,
                'is_available' => true,
                'is_featured' => true,
                'preparation_time' => 25,
                'sort_order' => 1,
            ]
        );

        Offer::firstOrCreate(
            ['restaurant_id' => $prince->id, 'title' => 'عرض الأصدقاء — فطيرة سجق + فطيرة نوتيلا'],
            [
                'description' => 'فطيرة وسط سجق كيري + فطيرة نوتيلا كرانشي للمة والصحبة بخصم 25%',
                'original_price' => 240.00,
                'discount_price' => 180.00,
                'discount_percentage' => 25.0,
                'is_active' => true,
                'start_date' => now()->subDay(),
                'end_date' => now()->addDays(20),
            ]
        );

        // 8. Demo Customer User (Verified Student at Borg El Arab University)
        $customerUser = User::firstOrCreate(
            ['email' => 'customer@fatrna.com'],
            [
                'name' => 'زياد طارق (طالب تكنولوجية برج العرب)',
                'phone' => '01555555555',
                'password' => Hash::make('password'),
                'role' => 'CUSTOMER',
                'is_active' => true,
            ]
        );
        $customerUser->assignRole('CUSTOMER');

        $customer = Customer::firstOrCreate(
            ['user_id' => $customerUser->id],
            [
                'university_name' => 'جامعة برج العرب التكنولوجية',
                'university_id_number' => 'BATU-2024-8891',
                'student_status' => 'APPROVED',
                'student_verified_at' => now(),
            ]
        );

        CustomerAddress::firstOrCreate(
            ['customer_id' => $customer->id, 'label' => 'سكن الطلاب'],
            [
                'address' => 'عمارة 14، الحي الثاني، بجوار جامعة برج العرب التكنولوجية',
                'latitude' => 30.9150,
                'longitude' => 29.6150,
                'is_default' => true,
            ]
        );

        // 9. Sample Order in progress
        $order = Order::firstOrCreate(
            ['order_number' => 'FS-' . date('Ymd') . '-DEMO1'],
            [
                'customer_id' => $customer->id,
                'restaurant_id' => $shabrawy->id,
                'assigned_delivery_id' => $driver->id,
                'status' => 'OUT_FOR_DELIVERY',
                'payment_status' => 'PENDING',
                'payment_method' => 'CASH_ON_DELIVERY',
                'subtotal' => 37.00,
                'discount_amount' => 0.00,
                'student_discount_amount' => 3.70, // 10% student discount!
                'delivery_fee' => 15.00,
                'service_fee' => 0.00,
                'total_amount' => 48.30,
                'platform_commission_amount' => 3.70,
                'address' => 'عمارة 14، الحي الثاني، بجوار جامعة برج العرب التكنولوجية',
                'latitude' => 30.9150,
                'longitude' => 29.6150,
                'customer_notes' => 'الرجاء الاتصال عند الوصول أمام بوابة الجامعة.',
            ]
        );

        OrderItem::firstOrCreate(
            ['order_id' => $order->id, 'name' => 'ساندوتش فلافل إكسترا محشية'],
            [
                'menu_item_id' => $itemFalafel->id,
                'unit_price' => 12.00,
                'quantity' => 1,
                'total_price' => 12.00,
            ]
        );

        OrderItem::firstOrCreate(
            ['order_id' => $order->id, 'name' => 'طبق فول بالزيت الحار والليمون'],
            [
                'menu_item_id' => $itemFoul->id,
                'unit_price' => 25.00,
                'quantity' => 1,
                'total_price' => 25.00,
            ]
        );

        OrderStatusHistory::firstOrCreate(
            ['order_id' => $order->id, 'status' => 'PENDING'],
            ['notes' => 'تم إنشاء الطلب بنجاح وهو في انتظار تأكيد المطعم.', 'changed_by_user_id' => $customerUser->id]
        );

        OrderStatusHistory::firstOrCreate(
            ['order_id' => $order->id, 'status' => 'OUT_FOR_DELIVERY'],
            ['notes' => 'الكابتن محمود عادل استلم الطلب وهو في الطريق للعنوان.', 'changed_by_user_id' => $driverUser->id]
        );

        // 8. Import Data from provided SQL dumps (users, restaurants, categories, food items)
        $this->call(SqlDumpFilesSeeder::class);
    }
}
