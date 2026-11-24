<?php

namespace Tests\Unit;

use App\Models\Competicao;
use Tests\TestCase;

class CompeticaoDefaultImageTest extends TestCase
{
    public function test_competicao_sem_imagem_usa_a_imagem_padrao_de_competicao(): void
    {
        $url = 'https://res.cloudinary.com/ddpuzfnbd/image/upload/v1795490150/playon/competicoes/27a69830-8495-490a-ba21-9ca5ae0c7c29.png';
        config(['app.default_competition_image_url' => $url]);

        $competicao = new Competicao(['imagem' => null]);

        $this->assertSame($url, $competicao->imagem_url);
    }
}
