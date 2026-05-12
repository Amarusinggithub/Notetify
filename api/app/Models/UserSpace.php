<?php

namespace App\Models;

use App\Enums\Permission;
use App\Models\Concerns\HasTrashScopes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSpace extends Model
{
    use HasFactory, SoftDeletes, HasUuids;
    use HasTrashScopes;

    protected $table = 'user_space';

    protected $fillable = [
        'user_id',
        'space_id',
        'is_owner',
        'permission',
        'is_trashed',
        'trashed_at',
        'is_default',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'is_owner'   => 'boolean',
            'permission' => Permission::class,
            'is_trashed' => 'boolean',
            'trashed_at' => 'datetime',
            'is_default' => 'boolean',
        ];
    }

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
