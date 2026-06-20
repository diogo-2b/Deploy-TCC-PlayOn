<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\Usuario;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Equipe>
 */
class EquipeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // garante que exista um usuário administrador; cria um se necessário
        $usuario = Usuario::inRandomOrder()->first() ?? Usuario::factory()->create();

        return [
            'nome' => $this->faker->company,
            'descricao' => $this->faker->paragraph,
            'imagem' => 'foto.png',
            'administrador' => $usuario->id,
            'tipo' => $this->faker->boolean(30),
        ];
    }
}
