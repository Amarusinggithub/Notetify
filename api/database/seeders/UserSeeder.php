<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default admin/test user
        User::factory()->create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'timezone' => 'UTC',
            'locale' => 'en',
            'is_active' => true,
        ]);

        // Create additional random users
        User::factory(10)->create();

        // Create a few inactive users
        User::factory(2)->inactive()->create();
    }
}
