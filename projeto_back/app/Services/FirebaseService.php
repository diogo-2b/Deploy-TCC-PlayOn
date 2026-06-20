<?php

namespace App\Services;

use Kreait\Firebase\Factory;

class FirebaseService
{
    private $auth;

    public function __construct()
    {
        $factory = (new Factory)->withServiceAccount(
            config('firebase.credentials')
        );

        $this->auth = $factory->createAuth();
    }

    public function verifyToken($token)
    {
        return $this->auth->verifyIdToken($token);
    }

    public function getUser($uid)
    {
        return $this->auth->getUser($uid);
    }

    public function getUserByEmail($email)
    {
        return $this->auth->getUserByEmail($email);
    }

    public function deleteUser($uid)
    {
        $this->auth->deleteUser($uid);
    }
}
