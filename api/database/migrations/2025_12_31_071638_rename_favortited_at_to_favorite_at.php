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
        // rename for UserNote table

        Schema::table('user_note', function (Blueprint $table) {
            $table->renameColumn('favorited_at', 'favorite_at');

        });
        // rename for UserNotebook table

        Schema::table('user_notebook', function (Blueprint $table) {
            $table->renameColumn('favorited_at', 'favorite_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    // Reverse the rename for UserNote table

        Schema::table('user_note', function (Blueprint $table) {
            $table->renameColumn( 'favorite_at','favorited_at');

        });
       // Reverse the rename for UserNotebook table

        Schema::table('user_notebook', function (Blueprint $table) {
            $table->renameColumn( 'favorite_at','favorited_at');
        });
    }
};
