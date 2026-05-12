<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['user_note', 'user_notebook'] as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->renameColumn('is_pinned_to_home', 'is_pinned_in_home');
                $table->renameColumn('pinned_to_home_at', 'pinned_in_home_at');
            });
        }
    }

    public function down(): void
    {
        foreach (['user_note', 'user_notebook'] as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->renameColumn('is_pinned_in_home', 'is_pinned_to_home');
                $table->renameColumn('pinned_in_home_at', 'pinned_to_home_at');
            });
        }
    }
};
