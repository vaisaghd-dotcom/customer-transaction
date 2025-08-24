<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PipedriveController extends Controller
{
    public function panel(Request $request)
    {
        return view('pipedrive.panel'); 
    }

    public function stripeData(Request $request)
    {
        $email = $request->query('email');

        if(!$email){
            return response()->json(['error'=>'Email required'],400);
        }

        $response = Http::get('https://octopus-app-3hac5.ondigitalocean.app/api/stripe_data', [
            'email' => $email
        ]);

        if($response->failed()){
            return response()->json(['error'=>'Failed to fetch data'],500);
        }

        return $response->json();
    }

        public function handleCallback(Request $request)
    {
        $code = $request->query('code');
        $state = $request->query('state');

        if (!$code) {
            return response()->json(['error' => 'Authorization code missing'], 400);
        }

        $tokenRes = Http::asForm()->post('https://oauth.pipedrive.com/oauth/token', [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'client_id' => env('PIPEDRIVE_CLIENT_ID'),
            'client_secret' => env('PIPEDRIVE_CLIENT_SECRET'),
            'redirect_uri' => env('PIPEDRIVE_REDIRECT_URI'),
        ]);

        if ($tokenRes->failed()) {
            Log::error('Pipedrive token exchange failed', ['body' => $tokenRes->body()]);
            return response()->json(['error' => 'Token exchange failed', 'details' => $tokenRes->body()], 500);
        }

        $tokenData = $tokenRes->json();

        DB::table('pipedrive_tokens')->updateOrInsert(
            ['api_domain' => $tokenData['api_domain']],
            [
                'access_token' => $tokenData['access_token'],
                'refresh_token'=> $tokenData['refresh_token'],
                'expires_at'   => now()->addSeconds($tokenData['expires_in']),
                'created_at'   => now(),
                'updated_at'   => now(),
            ]
        );

        return view('panel-installed-success');
    }
}