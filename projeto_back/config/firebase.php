<?php

$credentials = env('FIREBASE_CREDENTIALS', 'storage/app/firebase/firebase.json');

if ($credentials && !str_starts_with($credentials, '/') && !preg_match('/^[A-Za-z]:\\\\/', $credentials)) {
    $credentials = base_path($credentials);
}

return [
    'credentials' => $credentials,
];
