<?php

return [
    'forms' => [
        'user_profile' => [
            'template_path' => 'templates/user_profile.pdf',
            'fields' => [
                'full_name' => [
                    'x' => 50, 
                    'y' => 60, // Adjusted to sit inside the first box
                    'font' => 'Helvetica',
                    'size' => 12
                ],
                'email' => [
                    'x' => 50,
                    'y' => 80, // Moved down to sit inside the second box (was overlapping label)
                    'font' => 'Helvetica',
                    'size' => 12
                ],
                'date' => [
                    'x' => 150,
                    'y' => 30,
                    'font' => 'Helvetica',
                    'size' => 10
                ]
            ]
        ]
    ]
];
