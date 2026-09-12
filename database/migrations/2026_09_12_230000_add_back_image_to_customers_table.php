<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // ظهر الكارنيه الجامعي (الوجه موجود بالفعل في university_id_card_image)
            $table->string('university_id_card_back_image')->nullable()->after('university_id_card_image');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('university_id_card_back_image');
        });
    }
};
