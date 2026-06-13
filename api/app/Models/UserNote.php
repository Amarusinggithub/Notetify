<?php

namespace App\Models;

use App\Models\Concerns\HasNoteScopes;
use App\Models\Concerns\HasPinScopes;
use App\Models\Concerns\HasTrashScopes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserNote extends Model
{
    use HasFactory, HasUuids, SoftDeletes;
    use HasNoteScopes, HasPinScopes, HasTrashScopes;

    protected $table = 'user_note';

    protected $fillable = [
        'user_id',
        'note_id',
        'notebook_id',
        'is_owner',
        'order',
        'is_pinned_in_notebook',
        'is_pinned_in_space',
        'is_pinned_in_home',
        'pinned_in_notebook_at',
        'pinned_in_space_at',
        'pinned_in_home_at',
        'is_trashed',
        'trashed_at',
    ];

    protected function casts(): array
    {
        return [
            'is_owner' => 'boolean',
            'is_pinned_in_notebook' => 'boolean',
            'is_pinned_in_space' => 'boolean',
            'is_pinned_in_home' => 'boolean',
            'is_trashed' => 'boolean',
            'trashed_at' => 'datetime',
            'pinned_in_notebook_at' => 'datetime',
            'pinned_in_space_at' => 'datetime',
            'pinned_in_home_at' => 'datetime',
        ];
    }

    protected $with = ['note'];

    public function note(): BelongsTo
    {
        // Exclude ydoc_state (the full Yjs binary) — it is only ever read via raw
        // SQL in CollabController, never serialized, so loading it bloats every
        // list/show query. withExists resolves is_shared in one subquery instead
        // of an EXISTS per note (N+1) when the accessor serializes.
        return $this->belongsTo(Note::class)
            ->select(['id', 'created_by_user_id', 'content', 'created_at', 'updated_at', 'deleted_at'])
            ->withExists('shares');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function notebook(): BelongsTo
    {
        return $this->belongsTo(Notebook::class);
    }

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'user_note_tag')
            ->using(UserNoteTag::class)
            ->withTimestamps();
    }
}
