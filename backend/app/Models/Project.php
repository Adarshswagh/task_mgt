<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_name',
        'project_name',
        'client_email',
        'link',
        'client_password',
        'created_by',
    ];

    protected $hidden = [
        'client_password',
    ];

    /**
     * Get the user who created this project.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all documents for this project.
     */
    public function documents()
    {
        return $this->hasMany(ProjectDocument::class);
    }
}
