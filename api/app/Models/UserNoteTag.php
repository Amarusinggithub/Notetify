<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserNoteTag extends Pivot
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $table = 'user_note_tag';

    protected $fillable = [
        'user_note_id',
        'tag_id',
        'order',
    ];

    public function userNote()
    {
        return $this->belongsTo(UserNote::class, 'user_note_id');
    }

    public function tag()
    {
        return $this->belongsTo(Tag::class, 'tag_id');
    }
}
