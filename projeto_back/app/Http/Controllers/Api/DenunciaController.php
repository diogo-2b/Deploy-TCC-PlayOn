<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DenunciaStoreRequest;
use App\Models\Competicao;
use App\Models\Denuncia;
use App\Models\Equipe;
use App\Models\Usuario;

class DenunciaController extends Controller
{
    public function store(DenunciaStoreRequest $request)
    {
        $denuncia = Denuncia::create([
            'id_usuario' => $request->user()->id,
            ...$request->validated(),
        ]);

        return response()->json([
            'message' => 'Denúncia registrada com sucesso.',
            'denuncia' => $denuncia,
        ], 201);
    }

    public function index()
    {
        $denuncias = Denuncia::query()
            ->with(['usuario:id,apelido,nome,imagem'])
            ->latest()
            ->get();

        $idsPorTipo = $denuncias->groupBy('tipo')->map(
            fn ($items) => $items->pluck('id_denunciado')->unique()->values()
        );

        $alvos = [
            'Equipe' => Equipe::whereIn('id', $idsPorTipo->get('Equipe', []))
                ->get(['id', 'nome', 'imagem'])
                ->keyBy('id'),
            'Competicao' => Competicao::whereIn('id', $idsPorTipo->get('Competicao', []))
                ->get(['id', 'nome', 'imagem'])
                ->keyBy('id'),
            'Usuario' => Usuario::whereIn('id', $idsPorTipo->get('Usuario', []))
                ->get(['id', 'nome', 'apelido', 'imagem'])
                ->keyBy('id'),
        ];

        return response()->json([
            'data' => $denuncias->map(function (Denuncia $denuncia) use ($alvos) {
                $alvo = $alvos[$denuncia->tipo]->get($denuncia->id_denunciado);

                return [
                    'id' => $denuncia->id,
                    'tipo' => $denuncia->tipo,
                    'id_denunciado' => $denuncia->id_denunciado,
                    'mensagem' => $denuncia->mensagem,
                    'resolvida' => $denuncia->resolvida,
                    'created_at' => $denuncia->created_at,
                    'denunciante' => $this->usuarioData($denuncia->usuario),
                    'alvo' => $this->alvoData($denuncia->tipo, $alvo),
                ];
            }),
        ]);
    }

    public function resolve(Denuncia $denuncia)
    {
        if (!$denuncia->resolvida) {
            $denuncia->update(['resolvida' => true]);
        }

        return response()->json([
            'message' => 'Denúncia marcada como resolvida.',
            'resolvida' => true,
        ]);
    }

    private function usuarioData(?Usuario $usuario): ?array
    {
        if (!$usuario) {
            return null;
        }

        return [
            'id' => $usuario->id,
            'apelido' => $usuario->apelido,
            'imagem_url' => $usuario->imagem_url,
        ];
    }

    private function alvoData(string $tipo, $alvo): ?array
    {
        if (!$alvo) {
            return null;
        }

        $data = [
            'id' => $alvo->id,
            'nome' => $tipo === 'Usuario'
                ? ($alvo->apelido ?: $alvo->nome)
                : $alvo->nome,
            'imagem_url' => $alvo->imagem_url,
        ];

        return $data;
    }
}
