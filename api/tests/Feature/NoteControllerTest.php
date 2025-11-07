<?php

namespace Tests\Feature;

use App\Models\Note;
use App\Models\User;
use App\Models\UserNote;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NoteControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_fetch_notes_with_filters(): void
    {
        $user = User::factory()->create();
        $favorite = UserNote::factory()
            ->favorited()
            ->for($user, 'user')
            ->create();
        $favorite->note()->update(['title' => 'Favorite note']);

        UserNote::factory()
            ->count(2)
            ->for($user, 'user')
            ->create()
            ->each(fn (UserNote $note) => $note->note()->update(['title' => 'Other note']));

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/notes?search=Favorite&is_favorited=true');

        $response->assertOk()
            ->assertJsonCount(1, 'results')
            ->assertJsonFragment(['id' => $favorite->id]);
    }

    public function test_user_can_create_note(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $payload = [
            'title' => 'API created',
            'content' => '<p>Hello world</p>',
            'is_favorited' => true,
        ];

        $response = $this->postJson('/api/notes', $payload);

        $response->assertCreated()
            ->assertJsonFragment([
                'is_favorited' => true,
            ])
            ->assertJsonPath('note.title', 'API created')
            ->assertJsonPath('note.content', '<p>Hello world</p>');
    }

    public function test_user_can_update_note_and_toggle_favorite(): void
    {
        $user = User::factory()->create();
        $userNote = UserNote::factory()->create([
            'user_id' => $user->id,
            'note_id' => Note::factory()->create([
                'title' => 'Original',
                'content' => 'Old',
            ])->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/notes/{$userNote->id}", [
            'title' => 'Updated title',
            'content' => 'Updated content',
            'is_favorited' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('note.title', 'Updated title')
            ->assertJsonPath('note.content', 'Updated content')
            ->assertJsonPath('is_favorited', true)
            ->assertJsonStructure(['favorited_at']);
    }

    public function test_deleting_last_link_removes_note(): void
    {
        $user = User::factory()->create();
        $userNote = UserNote::factory()->create([
            'user_id' => $user->id,
        ]);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/notes/{$userNote->id}")
            ->assertOk();

        $this->assertSoftDeleted('user_note', ['id' => $userNote->id]);
        $this->assertSoftDeleted('notes', ['id' => $userNote->note_id]);
    }

    public function test_deleting_one_link_keeps_note_if_shared(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $note = Note::factory()->create();
        $userNote = UserNote::factory()->create([
            'user_id' => $user->id,
            'note_id' => $note->id,
        ]);
        UserNote::factory()->create([
            'user_id' => $otherUser->id,
            'note_id' => $note->id,
        ]);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/notes/{$userNote->id}")
            ->assertOk();

        $this->assertSoftDeleted('user_note', ['id' => $userNote->id]);
        $this->assertDatabaseHas('notes', ['id' => $note->id, 'deleted_at' => null]);
    }
}
