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
        $pinned = UserNote::factory()
            ->state(['is_pinned' => true, 'pinned_at' => now()])
            ->for($user, 'user')
            ->create();
        $pinned->note()->update(['content' => 'Pinned note']);

        UserNote::factory()
            ->count(2)
            ->for($user, 'user')
            ->create()
            ->each(fn (UserNote $note) => $note->note()->update(['content' => 'Other note']));

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/notes?search=Pinned&is_pinned=true');

        $response->assertOk()
            ->assertJsonCount(1, 'results')
            ->assertJsonFragment(['id' => $pinned->id]);
    }

    public function test_user_can_create_note(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $payload = [
            'content' => '<p>Hello world</p>',
            'is_pinned' => true,
        ];

        $response = $this->postJson('/api/notes', $payload);

        $response->assertCreated()
            ->assertJsonFragment([
                'is_pinned' => true,
            ])
            ->assertJsonPath('note.content', '<p>Hello world</p>');
    }

    public function test_user_can_update_note_and_toggle_favorite(): void
    {
        $user = User::factory()->create();
        $userNote = UserNote::factory()->create([
            'user_id' => $user->id,
            'note_id' => Note::factory()->create([
                'content' => 'Old',
            ])->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/notes/{$userNote->id}", [
            'content' => 'Updated content',
            'is_pinned' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('note.content', 'Updated content')
            ->assertJsonPath('is_pinned', true)
            ->assertJsonStructure(['pinned_at']);
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
