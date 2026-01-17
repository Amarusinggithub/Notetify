<?php

namespace Database\Seeders;

use App\Models\Note;
use App\Models\NoteShare;
use App\Models\User;
use Illuminate\Database\Seeder;

class NoteShareSeeder extends Seeder
{
    /**
     * Seed note sharing between users.
     */
    public function run(): void
    {
        $alice = User::where('email', 'alice@example.com')->first();
        $bob = User::where('email', 'bob@example.com')->first();

        if (!$alice || !$bob) {
            return;
        }

        // Get Alice's note
        $note = Note::whereHas('users', function ($query) use ($alice) {
            $query->where('users.id', $alice->id);
        })->first();

        if (!$note) {
            return;
        }

        // Share the note from Alice to Bob with edit permission
        NoteShare::create([
            'note_id' => $note->id,
            'shared_by_user_id' => $alice->id,
            'shared_with_user_id' => $bob->id,
            'permission' => 'edit',
            'accepted' => true,
        ]);
    }
}
