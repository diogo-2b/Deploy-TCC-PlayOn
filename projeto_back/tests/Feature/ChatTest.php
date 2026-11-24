<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Services\ChatAuthorizationService;
use App\Services\FirebaseService;
use Mockery\MockInterface;
use Tests\TestCase;

class ChatTest extends TestCase
{
    public function test_acessar_chat_exige_autenticacao(): void
    {
        $this->getJson('/api/v1/chats/sessao/42/access')->assertUnauthorized();
        $this->postJson('/api/v1/auth/firebase-token')->assertUnauthorized();
    }

    public function test_token_firebase_exige_conta_vinculada(): void
    {
        $this->mock(FirebaseService::class, function (MockInterface $mock): void {
            $mock->shouldNotReceive('createCustomToken');
        });

        $this->actingAs($this->usuario(''), 'sanctum')
            ->postJson('/api/v1/auth/firebase-token')
            ->assertUnprocessable();
    }

    public function test_emite_token_firebase_para_usuario_vinculado(): void
    {
        $this->mock(FirebaseService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('createCustomToken')
                ->once()
                ->with('firebase-uid-8')
                ->andReturn('token-personalizado');
        });

        $this->actingAs($this->usuario('firebase-uid-8'), 'sanctum')
            ->postJson('/api/v1/auth/firebase-token')
            ->assertOk()
            ->assertExactJson(['token' => 'token-personalizado']);
    }

    public function test_autoriza_usuario_membro_do_chat(): void
    {
        $this->mock(ChatAuthorizationService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('isAuthorized')
                ->once()
                ->withArgs(fn (string $type, int $id, Usuario $user): bool =>
                    $type === 'sessao'
                    && $id === 42
                    && (int) $user->id === 8
                )
                ->andReturn(true);
        });

        $this->actingAs($this->usuario('firebase-uid-8'), 'sanctum')
            ->getJson('/api/v1/chats/sessao/42/access')
            ->assertOk()
            ->assertExactJson([
                'authorized' => true,
                'firebase_uid' => 'firebase-uid-8',
            ]);
    }

    public function test_nega_acesso_quando_usuario_nao_e_membro_do_chat(): void
    {
        $this->mock(ChatAuthorizationService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('isAuthorized')->once()->andReturn(false);
        });

        $this->actingAs($this->usuario('firebase-uid-8'), 'sanctum')
            ->getJson('/api/v1/chats/equipe/42/access')
            ->assertForbidden()
            ->assertExactJson([
                'authorized' => false,
                'firebase_uid' => null,
            ]);
    }

    public function test_rejeita_tipo_de_chat_desconhecido(): void
    {
        $this->mock(ChatAuthorizationService::class, function (MockInterface $mock): void {
            $mock->shouldNotReceive('isAuthorized');
        });

        $this->actingAs($this->usuario('firebase-uid-8'), 'sanctum')
            ->getJson('/api/v1/chats/desconhecido/42/access')
            ->assertNotFound();
    }

    private function usuario(?string $firebaseUid): Usuario
    {
        $user = new Usuario();
        $user->forceFill([
            'id' => 8,
            'firebase_uid' => $firebaseUid,
        ]);

        return $user;
    }
}
