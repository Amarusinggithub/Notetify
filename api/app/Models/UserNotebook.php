<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class UserNotebook extends Model
{
      use HasFactory;

    protected $fillable = [
        'notebook_id',
        'user_id',
        'is_favorited',
        'is_pinned',
        'is_trashed',
        'favorited_at',
        'pinned_at',
        'trashed_at'

    ];

    public function notebook()
    {
        return $this->belongsTo(Notebook::class,'notebook_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
