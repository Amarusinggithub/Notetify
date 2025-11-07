<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LiveblocksAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorization_is_proxied_to_liveblocks(): void
    {
        config()->set('services.liveblocks.secret', 'sk_test_123');
        config()->set('services.liveblocks.base_uri', 'https://api.liveblocks.io');

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Http::fake([
            'https://api.liveblocks.io/v2/authorize-user' => Http::response(['token' => 'abc123'], 200),
        ]);

        $response = $this->postJson('/api/liveblocks/auth', ['room' => 'note-' . $user->id]);

        $response->assertOk()->assertJson(['token' => 'abc123']);

        Http::assertSent(function ($request) use ($user) {
            return $request['userId'] === $user->id
                && isset($request['permissions']['note-' . $user->id]);
        });
    }
}
