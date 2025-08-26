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
        Schema::create('note_shares', function (Blueprint $table) {
$table->uuid('id')->primary();


           $table->uuid('note_id');
        $table->uuid('shared_by_user_id');
                $table->uuid('shared_with_user_id');


         $table->foreign('note_id')
              ->references('id')->on('notes')
              ->cascadeOnDelete();

        $table->foreign('shared_with_user_id')
              ->references('id')->on('users')
              ->cascadeOnDelete();

               $table->foreign('shared_by_user_id')
              ->references('id')->on('users')
              ->cascadeOnDelete();

    $table->enum('permission', ['view', 'comment', 'edit'])->default('view');

    $table->timestamp('expires_at')->nullable();

    $table->boolean('accepted')->default(false);
            $table->timestamps();


            $table->index('note_id');
            $table->index('shared_by_user_id');
            $table->index('shared_with_user_id');
            $table->index('accepted');
            $table->index('expires_at');
            $table->index(['note_id', 'shared_with_user_id']);
            $table->index(['shared_with_user_id', 'accepted']);
            $table->index(['expires_at', 'accepted']);

            $table->unique(['note_id', 'shared_with_user_id']);
        });



    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('note_shares');
    }
};
