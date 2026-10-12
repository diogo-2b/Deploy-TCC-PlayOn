<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompeticaoStoreRequest extends FormRequest
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
            'dono' => 'required|integer',
            'tipo' => 'nullable|boolean',
            'inscricao' => 'nullable|boolean',
            'igdb_id' => 'nullable|integer|min:1',
            'jogo_nome' => 'required_with:igdb_id|string|max:255',
            'jogo_capa_url' => 'nullable|url|max:2048',
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
