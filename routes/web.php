<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'react');

Route::get('/app/pdf-demo', [App\Http\Controllers\PdfController::class, 'generate']);

// Template Management API
Route::get('/api/pdf-templates/{key}', [App\Http\Controllers\PdfTemplateController::class, 'show']);
Route::post('/api/pdf-templates/{key}', [App\Http\Controllers\PdfTemplateController::class, 'update']);
Route::put('/api/pdf-templates/{key}', [App\Http\Controllers\PdfTemplateController::class, 'update']);
Route::post('/api/pdf-templates/{key}/upload', [App\Http\Controllers\PdfTemplateController::class, 'uploadTemplate']);

Route::get('/pdf', function () {
    return redirect('http://127.0.0.1:3000/pdf');
});

Route::get('/api/health', function () {
    return response()->json([
        'ok' => true,
        'framework' => 'laravel',
        'timestamp' => now()->toIso8601String(),
        'app' => config('app.name', 'Laravel'),
    ]);
});

Route::post('/api/submissions', function (\Illuminate\Http\Request $request) {
    $data = $request->validate([
        'name' => 'required|string',
        'age' => 'required|integer',
        'email' => 'required|email'
    ]);

    $submission = \App\Models\Submission::create($data);

    return response()->json($submission, 201);
});

Route::get('/api/submissions', function () {
    return \App\Models\Submission::select('id', 'name')->get();
});

Route::get('/app/generate-submission-pdf/{id}', [\App\Http\Controllers\PdfController::class, 'generateFromSubmission']);
