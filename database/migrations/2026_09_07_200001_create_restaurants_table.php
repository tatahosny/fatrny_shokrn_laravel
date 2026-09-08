<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->string('cover_image')->nullable();
            $table->text('description')->nullable();
            $table->string('phone')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('email')->nullable();
            $table->string('address');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('status')->default('ACTIVE')->index(); // ACTIVE, INACTIVE, SUSPENDED, PENDING
            $table->time('opening_time')->default('08:00:00');
            $table->time('closing_time')->default('23:00:00');
            $table->decimal('minimum_order_amount', 10, 2)->default(0.00);
            $table->decimal('delivery_fee', 10, 2)->default(15.00);
            $table->string('estimated_delivery_time')->default('30-45 دقيقة');
            $table->decimal('student_discount_percentage', 5, 2)->default(0.00);
            $table->string('commission_type')->default('PERCENTAGE'); // PERCENTAGE, FIXED, HYBRID
            $table->decimal('commission_percentage', 5, 2)->default(10.00);
            $table->decimal('monthly_subscription_fee', 10, 2)->default(0.00);
            $table->string('billing_cycle')->default('MONTHLY');
            $table->date('payment_due_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
