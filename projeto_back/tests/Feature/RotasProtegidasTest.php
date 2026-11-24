<?php

namespace Tests\Feature;

use Tests\TestCase;

class RotasProtegidasTest extends TestCase
{
    public function test_edicao_de_perfil_exige_autenticacao(): void
    {
        $this->putJson('/api/v1/usuarios/1', ['nome' => 'Novo nome'])
            ->assertUnauthorized();
    }

    public function test_conexao_com_a_steam_exige_autenticacao(): void
    {
        $this->getJson('/api/v1/steam/status')->assertUnauthorized();
        $this->getJson('/api/v1/steam/start')->assertUnauthorized();
        $this->deleteJson('/api/v1/steam/link')->assertUnauthorized();
    }

    public function test_criacao_de_competicao_exige_autenticacao(): void
    {
        $this->postJson('/api/v1/competicoes', [])->assertUnauthorized();
    }
}
