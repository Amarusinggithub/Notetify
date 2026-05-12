<?php

namespace App\Models\Concerns;

trait HasTrashScopes
{
    public function scopeTrashed($query)
    {
        return $query->where("{$this->getTable()}.is_trashed", true);
    }

    public function scopeNotTrashed($query)
    {
        return $query->where("{$this->getTable()}.is_trashed", false);
    }
}
