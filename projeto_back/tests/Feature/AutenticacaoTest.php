<?php

namespace Tests\Feature;

use Tests\TestCase;

class AutenticacaoTest extends TestCase
{
    public function test_login_rejeita_credenciais_ausentes(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_rota_protegida_rejeita_requisicoes_sem_autenticacao(): void
    {
        $this->getJson('/api/v1/minhas-equipes')->assertUnauthorized();
    }
}
