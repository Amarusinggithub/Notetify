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
        Schema::table('user_note', function (Blueprint $table) {
            $table->uuid('notebook_id')->nullable()->after('note_id');

            $table->foreign('notebook_id')
                  ->references('id')->on('notebooks')
                  ->nullOnDelete();

            $table->index(['user_id', 'notebook_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_note', function (Blueprint $table) {
            $table->dropForeign(['notebook_id']);
            $table->dropIndex(['user_id', 'notebook_id']);
            $table->dropColumn('notebook_id');
        });
    }
};
