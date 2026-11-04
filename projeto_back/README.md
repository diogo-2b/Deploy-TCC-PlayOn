<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

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
