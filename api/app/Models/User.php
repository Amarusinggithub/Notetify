<?php

namespace App\Models;

//use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;



class User extends Authenticatable // implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable,HasUuids,SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [

        'email',
        'password',
        'first_name',
        'last_name'

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }



     // Rest omitted for brevity

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }



    //user_note
     public function notes(){
return $this->belongsToMany(Note::class)
                ->using(UserNote::class)
                ->withTimestamps();
               }

    //user_tag
       public function tags()
    {
return $this->belongsToMany(Tag::class)
                ->using(UserTag::class)
                ->withPivot('color', 'order')
                ->withTimestamps();
               }

    //user_notebook
     public function notebooks(){
return $this->belongsToMany(Notebook::class)
                ->using(UserNotebook::class)
                ->withTimestamps();    }

    public function sharedNotes()
{
    return $this->belongsToMany(Note::class, 'note_shares', 'shared_with_user_id', 'note_id')
                ->withPivot('permission', 'expires_at', 'accepted')
                ->withTimestamps();
}

public function sharedNotebooks()
{
    return $this->belongsToMany(Notebook::class, 'notebook_shares', 'shared_with_user_id', 'notebook_id')
                ->withPivot('permission', 'expires_at', 'accepted')
                ->withTimestamps();
}
}
