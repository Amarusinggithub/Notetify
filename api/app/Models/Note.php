<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Note extends Model
{
    use HasUuids, HasFactory, SoftDeletes;

    protected $fillable = [
        'created_by_user_id',
        'content',
        'ydoc_state',
    ];

    protected $appends = ['is_shared'];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    public function getIsSharedAttribute(): bool
    {
        return $this->shares()->exists();
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
