<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\MenuItemOption;
use App\Models\MenuItemOptionValue;
use App\Models\Restaurant;
use App\Models\RestaurantStaff;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SqlDumpFilesSeeder extends Seeder
{
    public function run(): void
    {
        $basePath = base_path();

        // 1. Users
        $usersFile = $basePath . '/users.sql';
        if (file_exists($usersFile)) {
            $usersSql = file_get_contents($usersFile);
            if (preg_match('/INSERT INTO `users`.*?VALUES\s*(.*?);/s', $usersSql, $matches)) {
                preg_match_all('/\((.*?)\)(?:,|$)/s', $matches[1], $rowMatches);
                foreach ($rowMatches[1] as $rowStr) {
                    $tokens = str_getcsv(trim($rowStr), ',', "'");
                    if (count($tokens) < 12) continue;
                    $name = trim($tokens[1]);
                    $email = trim($tokens[2]);
                    $rawRole = trim($tokens[4]);
                    $phone = trim($tokens[5]);
                    if ($phone === 'NULL' || empty($phone)) $phone = null;
                    $password = trim($tokens[11]);
                    $isActive = (int)($tokens[8] ?? 1) === 1;

                    $roleMap = [
                        'admin'     => 'ADMIN',
                        'support'   => 'SUPER_ADMIN',
                        'operator'  => 'PLATFORM_STAFF',
                        'inspector' => 'PLATFORM_STAFF',
                    ];
                    $mappedRole = $roleMap[strtolower($rawRole)] ?? 'PLATFORM_STAFF';

                    $user = User::updateOrCreate(
                        ['email' => $email],
                        [
                            'name' => $name,
                            'phone' => $phone,
                            'password' => $password,
                            'role' => $mappedRole,
                            'is_active' => $isActive,
                            'email_verified_at' => now(),
                        ]
                    );

                    $spatieRole = Role::where('name', $mappedRole)->first();
                    if ($spatieRole && !$user->hasRole($mappedRole)) {
                        $user->assignRole($spatieRole);
                    }
                }
            }
        }

        // 2. Restaurants
        $restaurantsFile = $basePath . '/restaurants.sql';
        $restaurantMap = [];
        if (file_exists($restaurantsFile)) {
            $restaurantsSql = file_get_contents($restaurantsFile);
            $lines = explode("\n", trim($restaurantsSql));
            foreach ($lines as $line) {
                if (!trim($line)) continue;
                if (preg_match('/values \((.*)\);/s', $line, $m)) {
                    $tokens = str_getcsv(trim($m[1]), ',', "'");
                    $oldId = trim($tokens[0]);
                    $name = trim($tokens[1]);
                    $image = trim($tokens[3]);
                    $phone = trim($tokens[4]);
                    $description = trim($tokens[5]);
                    $address = trim($tokens[6]);
                    $cleanSlug = ($oldId === 'rest-gareemat-akl') ? 'gareemat-akl' : 'laghwasa';

                    $restaurant = Restaurant::updateOrCreate(
                        ['slug' => $cleanSlug],
                        [
                            'name' => $name,
                            'slug' => $cleanSlug,
                            'logo' => $image,
                            'cover_image' => $image,
                            'phone' => $phone,
                            'whatsapp' => '2' . $phone,
                            'description' => $description,
                            'address' => $address,
                            'status' => 'ACTIVE',
                            'opening_time' => '10:00:00',
                            'closing_time' => '02:00:00',
                            'minimum_order_amount' => 50.00,
                            'delivery_fee' => 15.00,
                            'estimated_delivery_time' => '30-45 دقيقة',
                            'student_discount_percentage' => 10.00,
                            'commission_type' => 'PERCENTAGE',
                            'commission_percentage' => 10.00,
                        ]
                    );
                    $restaurantMap[$oldId] = $restaurant;

                    $ownerEmail = ($cleanSlug === 'gareemat-akl') ? 'owner@gareemat-akl.com' : 'owner@laghwasa.com';
                    $ownerUser = User::firstOrCreate(
                        ['email' => $ownerEmail],
                        [
                            'name' => 'مالك مطعم ' . $restaurant->name,
                            'phone' => $phone,
                            'password' => Hash::make('password123'),
                            'role' => 'RESTAURANT_OWNER',
                            'is_active' => true,
                            'email_verified_at' => now(),
                        ]
                    );
                    $ownerRole = Role::where('name', 'RESTAURANT_OWNER')->first();
                    if ($ownerRole && !$ownerUser->hasRole('RESTAURANT_OWNER')) {
                        $ownerUser->assignRole($ownerRole);
                    }

                    RestaurantStaff::firstOrCreate(
                        ['user_id' => $ownerUser->id, 'restaurant_id' => $restaurant->id],
                        ['role' => 'MANAGER', 'is_active' => true]
                    );
                }
            }
        }

        // 3. Categories
        $categoriesFile = $basePath . '/categories.sql';
        $categoryMap = [];
        if (file_exists($categoriesFile)) {
            $categoriesSql = file_get_contents($categoriesFile);
            $lines = explode("\n", trim($categoriesSql));
            $catIndex = 1;
            foreach ($lines as $line) {
                if (!trim($line)) continue;
                if (preg_match('/values \((.*)\);/s', $line, $m)) {
                    $tokens = str_getcsv(trim($m[1]), ',', "'");
                    $oldCatId = trim($tokens[0]);
                    $catName = trim($tokens[1]);
                    $catSlug = trim($tokens[2]);
                    $catImage = trim($tokens[4]);

                    $targetRestaurant = str_starts_with($oldCatId, 'cat-crime-')
                        ? ($restaurantMap['rest-gareemat-akl'] ?? Restaurant::where('slug', 'gareemat-akl')->first())
                        : ($restaurantMap['rest-1788726611709'] ?? Restaurant::where('slug', 'laghwasa')->first());

                    if (!$targetRestaurant) {
                        $targetRestaurant = Restaurant::first();
                    }

                    $category = Category::updateOrCreate(
                        ['restaurant_id' => $targetRestaurant->id, 'slug' => $catSlug],
                        ['name' => $catName, 'image' => $catImage, 'is_active' => true, 'sort_order' => $catIndex++]
                    );
                    $categoryMap[$oldCatId] = $category;
                }
            }
        }

        // 4. Food Items
        $foodFile = $basePath . '/food_items.sql';
        if (file_exists($foodFile)) {
            $foodSql = file_get_contents($foodFile);
            $lines = explode("\n", trim($foodSql));
            $foodIndex = 1;
            foreach ($lines as $line) {
                if (!trim($line)) continue;
                if (preg_match('/insert into "food_items" \((.*?)\) overriding system value values \((.*)\);/s', $line, $m)) {
                    $valStr = $m[2];
                    if (preg_match("/'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(true|false),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(null|'\[.*?\]')/su", $valStr, $vm)) {
                        $oldCatId = $vm[2];
                        $catName = $vm[3];
                        $foodName = $vm[4];
                        $foodDesc = $vm[5];
                        $price = (float)$vm[6];
                        $image = $vm[7];
                        $available = ($vm[8] === 'true');
                        $oldRestId = $vm[10];
                        $variantsRaw = $vm[12];

                        $restaurant = $restaurantMap[$oldRestId] ?? Restaurant::where('slug', ($oldRestId === 'rest-gareemat-akl' ? 'gareemat-akl' : 'laghwasa'))->first();
                        if (!$restaurant) continue;

                        $category = $categoryMap[$oldCatId] ?? Category::firstOrCreate(
                            ['restaurant_id' => $restaurant->id, 'name' => $catName],
                            ['slug' => \Illuminate\Support\Str::slug($catName), 'is_active' => true]
                        );

                        $menuItem = MenuItem::updateOrCreate(
                            ['restaurant_id' => $restaurant->id, 'name' => $foodName],
                            [
                                'category_id' => $category->id,
                                'description' => $foodDesc,
                                'price' => $price,
                                'image' => $image,
                                'is_available' => $available,
                                'is_featured' => ($foodIndex <= 6),
                                'preparation_time' => 15,
                                'sort_order' => $foodIndex++,
                            ]
                        );

                        if ($variantsRaw !== 'null') {
                            $variantsJson = trim($variantsRaw, "'");
                            $variantsList = json_decode($variantsJson, true);
                            if (is_array($variantsList) && count($variantsList) > 0) {
                                $hasKilo = false;
                                $hasBread = false;
                                foreach ($variantsList as $v) {
                                    if (str_contains($v['name'], 'كيلو')) $hasKilo = true;
                                    if (str_contains($v['name'], 'عيش') || str_contains($v['name'], 'فينو') || str_contains($v['name'], 'بلدي') || str_contains($v['name'], 'ملفوف')) $hasBread = true;
                                }
                                $optionGroupName = $hasKilo ? 'الحجم / الوزن' : ($hasBread ? 'نوع الخبز' : 'نوع الطلب');

                                $option = MenuItemOption::updateOrCreate(
                                    ['menu_item_id' => $menuItem->id, 'name' => $optionGroupName],
                                    ['is_required' => true]
                                );
                                MenuItemOptionValue::where('menu_item_option_id', $option->id)->delete();

                                $basePrice = $menuItem->price;
                                foreach ($variantsList as $varItem) {
                                    $additionalPrice = max(0.00, (float)$varItem['price'] - $basePrice);
                                    MenuItemOptionValue::create([
                                        'menu_item_option_id' => $option->id,
                                        'name' => $varItem['name'],
                                        'price' => $additionalPrice,
                                    ]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
