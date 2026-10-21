<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DenunciaStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tipo = $this->input('tipo');

        $tabelaAlvo = match ($tipo) {
            'Equipe' => 'equipes',
            'Competicao' => 'competicoes',
            'Usuario' => 'usuarios',
            default => null,
        };

        return [
            'tipo' => ['required', Rule::in(['Equipe', 'Competicao', 'Usuario'])],
            'id_denunciado' => [
                'required',
                'integer',
                $tabelaAlvo
                    ? Rule::exists($tabelaAlvo, 'id')
                    : 'prohibited',
            ],
            'mensagem' => ['required', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'mensagem.required' => 'A mensagem da denúncia é obrigatória.',
            'mensagem.max' => 'A mensagem da denúncia deve ter no máximo 1000 caracteres.',
            'tipo.in' => 'O tipo da denúncia é inválido.',
            'id_denunciado.exists' => 'O alvo informado não foi encontrado.',
        ];
    }
}
