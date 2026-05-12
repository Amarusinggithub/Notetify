<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_note', function (Blueprint $table) {
            // Rename _to_ → _in_ to match contextual pin semantics
            $table->renameColumn('is_pinned_to_notebook', 'is_pinned_in_notebook');
            $table->renameColumn('pinned_to_notebook_at', 'pinned_in_notebook_at');
            $table->renameColumn('is_pinned_to_space', 'is_pinned_in_space');
            $table->renameColumn('pinned_to_space_at', 'pinned_in_space_at');
        });

        Schema::table('user_note', function (Blueprint $table) {
            $table->boolean('is_owner')->default(false)->after('notebook_id');

            // Drop stale columns
            $table->dropColumn(['added_to_notebook_at', 'added_to_space_at']);

            if (Schema::hasColumn('user_note', 'is_pinned')) {
                $table->dropColumn('is_pinned');
            }
            if (Schema::hasColumn('user_note', 'pinned_at')) {
                $table->dropColumn('pinned_at');
            }
            if (Schema::hasColumn('user_note', 'is_favorited')) {
                $table->dropColumn('is_favorited');
            }
            if (Schema::hasColumn('user_note', 'favorited_at')) {
                $table->dropColumn('favorited_at');
            }
            if (Schema::hasColumn('user_note', 'is_favorite')) {
                $table->dropColumn('is_favorite');
            }
            if (Schema::hasColumn('user_note', 'favorite_at')) {
                $table->dropColumn('favorite_at');
            }

            $table->index(['user_id', 'is_pinned_in_notebook']);
            $table->index(['user_id', 'is_pinned_in_space']);
        });
    }

    public function down(): void
    {
        Schema::table('user_note', function (Blueprint $table) {
            $table->renameColumn('is_pinned_in_notebook', 'is_pinned_to_notebook');
            $table->renameColumn('pinned_in_notebook_at', 'pinned_to_notebook_at');
            $table->renameColumn('is_pinned_in_space', 'is_pinned_to_space');
            $table->renameColumn('pinned_in_space_at', 'pinned_to_space_at');
        });

        Schema::table('user_note', function (Blueprint $table) {
            $table->dropColumn('is_owner');
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('pinned_at')->nullable();
            $table->boolean('is_favorited')->default(false);
            $table->timestamp('favorited_at')->nullable();
            $table->timestamp('added_to_notebook_at')->nullable();
            $table->timestamp('added_to_space_at')->nullable();

            $table->dropIndex(['user_id', 'is_pinned_in_notebook']);
            $table->dropIndex(['user_id', 'is_pinned_in_space']);
        });
    }
};
