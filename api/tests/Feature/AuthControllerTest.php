<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        $response = $this->postJson('/api/auth/register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id',
                     'first_name',
                     'last_name',
                     'email',
                     'created_at',
                     'updated_at',
                 ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
        ]);
    }

    public function test_registration_requires_fields()
    {
        $response = $this->postJson('/api/auth/register', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'password']);
    }


    public function test_authentication_required_fields(){
        $response= $this->postJson('/api/auth/login', []);
        $response-> assertStatus (422)
                    ->assertJsonValidationErrors(['email', 'password'] );
    }


    public function test_user_cannot_login_with_incorrect_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('correct-password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Invalid login credentials!']);
        $this->assertGuest();
    }


    public function test_user_can_login_with_correct_credentials()
    {
        $password = 'correct-password';
        $user = User::factory()->create([
            'password' => Hash::make($password),
        ]);

        $response = $this->post('/api/auth/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'id',
                     'first_name',
                     'last_name',
                     'email',
                     'created_at',
                     'updated_at',
                 ]);
        $this->assertAuthenticatedAs($user);
    }



    

}
