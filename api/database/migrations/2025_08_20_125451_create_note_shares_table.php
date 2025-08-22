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
        Schema::create('note_shares', function (Blueprint $table) {
            $table->id();
    $table->foreignId('note_id')
          ->constrained()
          ->cascadeOnDelete();

    $table->foreignId('shared_by_user_id')
          ->constrained('users')
          ->cascadeOnDelete();

    $table->foreignId('shared_with_user_id')
          ->constrained('users')
          ->cascadeOnDelete();

    $table->enum('permission', ['view', 'comment', 'edit'])->default('view');

    $table->timestamp('expires_at')->nullable();

    $table->boolean('accepted')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('note_shares');
    }
};
