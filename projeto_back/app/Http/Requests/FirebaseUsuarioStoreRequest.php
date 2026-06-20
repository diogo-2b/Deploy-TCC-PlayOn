<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FirebaseUsuarioStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'firebase_token' => 'required|string',
            'nome' => 'required|string|max:255',
            'apelido' => 'required|string|max:100|unique:usuarios,apelido',
            'password' => 'required|string|min:6',
            'imagem' => 'nullable|image',
        ];
    }
}
