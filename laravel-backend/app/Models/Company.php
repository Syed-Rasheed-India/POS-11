<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use SoftDeletes;

    protected $table = 'companies';

    protected $fillable = [
        'company_code',
        'company_name',
        'legal_name',
        'tax_number',
        'country_id',
        'currency_id',
        'timezone',
        'status',
        'database_identifier',
    ];

    protected $casts = [
        'country_id' => 'integer',
        'currency_id' => 'integer',
    ];

    public function subscriptions() { return $this->hasMany(CompanySubscription::class, 'company_id'); }
}