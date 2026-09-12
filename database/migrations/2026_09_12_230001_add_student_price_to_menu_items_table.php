<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            // سعر خاص للطلاب المعتمدين — لو null معناه مفيش خصم طلابي خاص بالأيتم ده
            $table->decimal('student_price', 10, 2)->nullable()->after('discount_price');
        });
    }

    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropColumn('student_price');
        });
    }
};
