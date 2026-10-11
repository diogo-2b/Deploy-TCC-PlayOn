<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class CloudinaryService
{
    /**
     * Upload an image using Cloudinary's signed upload API.
     *
     * @throws RequestException
     * @throws RuntimeException
     */
    public function upload(UploadedFile $file, string $folder): string
    {
        $cloudName = (string) config('cloudinary.cloud_name');
        $apiKey = (string) config('cloudinary.api_key');
        $apiSecret = (string) config('cloudinary.api_secret');

        if ($cloudName === '' || $apiKey === '' || $apiSecret === '') {
            throw new RuntimeException('As credenciais do Cloudinary não estão configuradas.');
        }

        $timestamp = time();
        $publicId = Str::uuid()->toString();
        $signatureParameters = [
            'folder' => $folder,
            'public_id' => $publicId,
            'timestamp' => $timestamp,
        ];
        ksort($signatureParameters);

        $signature = sha1(
            collect($signatureParameters)
                ->map(fn ($value, $key) => "{$key}={$value}")
                ->implode('&') . $apiSecret
        );

        $path = $file->getRealPath();

        if (!is_string($path)) {
            throw new RuntimeException('Não foi possível localizar a imagem enviada.');
        }

        $stream = fopen($path, 'rb');

        if ($stream === false) {
            throw new RuntimeException('Não foi possível ler a imagem enviada.');
        }

        try {
            $response = Http::timeout(30)
                ->attach('file', $stream, $file->getClientOriginalName())
                ->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", [
                    'api_key' => $apiKey,
                    'timestamp' => $timestamp,
                    'signature' => $signature,
                    'folder' => $folder,
                    'public_id' => $publicId,
                ]);
        } finally {
            fclose($stream);
        }

        $response->throw();
        $url = $response->json('secure_url');

        if (!is_string($url) || $url === '') {
            throw new RuntimeException('O Cloudinary não retornou a URL da imagem enviada.');
        }

        return $url;
    }
}
