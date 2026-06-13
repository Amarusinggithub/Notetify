<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Note extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'created_by_user_id',
        'content',
        'ydoc_state',
    ];

    protected $hidden = ['ydoc_state', 'shares_exists'];

    protected $appends = ['is_shared'];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    public function getIsSharedAttribute(): bool
    {
        // Prefer the value resolved via withExists() on the note relation; fall
        // back to a query only when the note was loaded without it.
        return (bool) ($this->attributes['shares_exists'] ?? $this->shares()->exists());
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function userNotes(): HasMany
    {
        return $this->hasMany(UserNote::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function files()
    {
        return $this->belongsToMany(File::class, 'file_note')
            ->withPivot('order')
            ->withTimestamps();
    }

    public function shares(): HasMany
    {
        return $this->hasMany(NoteShare::class);
    }
}
