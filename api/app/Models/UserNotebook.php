<?php

namespace App\Models;

use App\Models\Concerns\HasPinScopes;
use App\Models\Concerns\HasTrashScopes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotebook extends Model
{
    use HasFactory, SoftDeletes, HasUuids;
    use HasPinScopes, HasTrashScopes;

    protected $table = 'user_notebook';

    protected $fillable = [
        'user_id',
        'notebook_id',
        'is_owner',
        'is_pinned_in_space',
        'pinned_in_space_at',
        'is_pinned_to_home',
        'pinned_to_home_at',
        'is_trashed',
        'trashed_at',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'is_owner'          => 'boolean',
            'is_pinned_in_space' => 'boolean',
            'pinned_in_space_at' => 'datetime',
            'is_pinned_to_home' => 'boolean',
            'pinned_to_home_at' => 'datetime',
            'is_trashed'        => 'boolean',
            'trashed_at'        => 'datetime',
            'is_default'        => 'boolean',
        ];
    }

    public function notebook(): BelongsTo
    {
        return $this->belongsTo(Notebook::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
