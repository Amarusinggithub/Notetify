<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class Notebook extends Model
{
        /** @use HasFactory<\Database\Factories\NotebookFactory> */

        use HasUuids,HasFactory,SoftDeletes;

        /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
    ];

     //user_notebook
     public function users(){
        return $this->belongsToMany(User::class)
                        ->using(UserNotebook::class)
->withTimestamps();
    }


     //notebook_note
     public function notes(){
        return $this->belongsToMany(Note::class)
                        ->using(NotebookNote::class)
        ->withTimestamps();
    }

}
