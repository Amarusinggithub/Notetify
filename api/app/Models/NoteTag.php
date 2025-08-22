<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class NoteTag extends Model
{
      use HasFactory;

    protected $fillable = [
        'note_id',
        'tag_id',

    ];

      public function note()
    {
        return $this->belongsTo(Note::class,'note_id');
    }

    public function tagBy()
    {
        return $this->belongsTo(Tag::class, 'tag_id');
    }

}
