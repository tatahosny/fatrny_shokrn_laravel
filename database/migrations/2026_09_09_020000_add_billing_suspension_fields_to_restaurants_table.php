<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->timestamp('billing_suspended_at')->nullable()->after('payment_due_date');
            $table->string('suspension_reason')->nullable()->after('billing_suspended_at');
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn(['billing_suspended_at', 'suspension_reason']);
        });
    }
};
