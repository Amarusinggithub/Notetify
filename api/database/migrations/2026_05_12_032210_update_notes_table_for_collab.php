<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->uuid('created_by_user_id')->nullable()->after('id');
            $table->foreign('created_by_user_id')
                  ->references('id')->on('users')
                  ->nullOnDelete();

            $table->binary('ydoc_state')->nullable()->after('content');
        });

        // Null out any rows with non-JSON content before casting the column type
        DB::statement("UPDATE notes SET content = NULL WHERE content IS NOT NULL AND content !~ '^[\s]*[\[{]'");
        DB::statement('ALTER TABLE notes ALTER COLUMN content TYPE jsonb USING content::jsonb');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE notes ALTER COLUMN content TYPE text USING content::text');

        Schema::table('notes', function (Blueprint $table) {
            $table->dropForeign(['created_by_user_id']);
            $table->dropColumn(['created_by_user_id', 'ydoc_state']);
        });
    }
};
