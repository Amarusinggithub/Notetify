<?php

namespace App\Models\Concerns;

trait HasNoteScopes
{
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_note.user_id', $userId);
    }

    public function scopeInNotebook($query, string $notebookId)
    {
        return $query->where('user_note.notebook_id', $notebookId);
    }

    public function scopeWithTag($query, string $tagName)
    {
        return $query->whereHas('tags', fn ($q) => $q->where('name', $tagName));
    }

    public function scopeSearch($query, string $term)
    {
        return $query->whereHas('note', fn ($q) => $q->whereRaw("content::text ILIKE ?", ["%{$term}%"]));
    }
}
