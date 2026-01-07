<?php

namespace Database\Factories;

use App\Models\Note;
use App\Models\User;
use App\Models\UserNote;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserNote>
 */
class UserNoteFactory extends Factory
{
    protected $model = UserNote::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'note_id' => Note::factory(),
            'is_pinned' => false,
            'is_trashed' => false,
            'pinned_at' => null,
            'trashed_at' => null,
        ];
    }
}
