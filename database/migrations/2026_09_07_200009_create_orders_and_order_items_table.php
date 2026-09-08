<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('restaurant_id')->constrained('restaurants')->cascadeOnDelete();
            $table->foreignId('assigned_delivery_id')->nullable()->constrained('delivery_drivers')->nullOnDelete();
            $table->string('status')->default('PENDING')->index(); // PENDING, CONFIRMED, PREPARING, READY_FOR_PICKUP, ASSIGNED_TO_DRIVER, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REJECTED, REFUNDED
            $table->string('payment_status')->default('PENDING'); // PENDING, PAID, FAILED, REFUNDED
            $table->string('payment_method')->default('CASH_ON_DELIVERY'); // CASH_ON_DELIVERY, ONLINE_CARD, WALLET
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0.00);
            $table->decimal('student_discount_amount', 10, 2)->default(0.00);
            $table->decimal('delivery_fee', 10, 2)->default(0.00);
            $table->decimal('service_fee', 10, 2)->default(0.00);
            $table->decimal('total_amount', 10, 2);
            $table->decimal('platform_commission_amount', 10, 2)->default(0.00);
            $table->text('address');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('customer_notes')->nullable();
            $table->text('restaurant_notes')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['restaurant_id', 'status', 'created_at']);
            $table->index(['customer_id', 'created_at']);
            $table->index(['assigned_delivery_id', 'status']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('menu_item_id')->nullable()->constrained('menu_items')->nullOnDelete();
            $table->string('name');
            $table->decimal('unit_price', 10, 2);
            $table->integer('quantity');
            $table->decimal('total_price', 10, 2);
            $table->json('selected_options')->nullable(); // [{option_name: 'الحجم', value_name: 'كبير', price: 10}]
            $table->json('selected_addons')->nullable(); // [{name: 'جبنة إضافية', price: 5}]
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
