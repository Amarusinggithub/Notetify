<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Notebook extends Model
{
    use HasUuids, HasFactory, SoftDeletes;

    protected $fillable = [
        'created_by_user_id',
        'space_id',
        'name',
    ];

    protected $appends = ['is_shared'];

    public function getIsSharedAttribute(): bool
    {
        return $this->shares()->exists();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    public function userNotebooks(): HasMany
    {
        return $this->hasMany(UserNotebook::class);
    }

    public function userNotes(): HasMany
    {
        return $this->hasMany(UserNote::class);
    }

    public function shares(): HasMany
    {
        return $this->hasMany(NotebookShare::class);
    }
}
