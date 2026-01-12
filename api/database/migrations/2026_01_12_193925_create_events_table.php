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
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();
            
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            
            $table->boolean('is_all_day')->default(false);
            
            // Repeat frequency
            $table->enum('repeat', [
                'none', 
                'daily', 
                'weekly', 
                'monthly', 
                'yearly', 
                'custom'
            ])->default('none');

            // Reminder before event
            $table->enum('reminder', [
                'none',
                'at_time',
                '5_min_before',
                '10_min_before',
                '15_min_before',
                '30_min_before',
                '1_hour_before',
                '2_hours_before',
                '1_day_before',
                '2_days_before',
                '1_week_before'
            ])->default('none');

            // Store timezone as string (e.g., 'America/New_York', 'UTC')
            // Using string is standard practice to support all IANA timezones
            $table->string('timezone')->default('UTC');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};