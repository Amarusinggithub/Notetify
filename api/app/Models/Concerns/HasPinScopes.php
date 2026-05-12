<?php

namespace App\Models\Concerns;

trait HasPinScopes
{
    public function scopePinnedInNotebook($query)
    {
        return $query->where("{$this->getTable()}.is_pinned_in_notebook", true);
    }

    public function scopePinnedInSpace($query)
    {
        return $query->where("{$this->getTable()}.is_pinned_in_space", true);
    }

    public function scopePinnedInHome($query)
    {
        return $query->where("{$this->getTable()}.is_pinned_in_home", true);
    }
}
