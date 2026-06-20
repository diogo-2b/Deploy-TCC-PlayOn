<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompeticaoUpdateRequest extends FormRequest
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
            'dono' => 'nullable|integer',
            'tipo' => 'nullable|boolean',
            'inscricao' => 'nullable|boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'tipo' => $this->has('tipo'),
            'inscricao' => $this->has('inscricao'),
        ]);
    }
}
