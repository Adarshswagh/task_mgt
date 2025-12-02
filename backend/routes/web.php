<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});

// Serve avatar images from storage
Route::get('/storage/avatars/{filename}', function (Request $request, $filename) {
    if (!Storage::disk('public')->exists('avatars/' . $filename)) {
        abort(404);
    }
    
    $file = Storage::disk('public')->get('avatars/' . $filename);
    $type = Storage::disk('public')->mimeType('avatars/' . $filename);
    
    return response($file, 200)->header('Content-Type', $type);
});
