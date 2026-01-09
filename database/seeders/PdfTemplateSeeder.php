<?php

namespace Database\Seeders;

use App\Models\PdfTemplate;
use Illuminate\Database\Seeder;

class PdfTemplateSeeder extends Seeder
{
    public function run(): void
    {
        // Migrate the config data to the database
        PdfTemplate::updateOrCreate(
            ['key' => 'user_profile'],
            [
                'template_path' => 'templates/user_profile.pdf',
                'fields_config' => []
            ]
        );
    }
}
