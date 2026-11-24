<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Logo do Laravel"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Status da compilação"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total de downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Versão estável mais recente"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="Licença"></a>
</p>

## Sobre o Laravel

Laravel é um framework para aplicações web com uma sintaxe expressiva e elegante.
Acreditamos que desenvolver deve ser uma experiência agradável e criativa. O
Laravel facilita tarefas comuns em muitos projetos web, como:

- [Mecanismo de rotas simples e rápido](https://laravel.com/docs/routing).
- [Contêiner poderoso de injeção de dependências](https://laravel.com/docs/container).
- Diferentes opções de armazenamento para [sessões](https://laravel.com/docs/session) e [cache](https://laravel.com/docs/cache).
- ORM intuitivo e expressivo para bancos de dados ([Eloquent](https://laravel.com/docs/eloquent)).
- [Migrações de esquema](https://laravel.com/docs/migrations) independentes do banco de dados.
- [Processamento robusto de tarefas em segundo plano](https://laravel.com/docs/queues).
- [Transmissão de eventos em tempo real](https://laravel.com/docs/broadcasting).

O Laravel é acessível, poderoso e oferece as ferramentas necessárias para
aplicações robustas de grande porte.

## Aprenda Laravel

O Laravel tem uma [documentação abrangente](https://laravel.com/docs) e uma
biblioteca de tutoriais em vídeo que facilitam o início no framework.

Você também pode experimentar o [Laravel Bootcamp](https://bootcamp.laravel.com),
que orienta a criação de uma aplicação Laravel moderna desde o início.

Se preferir aprender por vídeos, acesse o [Laracasts](https://laracasts.com).
O Laracasts oferece milhares de tutoriais sobre Laravel, PHP moderno, testes
unitários e JavaScript.

## Patrocinadores do Laravel

Agradecemos aos patrocinadores que financiam o desenvolvimento do Laravel.
Para saber como se tornar um patrocinador, visite o
[programa Laravel Partners](https://partners.laravel.com).

### Parceiros premium

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Como contribuir

Obrigado por considerar contribuir com o framework Laravel. O guia de
contribuição está disponível na [documentação do Laravel](https://laravel.com/docs/contributions).

## Código de conduta

Para ajudar a manter uma comunidade acolhedora para todas as pessoas, leia e
siga o [Código de conduta](https://laravel.com/docs/contributions#code-of-conduct).

## Vulnerabilidades de segurança

Se descobrir uma vulnerabilidade de segurança no Laravel, envie um e-mail
para Taylor Otwell pelo endereço [taylor@laravel.com](mailto:taylor@laravel.com).
Todas as vulnerabilidades serão tratadas prontamente.

## Licença

O framework Laravel é um software de código aberto, distribuído sob a
[licença MIT](https://opensource.org/licenses/MIT).

## Competições estruturadas

Competições antigas e novas sem modo informado permanecem no modo `personalizado`. A migration `2026_10_23_000000_add_structured_fields_to_competicoes.php` adiciona modo/formato, configurações e partidas sem alterar as inscrições existentes. Execute `php artisan migrate` no ambiente PostgreSQL/Supabase configurado antes de publicar a nova API.

No mata-mata, participantes aprovados são ordenados pela data de inscrição e pelo ID da inscrição. A chave emparelha participantes consecutivos nessa ordem. Alterar o resultado de uma fase invalida os resultados das fases seguintes dependentes; empate não é aceito em partidas eliminatórias. A disputa de terceiro lugar é composta pelos perdedores das semifinais.

Na classificação por pontos, vitórias valem 3 pontos, empates 1 e derrotas 0. O desempate é: pontos (maior), vitórias (maior), empates (maior), derrotas (menor) e ordem de inscrição (mais antiga primeiro). Não são calculados gols ou saldo.

Endpoints autenticados:

- `GET /api/v1/competicoes/{id}/resultados`: partidas, pódio ou classificação.
- `POST /api/v1/competicoes/{id}/chave`: gera a chave de mata-mata quando o total de participantes aprovados corresponde ao formato.
- `POST /api/v1/competicoes/{id}/partidas`: cria confronto de pontos com `rodada`, `participante_a_id` e `participante_b_id`.
- `PUT /api/v1/competicoes/{id}/partidas/{partidaId}/resultado`: registra `resultado` como `a`, `b` ou `empate` (empate somente por pontos).
- `PUT /api/v1/competicoes/{id}/podio`: grava os IDs aprovados em `primeiro_lugar_id`, `segundo_lugar_id` e `terceiro_lugar_id` para o modo personalizado.

A geração e as alterações de resultado são transacionais. Somente o organizador ou um administrador pode gerar partidas e alterá-las; após a data de encerramento não são aceitas alterações de partidas. O organizador pode concluir o pódio manual de uma competição personalizada após o encerramento.

## Testes PHPUnit

Execute os testes a partir da pasta `projeto_back`:

```powershell
php artisan test
```

O resultado aparece no terminal, com o total de testes aprovados ou reprovados.
Os testes cobrem autenticação, autorização de rotas e do chat, emissão de
token Firebase, validação do cadastro de equipes e competições, formato de
mata-mata, classificação por pontos, data de encerramento, pódio manual e
rótulos de status das sessões. Para rodar somente os testes de chat:

```powershell
php artisan test --filter=ChatTest
```

Para rodar somente os testes de validação de competições:

```powershell
php artisan test --filter=CompeticaoValidacaoTest
```
