<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_notebook', function (Blueprint $table) {
            if (Schema::hasColumn('user_notebook', 'user_id')) {
                try { $table->dropUnique(['user_id']); } catch (\Throwable) {}
            }
            if (Schema::hasColumn('user_notebook', 'notebook_id')) {
                try { $table->dropUnique(['notebook_id']); } catch (\Throwable) {}
            }

            $staleColumns = array_filter(
                ['is_pinned', 'pinned_at', 'is_favorited', 'favorited_at'],
                fn ($col) => Schema::hasColumn('user_notebook', $col)
            );

            if ($staleColumns) {
                foreach ([
                    'user_note_user_id_is_pinned_index',
                    'user_notebook_user_id_is_pinned_index',
                    'user_note_user_id_is_favorited_index',
                    'user_notebook_user_id_is_favorited_index',
                ] as $idx) {
                    try { DB::statement("DROP INDEX IF EXISTS \"{$idx}\""); } catch (\Throwable) {}
                }
                $table->dropColumn(array_values($staleColumns));
            }
        });

        Schema::table('user_notebook', function (Blueprint $table) {
            if (!Schema::hasColumn('user_notebook', 'is_owner')) {
                $table->boolean('is_owner')->default(false)->after('notebook_id');
            }
            if (!Schema::hasColumn('user_notebook', 'is_pinned_in_space')) {
                $table->boolean('is_pinned_in_space')->default(false)->after('is_owner');
            }
            if (!Schema::hasColumn('user_notebook', 'pinned_in_space_at')) {
                $table->timestamp('pinned_in_space_at')->nullable()->after('is_pinned_in_space');
            }
            if (!Schema::hasColumn('user_notebook', 'is_pinned_to_home') && !Schema::hasColumn('user_notebook', 'is_pinned_in_home')) {
                $table->boolean('is_pinned_to_home')->default(false)->after('pinned_in_space_at');
            }
            if (!Schema::hasColumn('user_notebook', 'pinned_to_home_at') && !Schema::hasColumn('user_notebook', 'pinned_in_home_at')) {
                $table->timestamp('pinned_to_home_at')->nullable()->after('is_pinned_to_home');
            }
            if (!Schema::hasColumn('user_notebook', 'is_default')) {
                $table->boolean('is_default')->default(false)->after('pinned_to_home_at');
            }

            try { $table->index(['user_id', 'is_pinned_in_space']); } catch (\Throwable) {}
            try { $table->index(['user_id', 'is_pinned_to_home']); } catch (\Throwable) {}
        });
    }

    public function down(): void
    {
        Schema::table('user_notebook', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'is_pinned_in_space']);
            $table->dropIndex(['user_id', 'is_pinned_to_home']);
            $table->dropColumn(['is_owner', 'is_pinned_in_space', 'pinned_in_space_at', 'is_pinned_to_home', 'pinned_to_home_at', 'is_default']);
        });

        Schema::table('user_notebook', function (Blueprint $table) {
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('pinned_at')->nullable();
            $table->boolean('is_favorited')->default(false);
            $table->timestamp('favorited_at')->nullable();

            $table->unique('user_id');
            $table->unique('notebook_id');
            $table->index(['user_id', 'is_pinned']);
            $table->index(['user_id', 'is_favorited']);
        });
    }
};
