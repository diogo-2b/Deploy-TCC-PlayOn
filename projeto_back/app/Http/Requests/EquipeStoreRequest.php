<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EquipeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'descricao' => 'required|string',
            'imagem' => 'nullable|image',
            'administrador' => 'required|integer',
            'tipo' => 'nullable|boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'tipo' => $this->has('tipo'),
        ]);
    }
}
