<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:setup-accounts', function () {
    // 1. Super Admin Account
    $admin = \App\Models\User::updateOrCreate(
        ['email' => 'admin@fatrna.com'],
        [
            'name' => 'المدير العام (Admin)',
            'phone' => '01011112222',
            'password' => bcrypt('admin123456'),
            'role' => 'SUPER_ADMIN',
            'is_active' => true,
        ]
    );

    // 2. Laghwasa Restaurant Owner Account
    $laghwasaRestaurant = \App\Models\Restaurant::where('slug', 'laghwasa')->orWhere('name', 'like', '%لغوص%')->first();
    
    $laghwasaOwner = \App\Models\User::updateOrCreate(
        ['email' => 'owner@laghwasa.com'],
        [
            'name' => 'إدارة مطعم لغوصة',
            'phone' => '01555973626',
            'password' => bcrypt('laghwasa123'),
            'role' => 'RESTAURANT_OWNER',
            'is_active' => true,
        ]
    );

    if ($laghwasaRestaurant) {
        \App\Models\RestaurantStaff::updateOrCreate(
            [
                'restaurant_id' => $laghwasaRestaurant->id,
                'user_id' => $laghwasaOwner->id,
            ],
            [
                'role' => 'MANAGER',
                'is_active' => true,
            ]
        );
    }

    $this->info("Accounts configured successfully!");
    $this->line("Admin: admin@fatrna.com / admin123456");
    $this->line("Laghwasa Owner: owner@laghwasa.com / laghwasa123");
});
