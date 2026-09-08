<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_drivers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('restaurant_id')->constrained('restaurants')->cascadeOnDelete();
            $table->string('name');
            $table->string('phone');
            $table->string('profile_image')->nullable();
            $table->string('vehicle_type')->default('MOTORCYCLE'); // MOTORCYCLE, BICYCLE, CAR, SCOOTER
            $table->string('vehicle_plate')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('availability_status')->default('AVAILABLE')->index(); // AVAILABLE, BUSY, OFFLINE
            $table->decimal('current_latitude', 10, 7)->nullable();
            $table->decimal('current_longitude', 10, 7)->nullable();
            $table->timestamps();

            $table->index(['restaurant_id', 'is_active', 'availability_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_drivers');
    }
};
