<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Usuario>
 */
class UsuarioFactory extends Factory
{
    public function definition(): array
    {
        $nome = fake()->name();
        return [
            'apelido' => Str::slug($nome, '_'),
            'nome' => $nome,
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'is_admin' => false,
        ];
    }

    public function admin(): static
    {
        return $this->state(fn(array $attributes) => ['is_admin' => true]);
    }
}
