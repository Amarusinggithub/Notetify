<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'space_id',
        'order','is_pinned_to_space',
        'pinned_to_space_at',
        'added_to_space_at',

    ];

      protected $casts = [
        'is_pinned_to_space' => 'boolean',
        'pinned_to_space_at' => 'datetime',
        'added_to_space_at' => 'datetime',
    ];

     //user_notebook
    public function users(){
        return $this->belongsToMany(User::class)
                    ->using(UserNotebook::class)
                    ->withTimestamps();
    }


   public function notes(): HasMany
{
    return $this->hasMany(Note::class)->orderBy('order');
}


    // spaces
    public function space(): BelongsTo
{
    return $this->belongsTo(Space::class);
}
}
