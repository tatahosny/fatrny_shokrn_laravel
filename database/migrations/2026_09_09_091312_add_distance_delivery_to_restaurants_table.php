<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->decimal('delivery_fee_per_km', 8, 2)->default(5.00)->after('delivery_fee');
            $table->decimal('delivery_base_fee', 8, 2)->default(10.00)->after('delivery_fee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn(['delivery_fee_per_km', 'delivery_base_fee']);
        });
    }
};
