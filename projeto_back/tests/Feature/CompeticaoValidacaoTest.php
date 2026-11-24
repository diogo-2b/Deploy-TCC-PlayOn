<?php

namespace Tests\Feature;

use Tests\TestCase;

class CompeticaoValidacaoTest extends TestCase
{
    private function dadosValidos(): array
    {
        return [
            'nome' => 'Competição de teste',
            'descricao' => 'Descrição da competição',
            'data_encerramento' => '2030-01-01',
            'modo' => 'personalizado',
        ];
    }

    public function test_cadastro_de_competicao_exige_nome_descricao_e_data(): void
    {
        $this->withoutMiddleware();

        $this->postJson('/api/v1/competicoes', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nome', 'descricao', 'data_encerramento']);
    }

    public function test_formato_de_mata_mata_exige_quantidade_compativel(): void
    {
        $this->withoutMiddleware();

        $this->postJson('/api/v1/competicoes', [
            ...$this->dadosValidos(),
            'modo' => 'estruturado',
            'formato' => 'mata_mata_4',
            'quantidade_participantes' => 8,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['quantidade_participantes']);
    }

    public function test_classificacao_por_pontos_exige_participantes_e_rodadas(): void
    {
        $this->withoutMiddleware();

        $this->postJson('/api/v1/competicoes', [
            ...$this->dadosValidos(),
            'modo' => 'estruturado',
            'formato' => 'pontos',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['quantidade_participantes', 'numero_rodadas']);
    }

    public function test_data_de_encerramento_nao_pode_ser_anterior_ao_dia_atual(): void
    {
        $this->withoutMiddleware();

        $this->postJson('/api/v1/competicoes', [
            ...$this->dadosValidos(),
            'data_encerramento' => '2020-01-01',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['data_encerramento']);
    }
}
