<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Space extends Model
{
    use HasUuids, HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'icon',
        'color',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }


    public function notebooks(): HasMany
{
    return $this->hasMany(Notebook::class)->orderBy('order');
}

}
