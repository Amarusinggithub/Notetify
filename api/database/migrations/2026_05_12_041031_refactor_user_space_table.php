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
        Schema::table('user_space', function (Blueprint $table) {
            $table->boolean('is_owner')->default(false)->after('user_id');
            $table->enum('permission', ['view', 'comment', 'edit'])->nullable()->after('is_owner');
            $table->unsignedInteger('order')->nullable()->after('is_default');

            $table->dropColumn(['is_pinned_to_home', 'pinned_to_home_at']);
        });
    }

    public function down(): void
    {
        Schema::table('user_space', function (Blueprint $table) {
            $table->dropColumn(['is_owner', 'permission', 'order']);

            $table->boolean('is_pinned_to_home')->default(false);
            $table->timestamp('pinned_to_home_at')->nullable();
        });
    }
};
