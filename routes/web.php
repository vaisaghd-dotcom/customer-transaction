<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PipedriveController;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/pipedrive/panel', [PipedriveController::class, 'panel']);

Route::get('/stripe_data', [PipedriveController::class, 'stripeData']);

Route::get('/pipedrive/auth/callback', [PipedriveController::class, 'handleCallback']);
