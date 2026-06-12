<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Aligns the tags schema with the documented design (docs/ARCHITECTURE.md):
 * a Tag is the per-user entity itself (user_id, color, order). The legacy
 * `user_tag` pivot is retired — note tagging stays on `user_note_tag`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('user_tag');

        Schema::table('tags', function (Blueprint $table) {
            if (!Schema::hasColumn('tags', 'user_id')) {
                $table->uuid('user_id')->nullable()->after('id');
                $table->foreign('user_id')
                    ->references('id')->on('users')
                    ->cascadeOnDelete();
                $table->index('user_id');
            }
            if (!Schema::hasColumn('tags', 'color')) {
                $table->string('color')->nullable()->after('name');
            }
            if (!Schema::hasColumn('tags', 'order')) {
                $table->unsignedInteger('order')->nullable()->after('color');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id']);
            $table->dropColumn(['user_id', 'color', 'order']);
        });

        Schema::create('user_tag', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('tag_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('tag_id')->references('id')->on('tags')->cascadeOnDelete();
            $table->unique(['user_id', 'tag_id']);
            $table->unsignedInteger('order')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['user_id', 'tag_id']);
            $table->index('tag_id');
            $table->index('user_id');
        });
    }
};
