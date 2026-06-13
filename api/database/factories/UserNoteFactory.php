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
            'is_owner' => true,
            'is_pinned_in_notebook' => false,
            'is_pinned_in_space' => false,
            'is_pinned_in_home' => false,
            'pinned_in_notebook_at' => null,
            'pinned_in_space_at' => null,
            'pinned_in_home_at' => null,
            'is_trashed' => false,
            'trashed_at' => null,
        ];
    }
}
