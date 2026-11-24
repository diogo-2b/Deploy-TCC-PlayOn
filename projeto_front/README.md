# Front-end PlayOn (React + Vite)

O front-end do PlayOn usa React com Vite, recarregamento rápido durante o
desenvolvimento (HMR) e regras de análise de código com ESLint.

Há dois plugins oficiais disponíveis para React:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) usa [Babel](https://babeljs.io/) para o recarregamento rápido.
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) usa [SWC](https://swc.rs/) para o recarregamento rápido.

## Configuração do ESLint

Para aplicações em produção, recomendamos usar TypeScript com regras de lint
que considerem os tipos. Consulte o [modelo de React com TypeScript](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)
para saber como integrar TypeScript e [`typescript-eslint`](https://typescript-eslint.io)
ao projeto.

## Testes E2E com Cypress

Os testes E2E cobrem os principais fluxos do site:

- **Acesso e perfil:** validação do login, confirmação de e-mail, alteração de
  dados e tratamento de erros.
- **Pesquisa:** resultados de competições, equipes, usuários e sessões; busca
  sem resultados e limpeza com Escape.
- **Steam:** estado da conta, jogos recentes, início e cancelamento da
  vinculação, retorno após autenticação e desvinculação.
- **Chat:** abertura do chat da sessão e exibição de erro quando não é possível
  obter o token de conexão.
- **Proteção contra cadastros duplicados:** envia rapidamente formulários de
  competição, equipe e sessão várias vezes e confirma que cada um cria apenas
  uma requisição.
- **Equipes:** campos obrigatórios, sucesso no cadastro e erro da API.
- **Competições:** campos obrigatórios, busca e seleção de jogos, criação no
  formato por pontos, inscrições públicas e privadas, aprovação de
  participantes e equipes, edição, geração de chave eliminatória, avanço dos
  vencedores, criação de confrontos e classificação por pontos, registro do
  terceiro lugar, pódio manual e rejeição de pódio duplicado.

## Testes do chat

O componente do chat é testado com Vitest e simulações do Firebase, cobrindo
conexão para sessões, equipes e competições, recebimento e envio de mensagens,
permissão de acesso e tratamento de falhas. Execute os testes a partir de
`projeto_front`:

```powershell
npm.cmd run test -- --run src/test/chat.test.jsx
```

Se as dependências ainda não estiverem instaladas, execute `npm.cmd install`.

1. No terminal do PowerShell, entre em `projeto_front` e inicie o Vite:
   `npm.cmd run dev`
2. Em outro terminal, também em `projeto_front`, rode os testes:
   `npm.cmd run test:e2e`

O Cypress inicia o navegador em modo sem interface gráfica (headless) e mostra
no terminal quais testes foram aprovados ou reprovados. Para acompanhar a
execução na interface do Cypress, use `npm.cmd run test:e2e:open`.
Para executar somente o teste E2E do chat, use
`npm.cmd run test:e2e -- --spec cypress/e2e/chat.cy.js`.
Para executar somente os testes contra envios repetidos, use
`npm.cmd run test:e2e -- --spec cypress/e2e/cadastros-unicos.cy.js`.

## Testes de acessibilidade

O spec `cypress/e2e/acessibilidade.cy.js` usa axe-core para verificar as telas
de acesso, página inicial, edição e visualização de perfil, cadastro de equipe,
competição, sessão e o painel do chat segundo os critérios WCAG 2.1 AA.
Execute-o com:

```powershell
npm.cmd run test:e2e -- --spec cypress/e2e/acessibilidade.cy.js
```

Os testes simulam as respostas da API; não é necessário iniciar o back-end nem
usar contas reais. A suíte de testes de componentes existente continua
disponível com `npm.cmd run test -- --run`.
