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
        'name',
        'user_id'

    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }




}
