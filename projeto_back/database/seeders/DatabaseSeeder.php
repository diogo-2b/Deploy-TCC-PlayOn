<?php

namespace Database\Seeders;

use App\Models\Competicao;
use App\Models\Usuario;
use App\Models\Equipe;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Usuario::factory(10)->create();

        Usuario::factory()->create([
            'nome' => 'Test User',
            'email' => 'test@example.com',
            'apelido' => 'test_user',
            'password' => bcrypt('senha12345'),
        ]);

        Equipe::factory()->count(10)->create();

        Competicao::factory()->count(10)->create();
    }
}
