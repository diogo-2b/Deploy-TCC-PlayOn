<?php

namespace App\Services;

use App\Models\Competicao;
use App\Models\CompeticaoPartida;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompeticaoResultadosService
{
    private const FASES_MATA_MATA = [
        'oitavas' => 16,
        'quartas' => 8,
        'semifinais' => 4,
        'final' => 2,
    ];

    public function participantesAprovados(Competicao $competicao): Collection
    {
        $participantes = $competicao->participantes()
            ->where('aprovado', true)
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        $tipoEsperado = $competicao->inscricao ? 'equipe' : 'usuario';
        if ($competicao->modo === 'estruturado'
            && $participantes->contains(fn ($participante) => $participante->tipo_participante !== $tipoEsperado)) {
            throw ValidationException::withMessages([
                'participantes' => 'A competição possui participantes de um tipo incompatível com sua configuração.',
            ]);
        }

        return $participantes;
    }

    public function gerarChave(Competicao $competicao): void
    {
        DB::transaction(function () use ($competicao) {
            $competicao = Competicao::query()->lockForUpdate()->findOrFail($competicao->id);
            $this->validarFormato($competicao, 'mata_mata');

            if ($competicao->partidas()->exists()) {
                throw ValidationException::withMessages([
                    'partidas' => 'A estrutura de partidas já foi gerada.',
                ]);
            }

            $participantes = $this->participantesAprovados($competicao);
            $quantidade = (int) $competicao->quantidade_participantes;
            $quantidadesPorFormato = [
                'mata_mata_4' => 4,
                'mata_mata_8' => 8,
                'mata_mata_16' => 16,
            ];
            $esperada = $quantidadesPorFormato[$competicao->formato] ?? null;
            if (!$esperada || $quantidade !== $esperada || $participantes->count() !== $esperada) {
                throw ValidationException::withMessages([
                    'participantes' => 'A quantidade de participantes aprovados deve corresponder ao formato da chave.',
                ]);
            }

            $faseInicial = array_search($quantidade, self::FASES_MATA_MATA, true);
            $fases = array_slice(array_keys(self::FASES_MATA_MATA), array_search($faseInicial, array_keys(self::FASES_MATA_MATA), true));
            foreach ($fases as $fase) {
                $totalPartidas = intdiv(self::FASES_MATA_MATA[$fase], 2);
                for ($numero = 1; $numero <= $totalPartidas; $numero++) {
                    $partida = [
                        'competicao_id' => $competicao->id,
                        'fase' => $fase,
                        'rodada' => 0,
                        'numero_partida' => $numero,
                    ];

                    if ($fase === $faseInicial) {
                        $a = $participantes[($numero * 2) - 2];
                        $b = $participantes[($numero * 2) - 1];
                        $partida += [
                            'participante_a_tipo' => $a->tipo_participante,
                            'participante_a_id' => $a->id_participante,
                            'participante_b_tipo' => $b->tipo_participante,
                            'participante_b_id' => $b->id_participante,
                        ];
                    }

                    CompeticaoPartida::create($partida);
                }
            }

            CompeticaoPartida::create([
                'competicao_id' => $competicao->id,
                'fase' => 'terceiro_lugar',
                'numero_partida' => 1,
            ]);
        });
    }

    public function criarPartidaDePontos(Competicao $competicao, int $rodada, int $participanteA, int $participanteB): CompeticaoPartida
    {
        return DB::transaction(function () use ($competicao, $rodada, $participanteA, $participanteB) {
            $competicao = Competicao::query()->lockForUpdate()->findOrFail($competicao->id);
            $this->validarFormato($competicao, 'pontos');

            $participantes = $this->participantesAprovados($competicao);
            if ($participantes->count() !== (int) $competicao->quantidade_participantes) {
                throw ValidationException::withMessages([
                    'participantes' => 'A quantidade configurada de participantes aprovados ainda não foi atingida.',
                ]);
            }

            if ($rodada < 1 || $rodada > (int) $competicao->numero_rodadas) {
                throw ValidationException::withMessages([
                    'rodada' => 'A rodada deve estar dentro do intervalo configurado.',
                ]);
            }

            $a = $participantes->firstWhere('id_participante', $participanteA);
            $b = $participantes->firstWhere('id_participante', $participanteB);
            if (!$a || !$b || $a->tipo_participante !== $b->tipo_participante
                || (int) $a->id_participante === (int) $b->id_participante) {
                throw ValidationException::withMessages([
                    'participantes' => 'Selecione dois participantes aprovados e diferentes.',
                ]);
            }

            $parDuplicado = $competicao->partidas()
                ->where('fase', 'rodada')
                ->where('rodada', $rodada)
                ->where(function ($query) use ($participanteA, $participanteB) {
                    $query->where(function ($query) use ($participanteA, $participanteB) {
                        $query->where('participante_a_id', $participanteA)
                            ->where('participante_b_id', $participanteB);
                    })->orWhere(function ($query) use ($participanteA, $participanteB) {
                        $query->where('participante_a_id', $participanteB)
                            ->where('participante_b_id', $participanteA);
                    });
                })
                ->exists();
            if ($parDuplicado) {
                throw ValidationException::withMessages([
                    'participantes' => 'Este confronto já foi cadastrado nesta rodada.',
                ]);
            }

            $numero = (int) $competicao->partidas()
                ->where('fase', 'rodada')
                ->where('rodada', $rodada)
                ->max('numero_partida') + 1;

            return CompeticaoPartida::create([
                'competicao_id' => $competicao->id,
                'fase' => 'rodada',
                'rodada' => $rodada,
                'numero_partida' => $numero,
                'participante_a_tipo' => $a->tipo_participante,
                'participante_a_id' => $a->id_participante,
                'participante_b_tipo' => $b->tipo_participante,
                'participante_b_id' => $b->id_participante,
            ]);
        });
    }

    public function registrarResultado(Competicao $competicao, CompeticaoPartida $partida, string $resultado): CompeticaoPartida
    {
        return DB::transaction(function () use ($competicao, $partida, $resultado) {
            $competicao = Competicao::query()->lockForUpdate()->findOrFail($competicao->id);
            $partida = $competicao->partidas()->lockForUpdate()->findOrFail($partida->id);

            if (!$partida->participante_a_id || !$partida->participante_b_id) {
                throw ValidationException::withMessages([
                    'resultado' => 'Esta partida ainda aguarda os participantes da fase anterior.',
                ]);
            }

            if (!in_array($resultado, ['a', 'b', 'empate'], true)) {
                throw ValidationException::withMessages([
                    'resultado' => 'Selecione um resultado válido.',
                ]);
            }

            $mataMata = str_starts_with((string) $competicao->formato, 'mata_mata_');
            if ($mataMata && $resultado === 'empate') {
                throw ValidationException::withMessages([
                    'resultado' => 'Partidas eliminatórias exigem um vencedor definitivo.',
                ]);
            }

            if ($partida->fase === 'rodada' && $resultado === 'empate' && $competicao->formato !== 'pontos') {
                throw ValidationException::withMessages(['resultado' => 'Empate só é permitido na classificação por pontos.']);
            }

            if ($mataMata && $partida->resultado !== $resultado && $partida->fase !== 'final') {
                $ordem = array_flip(array_keys(self::FASES_MATA_MATA));
                $ordem['terceiro_lugar'] = count(self::FASES_MATA_MATA);
                $faseAtual = $ordem[$partida->fase] ?? -1;
                $competicao->partidas()
                    ->whereIn('fase', array_keys(array_filter($ordem, fn ($faseOrdem) => $faseOrdem > $faseAtual)))
                    ->update(['resultado' => null]);
            }

            $partida->update(['resultado' => $resultado]);

            if ($mataMata) {
                $this->recalcularAvanco($competicao);
            }

            return $partida->fresh();
        });
    }

    public function classificacao(Competicao $competicao): array
    {
        $tabela = [];
        foreach ($this->participantesAprovados($competicao) as $participante) {
            $key = $participante->tipo_participante . ':' . $participante->id_participante;
            $tabela[$key] = [
                'participante' => $this->participanteArray($participante->tipo_participante, $participante->id_participante),
                'partidas' => 0,
                'vitorias' => 0,
                'empates' => 0,
                'derrotas' => 0,
                'pontos' => 0,
                'ordem_inscricao' => [
                    $participante->created_at->getTimestamp(),
                    (int) $participante->id,
                ],
            ];
        }

        $partidas = $competicao->partidas()
            ->where('fase', 'rodada')
            ->whereNotNull('resultado')
            ->get();

        foreach ($partidas as $partida) {
            $a = $partida->participante_a_tipo . ':' . $partida->participante_a_id;
            $b = $partida->participante_b_tipo . ':' . $partida->participante_b_id;
            if (!isset($tabela[$a], $tabela[$b])) {
                continue;
            }

            $tabela[$a]['partidas']++;
            $tabela[$b]['partidas']++;
            if ($partida->resultado === 'empate') {
                foreach ([$a, $b] as $key) {
                    $tabela[$key]['empates']++;
                    $tabela[$key]['pontos']++;
                }
            } else {
                $vencedor = $partida->resultado === 'a' ? $a : $b;
                $perdedor = $vencedor === $a ? $b : $a;
                $tabela[$vencedor]['vitorias']++;
                $tabela[$vencedor]['pontos'] += 3;
                $tabela[$perdedor]['derrotas']++;
            }
        }

        $tabela = array_values($tabela);
        usort($tabela, function ($a, $b) {
            foreach (['pontos', 'vitorias', 'empates'] as $campo) {
                $comparacao = $b[$campo] <=> $a[$campo];
                if ($comparacao !== 0) {
                    return $comparacao;
                }
            }

            $comparacaoDerrotas = $a['derrotas'] <=> $b['derrotas'];
            return $comparacaoDerrotas !== 0
                ? $comparacaoDerrotas
                : ($a['ordem_inscricao'] <=> $b['ordem_inscricao']);
        });

        foreach ($tabela as $index => &$linha) {
            unset($linha['ordem_inscricao']);
            $linha['posicao'] = $index + 1;
        }

        return $tabela;
    }

    public function dadosDaCompeticao(Competicao $competicao): array
    {
        $partidas = $competicao->partidas()
            ->orderByRaw("CASE fase WHEN 'oitavas' THEN 1 WHEN 'quartas' THEN 2 WHEN 'semifinais' THEN 3 WHEN 'final' THEN 4 WHEN 'terceiro_lugar' THEN 5 ELSE 6 END")
            ->orderBy('rodada')
            ->orderBy('numero_partida')
            ->get()
            ->map(fn (CompeticaoPartida $partida) => [
                'id' => $partida->id,
                'fase' => $partida->fase,
                'rodada' => $partida->fase === 'rodada' ? $partida->rodada : null,
                'numero_partida' => $partida->numero_partida,
                'participante_a' => $partida->participante_a_id
                    ? $this->participanteArray($partida->participante_a_tipo, $partida->participante_a_id)
                    : null,
                'participante_b' => $partida->participante_b_id
                    ? $this->participanteArray($partida->participante_b_tipo, $partida->participante_b_id)
                    : null,
                'resultado' => $partida->resultado,
                'concluida' => $partida->resultado !== null,
            ]);

        $podio = $this->podio($competicao);

        return [
            'partidas' => $partidas,
            'classificacao' => $competicao->formato === 'pontos' ? $this->classificacao($competicao) : [],
            'podio' => $podio,
        ];
    }

    public function definirPodioPersonalizado(Competicao $competicao, array $lugares): void
    {
        DB::transaction(function () use ($competicao, $lugares) {
            $competicao = Competicao::query()->lockForUpdate()->findOrFail($competicao->id);
            if ($competicao->modo !== 'personalizado') {
                throw ValidationException::withMessages([
                    'modo' => 'O pódio manual está disponível apenas no modo personalizado.',
                ]);
            }

            $selecionados = array_map('intval', array_values(array_filter($lugares)));
            if (count($selecionados) !== count(array_unique($selecionados))) {
                throw ValidationException::withMessages(['podio' => 'Cada participante pode ocupar apenas uma posição.']);
            }

            $aprovados = $this->participantesAprovados($competicao);
            foreach ($lugares as $posicao => $id) {
                if ($id !== null && !$aprovados->contains(
                    fn ($participante) => (int) $participante->id_participante === (int) $id
                        && $participante->tipo_participante === ($competicao->inscricao ? 'equipe' : 'usuario')
                )) {
                    throw ValidationException::withMessages([
                        $posicao . '_lugar_id' => 'O participante deve estar aprovado nesta competição.',
                    ]);
                }
            }

            foreach (['primeiro', 'segundo', 'terceiro'] as $posicao) {
                $id = $lugares[$posicao . '_lugar_id'] ?? null;
                $competicao->update([
                    $posicao . '_lugar_id' => $id,
                    $posicao . '_lugar_tipo' => $id ? ($competicao->inscricao ? 'equipe' : 'usuario') : null,
                ]);
            }
        });
    }

    private function validarFormato(Competicao $competicao, string $formato): void
    {
        $formatoValido = $formato === 'mata_mata'
            ? str_starts_with((string) $competicao->formato, 'mata_mata_')
            : $competicao->formato === $formato;
        if ($competicao->modo !== 'estruturado' || !$formatoValido) {
            throw ValidationException::withMessages([
                'formato' => 'A operação não corresponde ao formato configurado para esta competição.',
            ]);
        }
    }

    private function recalcularAvanco(Competicao $competicao): void
    {
        $fases = array_keys(self::FASES_MATA_MATA);
        foreach ($fases as $index => $fase) {
            $proximaFase = $fases[$index + 1] ?? null;
            if (!$proximaFase) {
                break;
            }

            $partidasFase = $competicao->partidas()->where('fase', $fase)->orderBy('numero_partida')->get();
            $partidasProximas = $competicao->partidas()->where('fase', $proximaFase)->orderBy('numero_partida')->get();
            foreach ($partidasFase as $partida) {
                $destino = $partidasProximas[intdiv($partida->numero_partida - 1, 2)] ?? null;
                if (!$destino) {
                    continue;
                }

                $lado = $partida->numero_partida % 2 === 1 ? 'a' : 'b';
                $participante = $partida->resultado === null
                    ? null
                    : ($partida->resultado === 'a'
                        ? ['tipo' => $partida->participante_a_tipo, 'id' => $partida->participante_a_id]
                        : ['tipo' => $partida->participante_b_tipo, 'id' => $partida->participante_b_id]);
                $destino->update([
                    'participante_' . $lado . '_tipo' => $participante['tipo'] ?? null,
                    'participante_' . $lado . '_id' => $participante['id'] ?? null,
                ]);

                if ($fase === 'semifinais') {
                    $terceiro = $competicao->partidas()->where('fase', 'terceiro_lugar')->first();
                    $perdedor = $partida->resultado === null
                        ? ['tipo' => null, 'id' => null]
                        : ($partida->resultado === 'a'
                            ? ['tipo' => $partida->participante_b_tipo, 'id' => $partida->participante_b_id]
                            : ['tipo' => $partida->participante_a_tipo, 'id' => $partida->participante_a_id]);
                    $terceiro?->update([
                        'participante_' . $lado . '_tipo' => $perdedor['tipo'],
                        'participante_' . $lado . '_id' => $perdedor['id'],
                    ]);
                }
            }
        }
    }

    private function participanteArray(string $tipo, int $id): array
    {
        $participante = $tipo === 'equipe'
            ? \App\Models\Equipe::find($id)
            : \App\Models\Usuario::find($id);

        return [
            'tipo' => $tipo,
            'id' => $id,
            'nome' => $tipo === 'equipe'
                ? ($participante?->nome ?? 'Equipe indisponível')
                : ($participante?->apelido ?? $participante?->nome ?? 'Usuário indisponível'),
        ];
    }

    private function podio(Competicao $competicao): array
    {
        if ($competicao->modo === 'estruturado' && str_starts_with((string) $competicao->formato, 'mata_mata_')) {
            $partidaFinal = $competicao->partidas()->where('fase', 'final')->first();
            $terceiroLugar = $competicao->partidas()->where('fase', 'terceiro_lugar')->first();

            return [
                'primeiro_lugar' => $this->vencedorArray($partidaFinal),
                'segundo_lugar' => $this->perdedorArray($partidaFinal),
                'terceiro_lugar' => $this->vencedorArray($terceiroLugar),
            ];
        }

        $podio = [];
        foreach (['primeiro', 'segundo', 'terceiro'] as $posicao) {
            $tipo = $competicao->{$posicao . '_lugar_tipo'};
            $id = $competicao->{$posicao . '_lugar_id'};
            $podio[$posicao . '_lugar'] = $tipo && $id ? $this->participanteArray($tipo, $id) : null;
        }

        return $podio;
    }

    private function vencedorArray(?CompeticaoPartida $partida): ?array
    {
        if (!$partida || !$partida->resultado) {
            return null;
        }

        $lado = $partida->resultado;
        return $this->participanteArray(
            $partida->{'participante_' . $lado . '_tipo'},
            (int) $partida->{'participante_' . $lado . '_id'}
        );
    }

    private function perdedorArray(?CompeticaoPartida $partida): ?array
    {
        if (!$partida || !$partida->resultado) {
            return null;
        }

        $lado = $partida->resultado === 'a' ? 'b' : 'a';
        return $this->participanteArray(
            $partida->{'participante_' . $lado . '_tipo'},
            (int) $partida->{'participante_' . $lado . '_id'}
        );
    }
}
