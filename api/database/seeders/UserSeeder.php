<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
 use Illuminate\Support\Facades\Hash;


class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default admin/test user
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'User',
                'password' => Hash::make('secure_password'),
                'timezone' => 'UTC',
                'locale' => 'en',
                'is_active' => true,
            ]
        );

        // Create users for sharing demo
        User::firstOrCreate(
            ['email' => 'alice@example.com'],
            [
                'first_name' => 'Alice',
                'last_name' => 'Smith',
                'password' => Hash::make('secure_password'),
                'timezone' => 'UTC',
                'locale' => 'en',
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'bob@example.com'],
            [
                'first_name' => 'Bob',
                'last_name' => 'Jones',
                'password' => Hash::make('secure_password'),
                'timezone' => 'UTC',
                'locale' => 'en',
                'is_active' => true,
            ]
        );

        // Create additional random users
        User::factory(10)->create();

        // Create a few inactive users
        User::factory(2)->inactive()->create();
    }
}
