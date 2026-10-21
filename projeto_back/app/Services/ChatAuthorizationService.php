<?php

namespace App\Services;

use App\Models\Competicao;
use App\Models\Equipe;
use App\Models\Usuario;
use App\Models\Sessao;
use Illuminate\Support\Collection;

class ChatAuthorizationService
{
    public function __construct(private readonly FirebaseService $firebase)
    {
    }

    public function synchronize(string $type, int $entityId): Collection
    {
        $users = match ($type) {
            'equipe' => $this->teamUsers(Equipe::with(['usuario', 'membros.usuario'])->findOrFail($entityId)),
            'competicao' => $this->competitionUsers(Competicao::with([
                'usuario',
                'usuariosParticipantes.participante',
                'equipasParticipantes.equipe.usuario',
                'equipasParticipantes.equipe.membros.usuario',
            ])->findOrFail($entityId)),
            'sessao' => $this->sessionUsers(Sessao::with(['criador', 'jogadores'])->findOrFail($entityId)),
            default => abort(404),
        };

        $chatKey = "{$type}_{$entityId}";
        $membersPath = "chat_access/{$chatKey}/members";

        $allowedUids = [];
        foreach ($users as $user) {
            if (!$user->firebase_uid) {
                continue;
            }

            $allowedUids[] = $user->firebase_uid;
            $this->firebase->firestoreSet("{$membersPath}/{$user->firebase_uid}", [
                'user_id' => (string) $user->id,
                'entity_id' => (string) $entityId,
                'chat_type' => $type,
                'display_name' => $user->apelido ?: $user->nome ?: "Usuário {$user->id}",
                'image_url' => $user->imagem_url ?: '',
                'updated_at' => now()->toIso8601String(),
            ]);
        }

        foreach ($this->firebase->firestoreList($membersPath) as $document) {
            $documentId = basename($document['name'] ?? '');
            if ($documentId && !in_array($documentId, $allowedUids, true)) {
                $this->firebase->firestoreDelete("{$membersPath}/{$documentId}");
            }
        }

        return $users;
    }

    private function teamUsers(Equipe $team): Collection
    {
        return collect([$team->usuario])
            ->merge($team->membros
                ->where('aprovado', true)
                ->pluck('usuario'))
            ->filter()
            ->unique('id')
            ->values();
    }

    private function competitionUsers(Competicao $competition): Collection
    {
        $users = collect([$competition->usuario])
            ->merge($competition->usuariosParticipantes
                ->where('aprovado', true)
                ->pluck('participante'));

        foreach ($competition->equipasParticipantes->where('aprovado', true) as $participant) {
            if (!$participant->equipe) {
                continue;
            }

            $users->push($participant->equipe->usuario);
            $users = $users->merge($participant->equipe->membros
                ->where('aprovado', true)
                ->pluck('usuario'));
        }

        return $users->filter()->unique('id')->values();
    }

    private function sessionUsers(Sessao $session): Collection
    {
        return collect([$session->criador])
            ->merge($session->jogadores)
            ->filter()
            ->unique('id')
            ->values();
    }

    public function isAuthorized(string $type, int $entityId, Usuario $user): bool
    {
        $this->synchronize($type, $entityId);
        return $user->firebase_uid !== null
            && $this->firebase->firestoreGet(
                "chat_access/{$type}_{$entityId}/members/{$user->firebase_uid}"
            ) !== null;
    }
}
