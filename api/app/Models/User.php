<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Casts\Attribute;


class User extends Authenticatable  implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [

        'email',
        'password',
        'first_name',
        'last_name',
        'avatar',
        'timezone',
        'locale',

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
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    // Accessors
    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => ucwords($value),
            set: fn (string $value) => strtolower($value),
        );
    }

    // Methods
    public function recordLogin(string $ip): void
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ]);
    }

    public function isVerified(): bool
    {
        return $this->email_verified_at !== null;
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

    // spaces
    public function spaces()
    {
        return $this->hasMany(Space::class);
    }

    // tasks
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    // oauth_accounts
    public function oauthAccounts()
    {
        return $this->hasMany(OAuthAccount::class);
    }

    // files
    public function files()
    {
        return $this->hasMany(File::class);
    }
}
