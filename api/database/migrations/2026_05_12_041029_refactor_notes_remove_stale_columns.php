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
            $table->dropForeign(['notebook_id']);
            $table->dropColumn(['notebook_id', 'is_pinned_to_notebook', 'pinned_to_notebook_at', 'order']);
        });
    }

    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->foreignUuid('notebook_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_pinned_to_notebook')->default(false);
            $table->timestamp('pinned_to_notebook_at')->nullable();
            $table->integer('order')->default(0);
        });
    }
};
