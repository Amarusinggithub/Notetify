<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class NotebookNote extends Model
{
     use HasFactory;

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
