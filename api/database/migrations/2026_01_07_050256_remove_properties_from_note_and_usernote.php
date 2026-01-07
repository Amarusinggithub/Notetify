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
        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn('title');
        });

        Schema::table('user_note', function (Blueprint $table) {
            // Drop indexes first to avoid SQLite errors

            $table->dropIndex('user_note_user_id_is_favorited_index');

            $table->dropColumn([ 'is_favorite']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->string('title')->nullable();
        });

        Schema::table('user_note', function (Blueprint $table) {
            $table->boolean('is_favorite')->default(false);

            $table->index(['user_id', 'is_favorite'], 'user_note_user_id_is_favorited_index');
        });
    }
};
