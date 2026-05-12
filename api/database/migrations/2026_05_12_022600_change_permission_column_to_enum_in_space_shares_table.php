<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE space_shares ADD CONSTRAINT space_shares_permission_check CHECK (permission IN ('view', 'comment', 'edit'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE space_shares DROP CONSTRAINT space_shares_permission_check');
    }
};
