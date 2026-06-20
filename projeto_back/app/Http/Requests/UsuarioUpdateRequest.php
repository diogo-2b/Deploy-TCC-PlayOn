<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UsuarioUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'apelido' => 'nullable|string|max:100|unique:usuarios,apelido,' . $this->route('usuario'),
            'nome' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:usuarios,email,' . $this->route('usuario'),
            'password' => 'nullable|string|min:6',
            'imagem' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
        ];
    }
}
