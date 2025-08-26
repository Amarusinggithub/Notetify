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
        Schema::create('note_tag', function (Blueprint $table) {
                $table->uuid('id')->primary();
   $table->uuid('note_id');
        $table->uuid('tag_id');

         $table->foreign('note_id')
              ->references('id')->on('notes')
              ->cascadeOnDelete();

        $table->foreign('tag_id')
              ->references('id')->on('tags')
              ->cascadeOnDelete();


                $table->unsignedInteger('order')->nullable();

                  $table->unique(['note_id','tag_id']);
            $table->timestamps();


                          $table->index(['note_id','tag_id']);

                          $table->index('tag_id');
                          $table->index('note_id');





        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('note_tag');
    }
};
