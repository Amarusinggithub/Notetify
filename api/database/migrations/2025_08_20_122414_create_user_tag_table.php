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
        Schema::create('user_tag', function (Blueprint $table) {
$table->uuid('id')->primary();
            $table->uuid('user_id');
        $table->uuid('tag_id');

         $table->foreign('user_id')
              ->references('id')->on('users')
              ->cascadeOnDelete();
             $table->softDeletes();

        $table->foreign('tag_id')
              ->references('id')->on('tags')
              ->cascadeOnDelete();

            $table->unique(['user_id', 'tag_id']);
            $table->unsignedInteger('order')->nullable();


            $table->timestamps();


                   $table->index(['user_id','tag_id']);
                   $table->index('tag_id');
                   $table->index('user_id');





        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_tag');
    }
};
