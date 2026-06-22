<?php
// Código antes deploy funcionando
// $credentials = env('FIREBASE_CREDENTIALS', 'storage/app/firebase/firebase.json');
// if ($credentials && !str_starts_with($credentials, '/') && !preg_match('/^[A-Za-z]:\\\\/', $credentials)) {
//     $credentials = base_path($credentials);
// }
// return [
//     'credentials' => $credentials,
// ];

$json = env('FIREBASE_CREDENTIALS_JSON');
return [
    'credentials' => $json
        ? json_decode($json, true)
        : base_path(env('FIREBASE_CREDENTIALS', 'storage/app/firebase/firebase.json')),
];
