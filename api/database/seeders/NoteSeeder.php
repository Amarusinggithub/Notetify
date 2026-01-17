<?php

namespace Database\Seeders;

use App\Models\Note;
use App\Models\User;
use App\Models\UserNote;
use Illuminate\Database\Seeder;

class NoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $alice = User::where('email', 'alice@example.com')->first();

        if ($alice) {
            $note = Note::factory()->create([
                'content' => '<p>This is a shared note between Alice and Bob.</p>',
            ]);

            UserNote::create([
                'user_id' => $alice->id,
                'note_id' => $note->id,
            ]);
        }
    }
}
