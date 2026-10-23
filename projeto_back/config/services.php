<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'igdb' => [
        'client_id' => env('IGDB_CLIENT_ID'),
        'client_secret' => env('IGDB_CLIENT_SECRET'),
        'ca_bundle' => env('IGDB_CA_BUNDLE', env('FIREBASE_CA_BUNDLE')),
    ],

    'steam' => [
        'api_key' => env('STEAM_API_KEY'),
        'realm' => env('STEAM_OPENID_REALM', env('APP_URL')),
        'return_to' => env('STEAM_OPENID_RETURN_TO', env('APP_URL') . '/api/v1/steam/callback'),
        'frontend_callback_url' => env('STEAM_FRONTEND_CALLBACK_URL', env('FRONTEND_URL', 'http://localhost:5173') . '/perfil'),
        'ca_bundle' => env('STEAM_CA_BUNDLE', env('FIREBASE_CA_BUNDLE')),
        'recent_cache_minutes' => (int) env('STEAM_RECENT_CACHE_MINUTES', 10),
        'recent_limit' => (int) env('STEAM_RECENT_LIMIT', 6),
    ],

];
