<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class NoteTag extends Model
{
      use HasFactory,SoftDeletes,HasUuids;

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
