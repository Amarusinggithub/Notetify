<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notebook extends Model
{
        use HasUuids;

    /** @use HasFactory<\Database\Factories\NotebookFactory> */
    use HasFactory;
}
