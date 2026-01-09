<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PdfTemplate extends Model
{
    protected $fillable = ['key', 'template_path', 'fields_config'];

    protected $casts = [
        'fields_config' => 'array',
    ];
}
