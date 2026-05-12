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
        Schema::table('notebooks', function (Blueprint $table) {
            $table->uuid('created_by_user_id')->nullable()->after('id');
            $table->foreign('created_by_user_id')
                  ->references('id')->on('users')
                  ->nullOnDelete();

            $table->dropColumn(['is_pinned_to_space', 'pinned_to_space_at', 'added_to_space_at', 'order']);
        });
    }

    public function down(): void
    {
        Schema::table('notebooks', function (Blueprint $table) {
            $table->dropForeign(['created_by_user_id']);
            $table->dropColumn('created_by_user_id');

            $table->boolean('is_pinned_to_space')->default(false);
            $table->timestamp('pinned_to_space_at')->nullable();
            $table->timestamp('added_to_space_at')->nullable();
            $table->integer('order')->default(0);
        });
    }
};
