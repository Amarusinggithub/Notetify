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
        Schema::create('user_notebook', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->foreignId('notebook_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->boolean('is_favorited')->default(false);
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_trashed')->default(false);

            $table->timestamp('favorited_at')->nullable();
            $table->timestamp('pinned_at')->nullable();
            $table->timestamp('trashed_at')->nullable();


                $table->unsignedInteger('order')->nullable();

                  $table->unique(['user_id','notebook_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_notebook');
    }
};
