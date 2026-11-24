<?php

namespace Tests\Feature;

use App\Models\Equipe;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RankingTest extends TestCase
{
    use RefreshDatabase;

    public function test_ranking_retorna_no_maximo_cinco_usuarios_e_equipes_em_ordem_de_pontos(): void
    {
        $usuarios = Usuario::factory()->count(6)->create();
        foreach ($usuarios as $index => $usuario) {
            DB::table('usuarios')
                ->where('id', $usuario->id)
                ->update(['pontos' => ($index + 1) * 10]);
        }

        $equipes = Equipe::factory()->count(6)->create();
        foreach ($equipes as $index => $equipe) {
            DB::table('equipes')
                ->where('id', $equipe->id)
                ->update(['pontos' => ($index + 1) * 5]);
        }

        $resposta = $this->getJson('/api/v1/ranking')
            ->assertOk()
            ->assertJsonCount(5, 'usuarios')
            ->assertJsonCount(5, 'equipes')
            ->assertJsonMissingPath('usuarios.0.email')
            ->assertJsonMissingPath('equipes.0.administrador');

        $this->assertSame(
            $usuarios->last()->id,
            $resposta->json('usuarios.0.id'),
        );
        $this->assertSame(
            $equipes->last()->id,
            $resposta->json('equipes.0.id'),
        );
    }

    public function test_pontuacoes_nulas_sao_incluidas_como_ultimas_no_ranking(): void
    {
        $usuarioPontuado = Usuario::factory()->create();
        $usuarioNulo = Usuario::factory()->create();
        $equipePontuada = Equipe::factory()->create();
        $equipeNula = Equipe::factory()->create();

        DB::table('usuarios')->where('id', $usuarioPontuado->id)->update(['pontos' => 3]);
        DB::table('usuarios')->where('id', $usuarioNulo->id)->update(['pontos' => null]);
        DB::table('equipes')->where('id', $equipePontuada->id)->update(['pontos' => 3]);
        DB::table('equipes')->where('id', $equipeNula->id)->update(['pontos' => null]);

        $this->getJson('/api/v1/ranking')
            ->assertOk()
            ->assertJsonPath('usuarios.0.id', $usuarioPontuado->id)
            ->assertJsonPath('usuarios.1.pontos', null)
            ->assertJsonPath('equipes.0.id', $equipePontuada->id)
            ->assertJsonPath('equipes.1.pontos', null);
    }
}
