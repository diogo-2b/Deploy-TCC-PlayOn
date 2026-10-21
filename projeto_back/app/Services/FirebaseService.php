<?php

namespace App\Services;

use Google\Auth\Credentials\ServiceAccountCredentials;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Factory;

class FirebaseService
{
    private $auth;
    private array $credentials;
    private ?string $accessToken = null;

    public function __construct()
    {
        $configuredCredentials = config('firebase.credentials');
        $this->credentials = is_array($configuredCredentials)
            ? $configuredCredentials
            : json_decode(
                (string) file_get_contents($configuredCredentials),
                true,
                512,
                JSON_THROW_ON_ERROR
            );
        $factory = (new Factory)->withServiceAccount($this->credentials);

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

    public function createCustomToken(string $uid): string
    {
        return $this->auth->createCustomToken($uid)->toString();
    }

    public function firestoreSet(string $path, array $fields): void
    {
        $this->firestoreRequest('patch', $path, ['fields' => $this->encodeFields($fields)]);
    }

    public function firestoreGet(string $path): ?array
    {
        $response = $this->firestoreRequest('get', $path, [], false);

        return $response?->json();
    }

    public function firestoreList(string $path): array
    {
        $response = $this->firestoreRequest('get', $path, [], false);

        return $response?->json('documents', []) ?? [];
    }

    public function firestoreDelete(string $path): void
    {
        $this->firestoreRequest('delete', $path, []);
    }

    private function firestoreRequest(
        string $method,
        string $path,
        array $payload,
        bool $throwOnFailure = true
    ): mixed {
        $projectId = $this->credentials['project_id'] ?? null;
        if (!$projectId) {
            throw new \RuntimeException('O project_id das credenciais Firebase não está configurado.');
        }

        $documentPath = implode('/', array_map('rawurlencode', explode('/', $path)));
        $url = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/{$documentPath}";
        $request = Http::withOptions(['verify' => $this->caBundle()])
            ->withToken($this->googleAccessToken())
            ->timeout(15);
        $response = $method === 'get'
            ? $request->get($url)
            : $request->{$method}($url, $payload);

        if ($throwOnFailure) {
            $response->throw();
        }

        return $response->status() === 404 ? null : $response;
    }

    private function googleAccessToken(): string
    {
        if ($this->accessToken) {
            return $this->accessToken;
        }

        $credentials = new ServiceAccountCredentials(
            ['https://www.googleapis.com/auth/datastore'],
            $this->credentials
        );
        $httpHandler = function ($request, array $options = []) {
            return (new Client(['verify' => $this->caBundle()]))
                ->send($request, $options);
        };
        $token = $credentials->fetchAuthToken($httpHandler);
        $this->accessToken = $token['access_token'] ?? throw new \RuntimeException(
            'Não foi possível obter um token de acesso do Firestore.'
        );

        return $this->accessToken;
    }

    private function caBundle(): string|bool
    {
        $configuredBundle = config('firebase.ca_bundle');

        if (!$configuredBundle) {
            return true;
        }

        if (is_file($configuredBundle) && is_readable($configuredBundle)) {
            return $configuredBundle;
        }

        Log::warning('FIREBASE_CA_BUNDLE não existe ou não pode ser lido; usando o bundle CA do sistema.', [
            'path' => $configuredBundle,
        ]);

        return true;
    }

    private function encodeFields(array $fields): array
    {
        $encoded = [];
        foreach ($fields as $name => $value) {
            $encoded[$name] = ['stringValue' => (string) $value];
        }

        return $encoded;
    }
}
