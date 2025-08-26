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
        Schema::create('notebook_note', function (Blueprint $table) {
$table->uuid('id')->primary();
            $table->uuid('note_id');
        $table->uuid('notebook_id');

         $table->foreign('note_id')
              ->references('id')->on('notes')
              ->cascadeOnDelete();

        $table->foreign('notebook_id')
              ->references('id')->on('notebooks')
              ->cascadeOnDelete();


            $table->unsignedInteger('order')->nullable();

            $table->unique(['note_id','notebook_id']);

            $table->timestamps();

              $table->index(['notebook_id','note_id']);

                            $table->index('note_id');
              $table->index('notebook_id');


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notebook_note');
    }
};
