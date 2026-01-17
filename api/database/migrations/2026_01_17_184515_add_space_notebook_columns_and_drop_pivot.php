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
        // Add columns to notebooks table
        Schema::table('notebooks', function (Blueprint $table) {
            $table->foreignUuid('space_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->boolean('is_pinned_to_space')->default(false)->after('name');
            $table->timestamp('pinned_to_space_at')->nullable()->after('is_pinned_to_space');
            $table->timestamp('added_to_space_at')->nullable()->after('pinned_to_space_at');
            $table->integer('order')->default(0)->after('added_to_space_at');
        });

        // Add columns to notes table
        Schema::table('notes', function (Blueprint $table) {
            $table->foreignUuid('notebook_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->boolean('is_pinned_to_notebook')->default(false)->after('content');
            $table->timestamp('pinned_to_notebook_at')->nullable()->after('is_pinned_to_notebook');
            $table->integer('order')->default(0)->after('pinned_to_notebook_at');
        });

        // Drop the pivot table (no longer needed)
        Schema::dropIfExists('space_notebook');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate the pivot table
        Schema::create('space_notebook', function (Blueprint $table) {
            $table->foreignUuid('space_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('notebook_id')->constrained()->cascadeOnDelete();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->primary(['space_id', 'notebook_id']);
        });

        // Remove columns from notes table
        Schema::table('notes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('notebook_id');
            $table->dropColumn(['is_pinned_to_notebook', 'pinned_to_notebook_at', 'order']);
        });

        // Remove columns from notebooks table
        Schema::table('notebooks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('space_id');
            $table->dropColumn(['is_pinned_to_space', 'pinned_to_space_at', 'added_to_space_at', 'order']);
        });
    }
};
