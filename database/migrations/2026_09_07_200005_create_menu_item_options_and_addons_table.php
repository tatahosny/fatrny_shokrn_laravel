<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_item_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
            $table->string('name'); // e.g. الحجم (Size), نوع الخبز (Bread Type)
            $table->boolean('is_required')->default(false);
            $table->timestamps();
        });

        Schema::create('menu_item_option_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_item_option_id')->constrained('menu_item_options')->cascadeOnDelete();
            $table->string('name'); // e.g. صغير (Small), كبير (Large)
            $table->decimal('price', 10, 2)->default(0.00); // Additional price
            $table->timestamps();
        });

        Schema::create('menu_item_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
            $table->string('name'); // e.g. جبنة إضافية (Extra Cheese), صوص تومية
            $table->decimal('price', 10, 2)->default(0.00);
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_item_addons');
        Schema::dropIfExists('menu_item_option_values');
        Schema::dropIfExists('menu_item_options');
    }
};
