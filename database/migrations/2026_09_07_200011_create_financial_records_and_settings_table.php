<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained('restaurants')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('type'); // ORDER_COMMISSION, SUBSCRIPTION_FEE, ADJUSTMENT, PAYOUT
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('PENDING'); // PENDING, COLLECTED, WAIVED, CANCELLED
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['restaurant_id', 'status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_records');
    }
};
