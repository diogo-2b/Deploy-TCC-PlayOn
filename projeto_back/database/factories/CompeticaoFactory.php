<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\Usuario;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Competicao>
 */
class CompeticaoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
        'nome' => $this->faker->company,
        'descricao' => $this->faker->paragraph,
        'imagem' => 'foto.png',
        'dono' => Usuario::inRandomOrder()->first()->id,
        'tipo' => $this->faker->boolean(30),
        'inscricao' => $this->faker->boolean(30),
    ];
    }
}
