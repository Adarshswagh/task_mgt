<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'name',
        'phone',
        'date_of_birth',
        'gender',
        'email',
        'password',
        'address',
        'branch_id',
        'department',
        'designation',
        'date_of_joining',
        'account_holder_name',
        'account_number',
        'bank_name',
        'bank_identifier_code',
        'branch_location',
        'tax_payer_id',
        'document',
        'created_by',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'date_of_joining' => 'date',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user who created this employee.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Generate unique employee ID
     */
    public static function generateEmployeeId()
    {
        $prefix = 'DTG';
        $lastEmployee = self::orderBy('id', 'desc')->first();
        
        if ($lastEmployee && $lastEmployee->employee_id) {
            $lastNumber = (int) substr($lastEmployee->employee_id, 3);
            $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
            return $prefix . $newNumber;
        }
        
        return $prefix . '001';
    }
}
