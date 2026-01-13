<?php

namespace App\Observers;

use App\Models\Notebook;

class Notebookserver
{
    /**
     * Handle the Notebook "created" event.
     */
    public function created(Notebook $notebook): void
    {
        //
    }

    /**
     * Handle the Notebook "updated" event.
     */
    public function updated(Notebook $notebook): void
    {
        //
    }

    /**
     * Handle the Notebook "deleted" event.
     */
    public function deleted(Notebook $notebook): void
    {
        //
    }

    /**
     * Handle the Notebook "restored" event.
     */
    public function restored(Notebook $notebook): void
    {
        //
    }

    /**
     * Handle the Notebook "force deleted" event.
     */
    public function forceDeleted(Notebook $notebook): void
    {
        //
    }
}
