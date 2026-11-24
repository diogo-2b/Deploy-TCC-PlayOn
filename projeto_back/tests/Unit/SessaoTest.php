<?php

namespace Tests\Unit;

use App\Models\Sessao;
use Tests\TestCase;

class SessaoTest extends TestCase
{
    public function test_status_da_sessao_e_exibido_em_portugues(): void
    {
        $sessao = new Sessao(['status' => 'aberta']);
        $this->assertSame('Aberta', $sessao->status_label);

        $sessao->status = 'fechada';
        $this->assertSame('Fechada', $sessao->status_label);

        $sessao->status = 'encerrada';
        $this->assertSame('Encerrada', $sessao->status_label);
    }

    public function test_status_desconhecido_da_sessao_e_exibido_como_aberto(): void
    {
        $sessao = new Sessao(['status' => 'status-desconhecido']);

        $this->assertSame('Aberta', $sessao->status_label);
    }
}
