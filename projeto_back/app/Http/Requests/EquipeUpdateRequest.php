<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EquipeUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => 'nullable|string|max:255',
            'descricao' => 'nullable|string',
            'imagem' => 'nullable|image',
            'administrador' => 'nullable|integer',
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
