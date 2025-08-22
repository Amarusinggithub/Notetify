<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NotebookShare extends Model
{
    use HasFactory;

    protected $fillable = [
        'notebook_id',
        'shared_by_user_id',
        'shared_with_user_id',
        'permission',
        'expires_at',
        'accepted',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted' => 'boolean',
    ];

     public function isValid()
    {
        return !$this->accepted && now()->lessThan($this->expires_at);
    }

    public function notebook()
    {
        return $this->belongsTo(Notebook::class);
    }

    public function sharedBy()
    {
        return $this->belongsTo(User::class, 'shared_by_user_id');
    }

    public function sharedWith()
    {
        return $this->belongsTo(User::class, 'shared_with_user_id');
    }

    public function getIsValidAttribute(): bool
    {
        $notExpired = is_null($this->expires_at) || $this->expires_at->isFuture();
        return $this->accepted && $notExpired;
    }

    public function scopeValid($query)
    {
        return $query->where('accepted', true)
                     ->where(function ($q) {
                         $q->whereNull('expires_at')
                           ->orWhere('expires_at', '>', now());
                     });
    }
}
