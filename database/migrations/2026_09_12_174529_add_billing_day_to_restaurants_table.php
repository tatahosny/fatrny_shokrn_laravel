<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            // Day-of-month (1–28) on which the monthly invoice is auto-generated.
            // Defaults to 1 (1st of every month).
            $table->unsignedTinyInteger('billing_day')->default(1)->after('billing_cycle');
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn('billing_day');
        });
    }
};
