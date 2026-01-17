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
        Schema::create('space_shares', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('space_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('shared_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('shared_with_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('permission')->default('view');
            $table->timestamp('expires_at')->nullable();
            $table->boolean('accepted')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('space_shares');
    }
};
