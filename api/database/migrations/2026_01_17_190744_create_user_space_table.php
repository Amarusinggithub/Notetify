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
        Schema::create('user_space', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('space_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_pinned_to_home')->default(false);
            $table->timestamp('pinned_to_home_at')->nullable();
            $table->boolean('is_trashed')->default(false);
            $table->timestamp('trashed_at')->nullable();
            $table->boolean('is_default')->default(false);
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['space_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_space');
    }
};
