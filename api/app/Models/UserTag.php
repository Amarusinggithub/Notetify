<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class UserTag extends Model
{
     use HasFactory;


         protected $fillable = [
        'user_id',
        'tag_id',
        'color',
        'order',

    ];

    public function tag()
    {
        return $this->belongsTo(Tag::class,'tag_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
