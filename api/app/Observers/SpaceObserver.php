<?php

namespace App\Observers;

use App\Models\Space;

class SpaceObserver
{
    /**
     * Handle the Space "created" event.
     */
    public function created(Space $space): void
    {
        //
    }

    /**
     * Handle the Space "updated" event.
     */
    public function updated(Space $space): void
    {
        //
    }

    /**
     * Handle the Space "deleted" event.
     */
    public function deleted(Space $space): void
    {
        //
    }

    /**
     * Handle the Space "restored" event.
     */
    public function restored(Space $space): void
    {
        //
    }

    /**
     * Handle the Space "force deleted" event.
     */
    public function forceDeleted(Space $space): void
    {
        //
    }
}
