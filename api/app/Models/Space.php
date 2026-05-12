<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Space extends Model
{
    use HasUuids, HasFactory, SoftDeletes;

    protected $fillable = [
        'created_by_user_id',
        'name',
        'description',
        'icon',
        'color',
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

    public function notebooks(): HasMany
    {
        return $this->hasMany(Notebook::class);
    }

    public function userSpaces(): HasMany
    {
        return $this->hasMany(UserSpace::class);
    }

    public function shares(): HasMany
    {
        return $this->hasMany(SpaceShare::class);
    }
}
