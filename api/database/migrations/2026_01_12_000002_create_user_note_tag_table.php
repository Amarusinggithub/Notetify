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
        Schema::create('user_note_tag', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_note_id');
            $table->uuid('tag_id');

            $table->foreign('user_note_id')
                  ->references('id')->on('user_note')
                  ->cascadeOnDelete();

            $table->foreign('tag_id')
                  ->references('id')->on('tags')
                  ->cascadeOnDelete();

            $table->unsignedInteger('order')->nullable();

            $table->unique(['user_note_id', 'tag_id']);
            $table->timestamps();

            $table->index(['user_note_id', 'tag_id']);
            $table->index('tag_id');
            $table->index('user_note_id');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_note_tag');
    }
};
