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




    // spaces
    public function spaces()
    {
        return $this->belongsToMany(Space::class, 'space_notebook')
            ->withPivot('order')
            ->withTimestamps();
    }
}
