<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserSpace extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $table = 'user_space';

    protected $fillable = [
        'space_id',
        'user_id',
        'is_trashed',
        'trashed_at',
        'is_pinned_to_home',
        'pinned_to_home_at',
        'is_default',
    ];

    protected $casts = [
        'is_pinned_to_home' => 'boolean',
        'pinned_to_home_at' => 'datetime',
        'is_trashed' => 'boolean',
        'trashed_at' => 'datetime',
        'is_default' => 'boolean',
    ];

    public function space()
    {
        return $this->belongsTo(Space::class, 'space_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
