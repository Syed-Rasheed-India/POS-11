<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformAdmin extends Model
{
    protected $table = 'platform_admins';

    protected $fillable = [
        'uuid',
        'username',
        'email',
        'password_hash',
        'first_name',
        'last_name',
        'phone',
        'status',
        'last_login_at',
        'password_changed_at',
        'failed_login_attempts',
        'locked_until',
        'deleted_at',
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
        'password_changed_at' => 'datetime',
        'locked_until' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}