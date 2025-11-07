<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserNote extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $table = 'user_note';

    protected $fillable = [
        'note_id',
        'user_id',
        'is_favorited',
        'is_pinned',
        'is_trashed',
        'favorited_at',
        'pinned_at',
        'trashed_at',
        'order',
    ];

    protected $casts = [
        'is_favorited' => 'boolean',
        'is_pinned' => 'boolean',
        'is_trashed' => 'boolean',
        'favorited_at' => 'datetime',
        'pinned_at' => 'datetime',
        'trashed_at' => 'datetime',
    ];

    protected $with = ['note'];

    public function note()
    {
        return $this->belongsTo(Note::class, 'note_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
