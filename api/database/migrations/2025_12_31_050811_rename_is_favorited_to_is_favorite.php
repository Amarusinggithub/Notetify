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
        // Rename column for UserNote table
        Schema::table('user_note', function (Blueprint $table) {
            $table->renameColumn('is_favorited', 'is_favorite');
        });

        // Rename column for UserNotebook table (assuming default table name)
        Schema::table('user_notebook', function (Blueprint $table) {
            $table->renameColumn('is_favorited', 'is_favorite');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
       // Reverse the rename for UserNote table
        Schema::table('user_note', function (Blueprint $table) {
            $table->renameColumn('is_favorite', 'is_favorited');
        });

        // Reverse the rename for UserNotebook table
        Schema::table('user_notebook', function (Blueprint $table) {
            $table->renameColumn('is_favorite', 'is_favorited');
        });
    }
};
