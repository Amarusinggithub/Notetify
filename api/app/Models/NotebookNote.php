<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class NotebookNote extends Model
{
      use HasFactory,SoftDeletes,HasUuids;

    protected $fillable = [
        'note_id',
        'notebook_id',

    ];

    public function note()
    {
        return $this->belongsTo(Note::class,'note_id');
    }

    public function sharedBy()
    {
        return $this->belongsTo(Notebook::class, 'notebook_id');
    }

}
