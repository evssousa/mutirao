# Mutirão

Sistema de gestão de demandas de tecnologia da escola e da comunidade, operado pelos alunos do curso de TI.

Professores e a comunidade pedem coisas — um sistema, a manutenção de um laboratório, a instalação de máquinas na secretaria. O Mutirão transforma esses pedidos em requisitos, distribui entre os alunos com prazo e responsável, e acompanha até a entrega. O objetivo é que o aluno viva o ciclo real de uma empresa de desenvolvimento: receber um requisito de outra pessoa, estimar, trabalhar em fork, abrir Pull Request, passar por code review e ter a entrega homologada.

## Sobre este projeto

Este é um **projeto pessoal**, criado e mantido por mim, professor de TI, para organizar as demandas de tecnologia da escola onde leciono e para dar aos meus alunos uma experiência próxima à de uma empresa de desenvolvimento de software.

A escola usa o sistema; a autoria e a manutenção são minhas.

**Contribuições de alunos são bem-vindas e creditadas.** Cada commit fica no histórico com o nome de quem o fez — o trabalho de vocês aqui é portfólio real, público e verificável.

**Os dados são da escola, não deste repositório.** Cadastro de alunos, demandas, evidências e áudios de prova pertencem à escola e às pessoas envolvidas. Nada disso é versionado aqui, e nada disso pode ser commitado.

## Status

Em desenvolvimento — **Fase 0 (Fundação)**. Ainda não aberto para turmas.

Roadmap completo em [`docs/plan.md`](docs/plan.md).

## Stack

React (Vite) · Node · Prisma · Postgres (Neon) · Vercel · GitHub OAuth

## Repositório público — leia antes de commitar

Este repositório é público. **Nada sensível entra aqui.** Sem dado pessoal de aluno, sem foto de laboratório, sem áudio de prova, sem `.env`, sem token, sem string de conexão. Na dúvida, pergunte antes de commitar.

## Rodando localmente

```bash
git clone https://github.com/SEU-USUARIO/mutirao.git
cd mutirao
npm install
cp .env.example .env    # preencha as variáveis
npm run db:migrate
npm run dev
```

Passo a passo detalhado, incluindo instalação do Node e obtenção das credenciais: [`docs/ambiente-de-desenvolvimento.md`](docs/ambiente-de-desenvolvimento.md).

## Documentação

Comece pelo guia do seu papel.

| Você é | Leia |
|---|---|
| Aluno desenvolvedor | [Guia do aluno](docs/guia-do-aluno.md) · [Convenções de Git](docs/convencoes-git.md) |
| Aluno da trilha de infra | [Guia do aluno — infraestrutura](docs/guia-do-aluno-infra.md) |
| Professor / Product Owner | [Guia do professor](docs/guia-do-professor.md) |
| Solicitante (secretaria, comunidade) | [Guia do solicitante](docs/guia-do-solicitante.md) |
| Perdido no vocabulário | [Glossário](docs/glossario.md) |
| Vai mexer no código | [Arquitetura](docs/arquitetura.md) · [Modelo de dados](docs/modelo-dados.md) |

Plano completo do projeto: [`docs/plan.md`](docs/plan.md).

## Como pedir acesso

O acesso é liberado por lista de permissão. Procure o professor responsável com o seu usuário do GitHub. O login no sistema não cria conta sozinho.

## Como contribuir

Alunos não têm push direto. O fluxo é **fork → branch → Pull Request**, com convenções obrigatórias:

- Branch: `feat/CODIGO-DA-DEMANDA-descricao-curta`
- Título da PR: `[CODIGO-DA-DEMANDA] O que foi feito`

O código da demanda entre colchetes é o que vincula a PR ao sistema. Sem ele, o status não atualiza sozinho.

Passo a passo completo em [`docs/convencoes-git.md`](docs/convencoes-git.md).

## Padrão de código

Este projeto será mantido por quem não o escreveu — o aluno do próximo bimestre, o professor do ano que vem. Por isso a prioridade aqui é **código simples e óbvio**, acima de código eficiente ou elegante. Nomes descritivos, funções curtas, e comentário explicando o *porquê* de tudo que não for evidente.

**Usar IA no desenvolvimento é permitido e incentivado** — Claude, ChatGPT, Copilot, o que ajudar. A regra é uma só: **você assina o que envia**. No review, você pode ser solicitado a explicar qualquer linha da sua PR. Não saber explicar devolve a PR, sem drama e sem punição, mas devolve.

Regras completas em [`docs/plan.md`](docs/plan.md), seção 13.

## Licença

[MIT](LICENSE) — decidida na Fase 0, antes da primeira PR de aluno, conforme [`docs/plan.md`](docs/plan.md), seção 9.1.1.
