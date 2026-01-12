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
        Schema::table('user_note', function (Blueprint $table) {
            // Space relation
            $table->uuid('space_id')->nullable()->after('notebook_id');
            $table->foreign('space_id')
                  ->references('id')->on('spaces')
                  ->nullOnDelete();

            // Pinned flags and timestamps
            $table->boolean('is_pinned_to_home')->default(false)->after('space_id');
            $table->timestamp('pinned_to_home_at')->nullable()->after('is_pinned_to_home');

            $table->boolean('is_pinned_to_notebook')->default(false)->after('pinned_to_home_at');
            $table->timestamp('pinned_to_notebook_at')->nullable()->after('is_pinned_to_notebook');

            $table->boolean('is_pinned_to_space')->default(false)->after('pinned_to_notebook_at');
            $table->timestamp('pinned_to_space_at')->nullable()->after('is_pinned_to_space');

            // Added timestamps
            $table->timestamp('added_to_notebook_at')->nullable()->after('pinned_to_space_at');
            $table->timestamp('added_to_space_at')->nullable()->after('added_to_notebook_at');

            // Indexes
            $table->index(['user_id', 'space_id']);
            $table->index(['user_id', 'is_pinned_to_home']);
            $table->index(['user_id', 'is_pinned_to_notebook']);
            $table->index(['user_id', 'is_pinned_to_space']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_note', function (Blueprint $table) {
            $table->dropForeign(['space_id']);
            $table->dropIndex(['user_id', 'space_id']);
            $table->dropIndex(['user_id', 'is_pinned_to_home']);
            $table->dropIndex(['user_id', 'is_pinned_to_notebook']);
            $table->dropIndex(['user_id', 'is_pinned_to_space']);

            $table->dropColumn([
                'space_id',
                'is_pinned_to_home',
                'pinned_to_home_at',
                'is_pinned_to_notebook',
                'pinned_to_notebook_at',
                'is_pinned_to_space',
                'pinned_to_space_at',
                'added_to_notebook_at',
                'added_to_space_at',
            ]);
        });
    }
};
