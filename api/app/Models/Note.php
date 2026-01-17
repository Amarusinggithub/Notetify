<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Note extends Model
{
    use HasUuids ,HasFactory,SoftDeletes;

    /** @use HasFactory<\Database\Factories\NoteFactory> */

/**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'content',
        'notebook_id',
        'is_pinned_to_notebook',
        'pinned_to_notebook_at',
        'order',
    ];

    protected $casts = [
        'is_pinned_to_notebook' => 'boolean',
        'pinned_to_notebook_at' => 'datetime',
    ];


 //user_note
    public function users(){
        return $this->belongsToMany(User::class, 'user_note')
                    ->using(UserNote::class)
                    ->withTimestamps();
    }


    // tasks
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    // files
    public function files()
    {
        return $this->belongsToMany(File::class, 'file_note')
            ->withPivot('order')
            ->withTimestamps();
    }

    public function userNotes()
    {
        return $this->hasMany(UserNote::class);
    }

    public function notebook(): BelongsTo
    {
        return $this->belongsTo(Notebook::class);
    }


}
