<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class EquipeTest extends TestCase
{
    public function test_cadastro_de_equipe_exige_campos_obrigatorios(): void
    {
        $this->withoutMiddleware();

        $this->postJson('/api/v1/equipes', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nome', 'descricao', 'administrador']);
    }

    public function test_cadastro_de_equipe_rejeita_arquivo_que_nao_e_imagem(): void
    {
        $this->withoutMiddleware();

        $this->postJson('/api/v1/equipes', [
            'nome' => 'Equipe de teste',
            'descricao' => 'Descrição da equipe de teste',
            'administrador' => 1,
            'imagem' => UploadedFile::fake()->create('documento.txt', 1),
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['imagem']);
    }
}
