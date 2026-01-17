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
        'user_id',
        'note_id',
        'is_pinned_to_home',
        'pinned_to_home_at',
        'is_trashed',
        'trashed_at',
    ];



    protected $casts = [
        'is_pinned_to_home' => 'boolean',
        'is_trashed' => 'boolean',
        'pinned_to_home_at' => 'datetime',
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


    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'user_note_tag')
            ->using(UserNoteTag::class)
            ->withTimestamps();
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    |
    | Query scopes are reusable query constraints you define on a model.
    | They let you encapsulate common "where" clauses so your controllers
    | stay clean. Scopes are methods prefixed with "scope" but called
    | without that prefix:
    |
    |   UserNote::forUser($id)->pinned()->get();
    |
    | Laravel automatically passes the $query builder as the first argument.
    |
    */

    /**
     * Scope: Filter by the authenticated/given user.
     *
     * Usage: UserNote::forUser(Auth::id())->get();
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_note.user_id', $userId);
    }

    /**
     * Scope: Filter notes that have a specific tag.
     *
     * Usage: UserNote::withTag('work')->get();
     */
    public function scopeWithTag($query, string $tagName)
    {
        return $query->whereHas('tags', function ($q) use ($tagName) {
            $q->where('name', $tagName);
        });
    }

    /**
     * Scope: Search note content with a LIKE query.
     *
     * Usage: UserNote::search('meeting')->get();
     */
    public function scopeSearch($query, string $term)
    {
        $search = '%' . $term . '%';
        return $query->where('notes.content', 'like', $search);
    }

    /**
     * Scope: Filter by a boolean flag (is_pinned, is_trashed).
     *
     * Usage: UserNote::whereFlag('is_pinned', true)->get();
     */
    public function scopeWhereFlag($query, string $flag, bool $value)
    {
        return $query->where("user_note.{$flag}", $value);
    }

    /**
     * Scope: Shortcut for pinned notes.
     *
     * Usage: UserNote::pinned()->get();
     */
    public function scopePinned($query)
    {
        return $query->where('user_note.is_pinned_to_home', true);
    }

    /**
     * Scope: Shortcut for trashed notes.
     *
     * Usage: UserNote::trashed()->get();
     */
    public function scopeTrashed($query)
    {
        return $query->where('user_note.is_trashed', true);
    }

    /**
     * Scope: Shortcut for non-trashed notes.
     *
     * Usage: UserNote::notTrashed()->get();
     */
    public function scopeNotTrashed($query)
    {
        return $query->where('user_note.is_trashed', false);
    }

}
