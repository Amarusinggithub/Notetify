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
        Schema::create('spaces', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->boolean('is_default')->default(false);
            $table->integer('order')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['user_id', 'is_default']);
        });

        // Pivot table: space_notebook
        Schema::create('space_notebook', function (Blueprint $table) {
            $table->foreignUuid('space_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('notebook_id')->constrained()->cascadeOnDelete();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->primary(['space_id', 'notebook_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('space_notebook');
        Schema::dropIfExists('spaces');
    }
};
