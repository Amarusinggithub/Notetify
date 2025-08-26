<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class Tag extends Model
{

    /** @use HasFactory<\Database\Factories\TagFactory> */
    use HasFactory ,HasUuids,SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name'

    ];

//note_tag
     public function notes(){
        return $this->belongsToMany(Note::class)
                        ->using(NoteTag::class)
        ->withTimestamps();
    }

    //user_tag
     public function Users(){
        return $this->belongsToMany(User::class)
                        ->using(UserTag::class)
        ->withTimestamps();
    }



}
