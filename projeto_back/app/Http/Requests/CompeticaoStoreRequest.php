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
            'tipo' => 'nullable|boolean',
            'inscricao' => 'nullable|boolean',
            'modo' => 'sometimes|in:personalizado,estruturado',
            'formato' => 'nullable|required_if:modo,estruturado|in:mata_mata_4,mata_mata_8,mata_mata_16,pontos',
            'quantidade_participantes' => 'nullable|integer|min:1|max:20',
            'numero_rodadas' => 'nullable|integer|min:1|max:2147483647',
            'igdb_id' => 'nullable|integer|min:1',
            'jogo_nome' => 'required_with:igdb_id|string|max:255',
            'jogo_capa_url' => 'nullable|url|max:2048',
            'data_encerramento' => 'required|date|date_format:Y-m-d|after_or_equal:today',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->input('modo') !== 'estruturado') {
                return;
            }

            $formato = $this->input('formato');
            $quantidade = is_string($formato) ? ([
                'mata_mata_4' => 4,
                'mata_mata_8' => 8,
                'mata_mata_16' => 16,
            ][$formato] ?? null) : null;

            if ($formato === 'pontos' && !$this->filled('numero_rodadas')) {
                $validator->errors()->add('numero_rodadas', 'Informe o número de rodadas.');
            }

            if ($formato === 'pontos' && !$this->filled('quantidade_participantes')) {
                $validator->errors()->add('quantidade_participantes', 'Informe a quantidade de participantes.');
            }

            if ($quantidade !== null && (int) $this->input('quantidade_participantes') !== $quantidade) {
                $validator->errors()->add('quantidade_participantes', "Este formato exige {$quantidade} participantes.");
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'tipo' => $this->has('tipo'),
            'inscricao' => $this->has('inscricao'),
        ]);
    }
}
