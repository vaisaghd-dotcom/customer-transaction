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
        $referrer = rtrim($request->server('HTTP_REFERER'), '/');

        $pipedriveUser = DB::table('pipedrive_tokens')
        ->where('api_domain', $referrer)
        ->latest()
        ->first();

        $accesstoken = $pipedriveUser->access_token ?? null;

        if (isset($pipedriveUser->expires_at) && now()->gte($pipedriveUser->expires_at)) {
            try {
                $response = Http::asForm()->post('https://oauth.pipedrive.com/oauth/token', [
                    'grant_type'    => 'refresh_token',
                    'refresh_token' => $pipedriveUser->refresh_token,
                    'client_id'     => env('PIPEDRIVE_CLIENT_ID'),
                    'client_secret' => env('PIPEDRIVE_CLIENT_SECRET'),
                    'redirect_uri'  => env('PIPEDRIVE_REDIRECT_URI'),
                ]);

                if ($response->successful()) {
                    $newTokens = $response->json();

                    $expiresAt = now()->addSeconds($newTokens['expires_in']);

                    DB::table('pipedrive_tokens')
                        ->where('id', $pipedriveUser->id)
                        ->update([
                            'access_token'  => $newTokens['access_token'],
                            'refresh_token' => $newTokens['refresh_token'] ?? $pipedriveUser->refresh_token,
                            'expires_at'    => $expiresAt,
                            'updated_at'    => now(),
                        ]);

                    $accessToken = $newTokens['access_token'];
                } 
            } catch (\Exception $e) {     
            }
        }


        return view('pipedrive.panel', compact('referrer','accesstoken')); 
    }

    public function fetchData(Request $request)
    {
        $user = DB::table('pipedrive_users',$request->query('pipedrive_user_id'))->first();
        $token = $user->access_token;

        // Refresh token if expired
        if ($user->token_expires_at < now()) {
            $token = $this->refreshToken($user);
        }

        $resource = $request->query('resource');
        $selectedId = $request->query('selectedId');

        $url = $resource === 'deal'
            ? "https://api.pipedrive.com/v1/deals/$selectedId?api_token=$token"
            : "https://api.pipedrive.com/v1/persons/$selectedId?api_token=$token";

        $response = Http::get($url);

        return $response->json();
    }

    private function refreshToken($user)
    {
        $response = Http::asForm()->post('https://oauth.pipedrive.com/oauth/token', [
            'grant_type' => 'refresh_token',
            'refresh_token' => $user->pipedrive_refresh_token,
            'client_id' => config('services.pipedrive.client_id'),
            'client_secret' => config('services.pipedrive.client_secret'),
        ]);

        $data = $response->json();

        $user->update([
            'pipedrive_access_token' => $data['access_token'],
            'pipedrive_refresh_token' => $data['refresh_token'],
            'token_expires_at' => now()->addSeconds($data['expires_in']),
        ]);

        return $data['access_token'];
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