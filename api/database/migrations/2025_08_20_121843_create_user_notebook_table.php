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
        Schema::create('user_notebook', function (Blueprint $table) {
$table->uuid('id')->primary();
           $table->uuid('user_id');
        $table->uuid('notebook_id');

         $table->foreign('notebook_id')
              ->references('id')->on('notebooks')
              ->cascadeOnDelete();

        $table->foreign('user_id')
              ->references('id')->on('users')
              ->cascadeOnDelete();

            $table->boolean('is_favorited')->default(false);
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_trashed')->default(false);

            $table->timestamp('favorited_at')->nullable();
            $table->timestamp('pinned_at')->nullable();
            $table->timestamp('trashed_at')->nullable();
                         $table->softDeletes();



                $table->unsignedInteger('order')->nullable();

                  $table->unique(['user_id','notebook_id']);
            $table->timestamps();


$table->index(['user_id', 'is_pinned']);
$table->index(['user_id', 'is_favorited']);
$table->index(['user_id', 'is_trashed']);

                  $table->unique('user_id');
                  $table->unique('notebook_id');
              $table->index(['user_id','notebook_id']);





        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_notebook');
    }
};
