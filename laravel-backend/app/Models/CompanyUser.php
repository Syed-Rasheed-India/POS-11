<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanyUser extends Model
{
    use SoftDeletes;

    protected $table = 'company_users';

    protected $fillable = [
        'uuid',
        'company_id',
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
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
        'password_changed_at' => 'datetime',
        'locked_until' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}