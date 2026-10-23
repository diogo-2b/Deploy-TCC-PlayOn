<?php

namespace Tests\Unit;

use App\Models\Competicao;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class CompeticaoTest extends TestCase
{
    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_competicao_termina_ao_final_do_dia_configurado(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 10, 22, 23, 59, 59, 'America/Sao_Paulo'));

        $competicao = new Competicao(['data_encerramento' => '2026-10-22']);

        $this->assertFalse($competicao->isEncerrada());
    }

    public function test_competicao_anterior_ao_dia_atual_esta_encerrada(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 10, 23, 0, 0, 0, 'America/Sao_Paulo'));

        $competicao = new Competicao(['data_encerramento' => '2026-10-22']);

        $this->assertTrue($competicao->isEncerrada());
    }
}
