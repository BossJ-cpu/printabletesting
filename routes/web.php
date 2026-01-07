<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'react');

Route::get('/api/health', function () {
    return response()->json([
        'ok' => true,
        'framework' => 'laravel',
        'timestamp' => now()->toIso8601String(),
        'app' => config('app.name', 'Laravel'),
    ]);
});
