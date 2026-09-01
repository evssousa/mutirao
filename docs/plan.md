# Mutirão — Plano do Projeto

> Documento vivo. Última atualização: 2026-09-01
> Local: `/docs/plan.md`

---

## 1. O projeto

### 1.1 Nome

**Mutirão.**

Mutirão é o nome que se dá, no Brasil, ao trabalho coletivo em que a comunidade se junta para resolver algo que é de todos. É exatamente o que o sistema organiza: alunos, professores, escola e comunidade num esforço conjunto, cada um assumindo uma parte.

O nome é curto, se escreve fácil, não vira sigla e não parece software de repartição.

| Item | Valor |
|---|---|
| Nome | Mutirão |
| Repositório | `mutirao` |
| URL de produção | `mutirao.vercel.app` |
| URL de homologação | `mutirao-homolog.vercel.app` |
| Prefixo das demandas de infraestrutura | `INFRA` |

Alternativas descartadas, caso queira reabrir a discussão: *Bancada*, *Pauta*, *Oficina*, *Guichê*. Nenhuma carregava a ideia de esforço coletivo com a mesma clareza.

Ao longo deste documento, "o sistema" e "o Mutirão" são a mesma coisa.

### 1.2 Objetivo

Construir um sistema web onde as demandas de tecnologia da escola e da comunidade são cadastradas, estimadas, distribuídas entre alunos e acompanhadas até a entrega — reproduzindo o funcionamento de uma empresa de desenvolvimento de software.

O sistema atende dois tipos de demanda:

- **Demandas de software** — requisitos que geram código, versionados no GitHub.
- **Demandas físicas / infraestrutura** — manutenção de laboratório, formatação de máquinas, instalação de equipamentos.

## 2. Objetivo pedagógico

O aluno deve sair do curso tendo praticado o ciclo real de trabalho:

- receber um requisito escrito por outra pessoa e interpretá-lo;
- estimar esforço e assumir um prazo;
- trabalhar em fork, abrir Pull Request e passar por code review;
- reportar progresso e impedimentos;
- ter a entrega homologada por um responsável antes de ser considerada concluída.

O sistema é o meio, não o fim. Toda decisão de produto deve ser avaliada por: *isso aproxima o aluno da prática de mercado?*

## 3. Premissas e decisões já tomadas

| Tema | Decisão |
|---|---|
| Fonte da verdade | Sistema próprio, **integrado à API do GitHub** (issues e PRs sincronizados) |
| Quem desenvolve o Mutirão | Professores/coordenação constroem o MVP antes de abrir aos alunos |
| Stack | React (Vite) no front, Node no back |
| Banco de dados | **Neon** (Postgres serverless). Supabase e Firebase descartados — ver seção 11 |
| Hospedagem | **Vercel**, em domínio `*.vercel.app` — ver seção 12.4 |
| Natureza do projeto | **Projeto pessoal do professor responsável**, criado para apoiar seu trabalho e seus alunos (seção 9.1.1) |
| Onde mora o repositório | Conta pessoal do professor — o que também resolve a restrição da Vercel (seção 12.4) |
| Visibilidade do repositório | **Público** — ver seção 9.1 |
| Fluxo Git dos alunos | Fork do repositório → branch → PR para o repositório upstream |
| Autenticação | Login via GitHub OAuth, liberado por lista de permissão gerida no sistema (seção 9.4) |
| Documentação | Guia do aluno, do professor e do solicitante fazem parte do escopo, não são "depois" (seção 15) |
| Padrão de código | Simples, comentado e legível por aluno iniciante. Uso de IA é permitido, com regras (seção 13) |
| Entrada de demanda | Professor escreve um **briefing em texto livre**; um motor de IA decompõe em requisitos, que só entram no backlog após revisão humana |

## 4. Escopo

### 4.1 Dentro do escopo (v1)

- Briefing de demanda e decomposição assistida em requisitos, com revisão obrigatória.
- Cadastro de projetos, requisitos e demandas físicas.
- Sprints com data de início/fim e backlog priorizado.
- Atribuição de responsável e mudança de status pelo próprio aluno.
- Estimativa, prazo e indicador visual de tempo restante / atraso.
- Sincronização bidirecional com issues e PRs do GitHub.
- Painel do aluno ("minhas demandas") e painel do professor (visão geral da turma).
- Comentários e registro de impedimentos.
- Homologação obrigatória pelo solicitante ou professor.
- Documentação de uso publicada e acessível de dentro do sistema.

### 4.2 Fora do escopo (v1)

- Aplicativo mobile nativo.
- Chat em tempo real (usar comentários assíncronos).
- Relatórios de nota / integração com o diário de classe.
- Múltiplas escolas / multi-tenant.
- Automação de deploy dos projetos dos alunos.
- Decomposição automática de demandas **físicas** (v1 usa template manual).

## 5. Papéis e permissões

| Papel | Quem é | Pode |
|---|---|---|
| **Solicitante** | Professor, secretaria, membro da comunidade | Escrever briefing, acompanhar, homologar entrega |
| **Product Owner** | Professor responsável | Revisar decomposição, refinar requisito, priorizar backlog, abrir/fechar sprint |
| **Tech Lead** | Aluno veterano ou professor | Revisar PR, aplicar o teste de defesa (13.4), aprovar estimativa, desbloquear impedimento |
| **Desenvolvedor** | Aluno | Assumir demanda, mudar status, registrar progresso, abrir PR |
| **Técnico de infra** | Aluno (trilha de suporte) | Assumir e executar demandas físicas, anexar evidência, operar o servidor |
| **Admin** | Coordenação | Gerenciar usuários, projetos e sprints |

Regras:
- Um aluno só muda o status das demandas atribuídas a ele.
- Só o Tech Lead ou o PO move algo para **Homologada**.
- **Nenhum requisito gerado por IA fica visível para aluno antes de aprovação do PO.**

## 6. Modelo de domínio

### 6.1 Entidades

**Usuario** — `id`, `github_login`, `nome`, `email`, `papel`, `turma`, `capacidade_semanal_horas`, `ativo`

**Projeto** — `id`, `nome`, `prefixo_codigo`, `descricao`, `solicitante_id`, `repo_github` (owner/name), `status` (`ideacao` | `ativo` | `pausado` | `entregue`), `data_inicio`, `data_prevista`

**Briefing** — `id`, `autor_id`, `projeto_id` (nulo se ainda não virou projeto), `titulo`, `texto_livre`, `publico_alvo`, `dor_que_resolve`, `restricoes`, `prazo_desejado`, `anexos`, `status` (`rascunho` | `enviado` | `decomposto` | `revisado` | `arquivado`), `criado_em`

**Decomposicao** — `id`, `briefing_id`, `modelo_usado`, `prompt_versao`, `saida_bruta` (JSON), `custo_tokens`, `duracao_ms`, `gerado_em`, `revisado_por`, `revisado_em`

**Sprint** — `id`, `numero`, `nome`, `data_inicio`, `data_fim`, `objetivo`, `status` (`planejada` | `em_andamento` | `encerrada`)

**Demanda** *(entidade central; `tipo` diferencia software de físico)*
- `id`, `codigo` (ex.: `PROVA-014`, `INFRA-032`)
- `tipo`: `software` | `fisica`
- `origem`: `ia` | `manual` — de onde veio o requisito
- `decomposicao_id` (nulo quando manual)
- `titulo`, `descricao`, `criterios_aceite` (lista)
- `projeto_id` (nulo para físicas avulsas), `sprint_id`, `responsavel_id`
- `prioridade`: `baixa` | `media` | `alta` | `critica`
- `complexidade_sugerida` (vinda da IA), `estimativa_pontos`, `estimativa_horas` (definidas pelos alunos)
- `prazo` (data/hora limite), `iniciada_em`, `concluida_em`
- `status`
- `github_issue_number`, `github_pr_number`, `github_url`
- **campos só de físicas:** `local`, `patrimonio`, `checklist`, `evidencias` (chaves de arquivo)

**DemandaDependencia** — `id`, `demanda_id`, `depende_de_id` *(bloqueio entre requisitos)*

**Comentario** — `id`, `demanda_id`, `autor_id`, `texto`, `tipo` (`comentario` | `impedimento` | `atualizacao_status`), `criado_em`

**RegistroTempo** — `id`, `demanda_id`, `usuario_id`, `horas`, `data`, `observacao`

**HistoricoStatus** — `id`, `demanda_id`, `de`, `para`, `usuario_id`, `criado_em` *(base para todas as métricas de ciclo)*

**Arquivo** — `id`, `chave_objeto`, `nome_original`, `mime`, `tamanho`, `enviado_por`, `criado_em` *(o binário nunca vai para o banco — ver 11.4)*

### 6.2 Códigos de demanda

Cada projeto tem um prefixo curto. Demandas físicas usam o prefixo fixo `INFRA`. O código aparece na branch e no título da PR — é o que costura sistema e GitHub para o aluno.

---

## 7. Do briefing ao backlog: decomposição assistida por IA

### 7.1 Princípio

**Nada gerado por máquina entra no backlog sem passar por um humano.** A IA acelera a escrita, não decide o escopo. O professor continua sendo o dono do requisito.

### 7.2 Fluxo em três etapas

```
[1] BRIEFING            [2] DECOMPOSIÇÃO           [3] REVISÃO
professor escreve   →   motor gera requisitos  →   professor aceita,
em texto livre          em estado rascunho         edita, divide,
                        (invisível ao aluno)       mescla ou recusa
                                                          ↓
                                                   BACKLOG + issue
                                                   no GitHub
```

### 7.3 Etapa 1 — Briefing

Campo principal é **texto livre**, deliberadamente. A intenção é que o professor descreva o problema como um cliente real descreveria, sem já entregar a solução mastigada. Campos de apoio: público-alvo, dor que resolve, restrições conhecidas, prazo desejado, anexos.

Um briefing pode gerar um projeto novo ou acrescentar requisitos a um projeto existente.

### 7.4 Etapa 2 — Decomposição

O motor recebe o briefing e devolve uma lista de requisitos candidatos. Para cada um:

- `titulo` — curto e no infinitivo
- `descricao`
- `criterios_aceite` — lista verificável
- `complexidade_sugerida` — `baixa` | `media` | `alta`
- `depende_de` — referência a outro requisito da mesma lista
- `justificativa` — por que esse requisito foi extraído do briefing (ajuda o professor a auditar)

Regras do motor:

- Saída sempre em JSON validado por schema. Resposta que não valida é rejeitada e regerada uma vez.
- Todo requisito nasce com `status = rascunho` e `origem = ia`.
- **A IA não define prazo nem pontos.** Sugere complexidade, e só. A estimativa continua sendo feita pelos alunos na planning — negociar quanto tempo uma coisa leva, e errar, é a parte mais formativa do processo.
- Limite de decomposições por professor por dia, para evitar regeração em loop.
- Se a API falhar ou a cota acabar, o professor cria requisitos manualmente por um template guiado. **O motor é acelerador, não dependência.**

### 7.5 Etapa 3 — Revisão

Tela em duas colunas: briefing original à esquerda, requisitos gerados à direita. Ações por requisito: **aceitar**, **editar**, **dividir em dois**, **mesclar com outro**, **recusar**. Ações em lote: aceitar todos, recusar todos.

Ao aprovar, o requisito muda para `backlog`, ganha código e vira issue no GitHub.

### 7.6 Rastreabilidade

São guardadas as **três versões**: o briefing original, a saída bruta do motor e a versão final aprovada.

Isso serve para três coisas: auditoria (de onde veio esse requisito), ajuste de prompt (o que o professor sempre corrige) e material didático — um acervo real de "como um requisito mal escrito vira um requisito bom" é uma aula por si só.

### 7.7 Custo

Cada decomposição consome alguns milhares de tokens. Com a ordem de uma dúzia de demandas por bimestre, o custo é irrelevante. O campo `custo_tokens` fica registrado mesmo assim, para acompanhamento.

---

## 8. Fluxo de trabalho

### 8.1 Ciclo de vida — demanda de software

```
Rascunho (gerada por IA, invisível ao aluno)
  → Backlog            (aprovada pelo professor)
  → Refinada           (tem critérios de aceite e estimativa)
  → Selecionada        (entrou na sprint)
  → Em desenvolvimento (aluno assumiu; cronômetro do prazo começa)
  → Em revisão         (PR aberta; detectado por webhook)
  → Ajustes solicitados (review pediu mudança) ──┐
  → Aprovada           (PR aprovada)             │
  → Homologada         (solicitante validou)     │
  → Concluída                                    │
                                                 │
  ← ─────────────────────────────────────────────┘
```

Estados terminais alternativos: **Cancelada**, **Bloqueada** (com impedimento obrigatório registrado), **Recusada** (rascunho descartado na revisão).

### 8.2 Ciclo de vida — demanda física

```
Backlog → Selecionada → Em execução → Aguardando material (opcional)
        → Executada (com evidência anexada) → Homologada → Concluída
```

Diferenças: não há PR nem revisão de código; a conclusão exige **pelo menos uma evidência** (foto, checklist preenchido ou assinatura do solicitante).

### 8.3 Definition of Ready

Uma demanda só entra em sprint se tiver: título claro, descrição, critérios de aceite, prioridade, estimativa e responsável definido. Requisito em `rascunho` nunca é Ready.

### 8.4 Definition of Done

- Critérios de aceite atendidos.
- PR mergeada no repositório da organização (software) ou evidência anexada (física).
- Sem pendência de review.
- Homologada pelo solicitante ou PO.
- Critérios de código da seção 13.6 atendidos.

### 8.5 Cerimônias

| Cerimônia | Quando | Onde |
|---|---|---|
| Planning | Início da sprint | Presencial + sistema |
| Daily assíncrona | Diária, até horário definido | Comentário do tipo `atualizacao_status` |
| Review / Demo | Fim da sprint | Presencial, com o solicitante |
| Retrospectiva | Fim da sprint | Presencial |

Sprint de **2 semanas**, alinhada ao calendário escolar. Capacidade padrão por aluno a definir (sugestão inicial: 4h/semana).

## 9. Integração com o GitHub

### 9.1 Onde ficam os repositórios

O Mutirão é um **projeto pessoal do professor responsável** (seção 9.1.1), e por isso mora na conta pessoal dele. Isso também resolve, de quebra, a restrição do plano Hobby da Vercel, que não conecta em repositórios de organização (seção 12.4).

Repositórios:

- `professor/mutirao` — o próprio sistema.
- `professor/prova-audio-acessivel` — e assim por diante, um por projeto de aluno que for para a Vercel.
- Projetos de aluno que não vão para a Vercel podem continuar na organização da escola.
- Alunos nunca têm push direto: **fork → branch → PR**.

**Os repositórios devem ser públicos.** Três motivos: no plano gratuito do GitHub, proteção de branch só existe em repositório público — e sem ela não há como exigir review antes do merge, que é o coração do exercício; GitHub Actions é ilimitado em repositório público, e o projeto depende de Actions para deploy, backup e alertas; e o aluno termina o curso com um portfólio público de contribuições reais, o que é um ganho concreto de empregabilidade.

Consequência direta: **nada sensível pode entrar no repositório.** Dado de aluno, foto de laboratório, áudio de prova e credencial ficam fora do Git, sempre. Isso precisa estar escrito no guia do aluno, não só aqui.

### 9.1.1 Propriedade

**O Mutirão é um projeto pessoal do professor responsável.** Ele é o autor e o mantenedor, e o construiu para organizar o próprio trabalho e para dar aos seus alunos uma experiência próxima à de uma empresa de desenvolvimento. A escola é a beneficiária do sistema, não a proprietária dele.

Isso precisa estar dito com todas as letras no README, para que ninguém — coordenação, aluno ou professor que chegue depois — assuma outra coisa por omissão.

Três distinções que mantêm isso limpo:

**Código é uma coisa, dado é outra.** O código é do autor. Os dados que o sistema opera — cadastro de alunos, demandas, evidências de laboratório, áudios de prova — pertencem à escola e às pessoas envolvidas, e estão sujeitos à LGPD. Nada disso é versionado no repositório. Essa separação já está garantida pela regra de repositório público sem dado sensível (seção 9.1), e é o que faz projeto pessoal e dado institucional conviverem sem conflito.

**Contribuição de aluno é do aluno.** Quem escreve código detém direito sobre o que escreveu. O histórico do Git credita cada um pelo nome, o que é parte do valor do projeto para eles — sai portfólio real. A licença do repositório é o que define em que termos essas contribuições se integram ao todo, e por isso ela precisa ser escolhida **antes** da primeira PR de aluno, não depois.

**Licença permissiva resolve a continuidade sem abrir mão de nada.** Se o professor sair da escola, o sistema sai junto — é a consequência natural de ser projeto dele. Uma licença permissiva (MIT, por exemplo) dá à escola o direito de continuar usando e de manter a própria cópia, sem que o autor perca a propriedade, o crédito ou o controle do repositório original. Custa zero e elimina a única objeção institucional razoável ao arranjo.

Vale também confirmar com a escola se existe alguma política interna sobre sistemas desenvolvidos por servidores para uso da instituição. Provavelmente não existe, mas é o tipo de coisa que é barata de checar agora e cara de descobrir depois. Isto não é orientação jurídica.

### 9.2 Sincronização

| Evento no sistema | Ação no GitHub |
|---|---|
| Requisito aprovado na revisão | Cria issue no repo do projeto, com labels de status e prioridade |
| Mudança de status | Atualiza labels da issue |
| Demanda concluída | Fecha a issue |

| Evento no GitHub (webhook) | Ação no sistema |
|---|---|
| `pull_request.opened` com o código da demanda no título | Status → **Em revisão**, vincula PR |
| `pull_request_review` com `changes_requested` | Status → **Ajustes solicitados** |
| `pull_request_review` com `approved` | Status → **Aprovada** |
| `pull_request.closed` com merge | Status → **Homologada** (aguarda validação final) |
| `issue_comment` | Espelha comentário na demanda |

### 9.3 Convenções obrigatórias para os alunos

- Branch: `feat/PROVA-014-descricao-curta`
- Título da PR: `[PROVA-014] Descrição do que foi feito`
- Commits em português, no imperativo.

O parser do webhook usa o código entre colchetes para achar a demanda. Sem o código, a PR não é vinculada — e isso deve aparecer como aviso para o aluno.

### 9.4 Autenticação e controle de acesso

Login por GitHub OAuth, como antes. O que muda: como o repositório saiu da organização, **a checagem de "é membro da organização?" deixa de servir sozinha como porta de entrada**.

O modelo passa a ser:

1. O admin cadastra previamente os `github_login` da turma no sistema (lista de permissão).
2. No login, o sistema confere se o `github_login` autenticado está na lista. Não estando, o acesso é negado com mensagem clara — nunca cria conta sozinho.
3. Opcionalmente, e de forma complementar, a pertinência à organização da escola pode ser consultada via API como segunda checagem, se a organização continuar existindo como roster.

Papel inicial é `desenvolvedor`, ajustável pelo admin. O cadastro da turma vira uma demanda `INFRA` no início de cada bimestre.

## 10. Gestão de tempo e prazo

- **Estimativa** em pontos (Fibonacci: 1, 2, 3, 5, 8, 13) e, para o aluno enxergar concretude, também em horas.
- **Prazo** é uma data/hora explícita, definida na planning. Não é o fim da sprint automaticamente.
- Indicador visual na demanda: verde (>50% do prazo restante), amarelo (<50%), vermelho (vencido).
- Alerta automático em 80% do prazo consumido e no vencimento.
- Demanda vencida sem atualização por 48h entra numa fila de atenção do professor.

Nenhum indicador de atraso deve funcionar como punição automática. O objetivo é treinar comunicação: atrasar é aceitável, não avisar não é.

---

## 11. Infraestrutura e banco de dados

### 11.1 Decisão: Neon

O Mutirão usa **Neon** — Postgres serverless, gerenciado, com branching de banco.

Por que não os outros dois que foram considerados:

- **Supabase** — o teto de 2 projetos ativos no plano gratuito inviabiliza dar backend próprio a cada projeto de aluno, e o projeto é pausado após 7 dias sem requisição.
- **Firebase** — o modelo de documentos não atende consultas agregadas (as métricas da seção 18 viram gambiarra de contadores), o Cloud Storage saiu do plano gratuito em fevereiro de 2026, e o plano pago não tem teto de gasto — risco real num ambiente onde o código é escrito por quem está aprendendo.

O que o Neon resolve: é Postgres padrão (nenhuma API proprietária, funciona com Prisma), o plano gratuito comporta muitos projetos, e o branching de banco combina com o fluxo de PR.

### 11.2 Limites do plano gratuito a respeitar

Números do plano Free em 2026, a reconferir na página de preços do Neon antes de qualquer decisão dependente deles:

| Recurso | Limite | Implicação |
|---|---|---|
| Projetos | 100 | Cada projeto de aluno pode ter o seu |
| Branches por projeto | 10 | Reservar: `main`, `homolog`, e o resto para features |
| Armazenamento | 0,5 GB por projeto | Sobra para dados de texto; arquivo binário vai para fora |
| Compute | 100 CU-hours por projeto/mês | Ver 11.3 — precisa de teto de autoscale |
| Transferência de rede | 5 GB/mês | Suficiente; monitorar |
| Point-in-time restore | janela de 6 horas | **Insuficiente. Backup próprio é obrigatório** |
| Scale-to-zero | após 5 min ocioso | Primeira requisição depois disso tem cold start |

### 11.3 Regras operacionais

**Limitar o autoscale a 0,25 CU.** O plano gratuito permite escalar até 2 CU, e é assim que se queima a cota de compute sem perceber. Com 0,25 CU, as 100 CU-hours dão cerca de 400 horas de banco ativo por mês — mais do que o Mutirão vai usar. Se a cota acabar, o compute é suspenso até o próximo ciclo, o que derrubaria o sistema no meio do bimestre.

**Cold start é aceitável, mas precisa ser tratado no front.** Depois de 5 minutos ocioso o banco suspende e a próxima requisição acorda o compute. Diferente do Supabase, isso é automático e não exige ninguém abrir painel. Ainda assim, a tela de login deve ter estado de carregamento honesto.

**Backup próprio, diário.** A janela de 6 horas do plano gratuito não protege contra erro descoberto na segunda-feira. Um `pg_dump` diário disparado por GitHub Action agendada, com o arquivo guardado fora do Neon, resolve. **Restaurar o backup uma vez por mês** — backup que nunca foi testado não é backup.

**Um banco por projeto, não um projeto Neon por aluno.** A conta é da organização escolar. Alunos recebem string de conexão do branch que lhes cabe, nunca a credencial de administração.

### 11.4 Arquivos binários

Foto de evidência de demanda física e áudio da prova acessível **não vão para o banco**. O Postgres guarda apenas o registro em `Arquivo` com a chave do objeto.

Destino a definir (ver seção 20): armazenamento de objetos compatível com S3 (Cloudflare R2, Backblaze B2) ou disco no servidor de aplicação com backup junto. Critério de escolha: custo zero ou próximo disso, e não exigir cartão vinculado sem teto.

### 11.5 Branching de banco no fluxo de trabalho

O branching do Neon deve ser usado pedagogicamente:

- `main` — produção do Mutirão
- `homolog` — onde os alunos testam antes da demo
- branch efêmero por feature que mexe em schema, criado a partir de `main` e descartado no merge

Isso ensina, na prática, por que não se testa migração em produção. Como são no máximo 10 branches por projeto, faz parte do processo excluir o branch quando a PR é mergeada.

### 11.6 O que a trilha de infra assume

Administração do ambiente vira demanda real com prazo, não tarefa invisível do professor: criação de banco para projeto novo, verificação do backup diário, restauração mensal de teste, monitoramento de cota de compute, gestão de credenciais. Cada uma é uma demanda `INFRA` no quadro.

## 12. Arquitetura técnica

### 12.1 Stack

- **Hospedagem:** Vercel (`*.vercel.app`), com deploy contínuo a partir do GitHub.
- **Front:** React + Vite, TypeScript, React Router, TanStack Query, Tailwind. Build estático servido pela CDN da Vercel.
- **Back:** Node + TypeScript, Prisma como ORM, rodando como **Vercel Functions** (serverless).
- **Banco:** Neon (Postgres). Conexão **obrigatoriamente pelo pooler** do Neon, nunca pela string direta — em serverless cada invocação pode abrir uma conexão nova e o Postgres esgota o limite.
- **Auth:** GitHub OAuth + sessão em cookie httpOnly; autorização por papel no back.
- **Integração GitHub:** Octokit; endpoint de webhook com verificação de assinatura HMAC.
- **Motor de decomposição:** serviço isolado no back, atrás de uma interface. Trocar de provedor de IA não pode exigir mexer no resto do sistema.
- **Testes:** Vitest no back, Testing Library no front.

### 12.2 Estrutura de pastas

```
/
├── README.md
├── docs/
│   ├── plan.md
│   ├── convencoes-git.md
│   ├── ambiente-de-desenvolvimento.md
│   ├── guia-do-aluno.md
│   ├── guia-do-aluno-infra.md
│   ├── guia-do-professor.md
│   ├── guia-do-solicitante.md
│   ├── glossario.md
│   ├── arquitetura.md
│   ├── modelo-dados.md
│   └── decomposicao-ia.md
├── apps/
│   ├── web/          # React + Vite
│   └── api/          # Node + Fastify
├── packages/
│   └── shared/       # tipos e enums compartilhados
└── .github/
    └── workflows/    # deploy, backup diário, alertas de prazo
```

### 12.3 Ambientes

| Ambiente | Hospedagem | Banco | Uso |
|---|---|---|---|
| Local | máquina do aluno | branch efêmero do Neon ou Postgres em Docker | Desenvolvimento |
| Preview | URL gerada por PR na Vercel | branch `homolog` | Revisão de PR e demo rápida |
| Homologação | deploy do branch `homolog` | branch `homolog` | Onde os alunos testam antes da demo |
| Produção | deploy do branch `main` | branch `main` | Uso real da escola |

Nenhuma credencial de banco no repositório. Variáveis de ambiente configuradas no painel da Vercel por ambiente, com `.env.example` versionado.

### 12.4 Hospedagem — Vercel

### Por que serve bem

Deploy automático a cada push, CDN global, HTTPS pronto e, o mais relevante pedagogicamente: **cada Pull Request ganha uma URL de preview**. O solicitante consegue abrir o link e ver a funcionalidade rodando antes do merge, sem instalar nada. Isso transforma o code review em review de produto — que é exatamente o que acontece numa empresa.

### Restrições do plano gratuito que precisam de decisão

Números do plano Hobby em 2026, a reconferir na documentação da Vercel antes de depender deles:

| Limite | Valor | Impacto aqui |
|---|---|---|
| **Repositórios de organização** | Não suportados no Hobby | **Resolvido: repositório vai para conta pessoal — ver abaixo** |
| Uso comercial | Proibido no Hobby | Uso interno de escola pública tende a ser não comercial, mas convém confirmar |
| Duração máxima de função | ~60s | A decomposição por IA não pode ser uma chamada síncrona longa |
| Cron jobs | Apenas diários | Alertas de prazo precisam de agendador externo |
| Builds simultâneos | 1 | Fila em dia de entrega, quando todos abrem PR juntos |
| Região | Única | Escolher `gru1` (São Paulo) |
| Retenção de logs | Curta | Erro de madrugada some antes de alguém olhar |

### Repositório em conta pessoal — decisão tomada

A Vercel não conecta projetos do plano Hobby a repositórios pertencentes a organizações do GitHub. **A decisão foi manter o repositório na conta pessoal do professor responsável**, o que preserva a integração nativa da Vercel: deploy automático a cada push e URL de preview por PR sem workflow customizado.

O custo dessa escolha é institucional, não técnico, e está tratado na seção 9.1.1: colaboradores com admin, propriedade registrada no README e procedimento de transferência testado.

Duas alternativas continuam de pé caso a escola consiga verba ou mude de postura: Vercel Team no plano Pro (resolve o assunto e ainda libera cron por minuto) ou deploy por GitHub Actions com a CLI da Vercel, mantendo o código na organização.

### Consequências de ser serverless

**Cold start em dois andares.** A função da Vercel esfria e o compute do Neon suspende após 5 minutos ocioso. Num sistema usado em janelas de aula, a primeira requisição do dia soma os dois. Não é impeditivo, mas o front precisa de estados de carregamento honestos, e a tela de login não pode parecer travada.

**Webhook do GitHub exige corpo bruto.** A verificação da assinatura HMAC precisa do body sem parse. Configurar isso explicitamente na rota do webhook, senão a assinatura nunca bate.

**Decomposição por IA não pode bloquear a resposta.** Com teto em torno de 60 segundos, uma chamada síncrona de modelo é risco de timeout. O desenho correto é assíncrono: a rota registra a `Decomposicao` como `processando`, dispara o trabalho e devolve na hora; o front faz polling até o estado virar `pronta`. Fica mais complexo, mas é o padrão certo e é o que uma empresa faria.

**Alertas de prazo precisam de agendador externo.** O cron da Vercel no Hobby roda no máximo uma vez por dia, o que não atende o alerta de 80% do prazo consumido. A solução é a mesma já usada para o backup: **GitHub Actions agendada** batendo num endpoint protegido por token. Um agendador só para as duas coisas.

**Preview de PR vinda de fork tem acesso restrito a variáveis de ambiente.** Como os alunos trabalham por fork, isso é o caso padrão, não a exceção. Verificar na Fase 0 se o preview consegue subir com banco de homologação ou se as demos vão precisar sair do branch `homolog`.

## 13. Padrões de código e uso de IA no desenvolvimento

### 13.1 Por que isso é regra e não recomendação

O Mutirão nasce como MVP e vai ser mantido por gente que não escreveu nada dele. O aluno do próximo bimestre herda o código do aluno anterior; o professor herda o código de quem já se formou. **A pessoa que vai ler este código tem menos experiência que quem o escreveu, e não pode perguntar nada a ele.**

Isso inverte a prioridade normal: aqui, código simples e óbvio vale mais que código eficiente ou elegante. Otimização, abstração e esperteza só entram quando há problema real medido — nunca por antecipação.

O critério para aceitar qualquer trecho é um só: **um aluno do primeiro ano consegue ler isso e entender o que acontece?** Se não, reescreve.

### 13.2 Regras de escrita

- **Domínio em português, técnica em inglês.** `criarDemanda`, `calcularPrazoRestante`, `Sprint`, `Briefing`. Palavras-chave da linguagem, nomes de bibliotecas e termos consagrados (`request`, `handler`, `commit`) ficam em inglês. O código deve conversar com o modelo da seção 6.
- **Nome descritivo sempre.** `d`, `tmp`, `data2`, `handleStuff` não passam no review. Nome comprido é melhor que nome enigmático.
- **Função curta, uma responsabilidade.** Se precisa de "e" para descrever o que faz, são duas funções.
- **Explícito ganha de implícito.** Nada de encadeamento de cinco operações numa linha, ternário aninhado, ou desestruturação profunda que esconde de onde o valor veio.
- **Duplicar duas vezes antes de abstrair.** Abstração prematura é o jeito mais rápido de tornar um MVP escolar ilegível.
- **Dependência nova exige justificativa na PR.** Cada biblioteca é mais uma coisa que o próximo aluno precisa aprender antes de conseguir mexer.
- **Tipagem explícita nas fronteiras** — rotas, retornos de função pública, formato de resposta. Dentro da função, inferência tudo bem.
- **Nada de `any` sem comentário explicando por quê.**

### 13.3 Comentários

Comentário **explica o porquê, não o quê**. `// incrementa i` é ruído. `// o GitHub manda o body como texto puro; fazer parse aqui quebra a assinatura HMAC` é o que salva a próxima pessoa.

Obrigatório comentar:

- **Cabeçalho de arquivo** — uma a três linhas dizendo o que esse arquivo faz e quem o consome.
- **Toda regra de negócio** — por que o prazo conta a partir de "Em desenvolvimento" e não da entrada na sprint, por exemplo.
- **Todo trecho não óbvio** — regex, cálculo de data, verificação de assinatura, parser do título da PR, tratamento de fuso.
- **Toda gambiarra**, com o motivo e o que precisaria acontecer para removê-la.

**Comentário desatualizado é bug.** Mudou o código, muda o comentário na mesma PR.

### 13.4 Uso de IA no desenvolvimento

Usar Claude, ChatGPT, Copilot ou similar é **permitido e incentivado**. Saber trabalhar com essas ferramentas faz parte da profissão hoje, e fingir que não existem não prepara ninguém para o mercado. O que o projeto exige é que o uso seja responsável.

**A regra central: você assina o que envia.**

Código que entra numa PR é seu, independentemente de quem ou o que o escreveu. Isso tem quatro desdobramentos práticos:

1. **Teste de defesa no review.** O Tech Lead pode apontar qualquer linha e pedir explicação. Não saber explicar devolve a PR. Não é punição nem acusação — é o mesmo padrão que um dev júnior enfrenta em qualquer empresa séria.
2. **Simplificar o que a IA gerou faz parte do trabalho.** Essas ferramentas tendem a produzir código mais sofisticado e mais genérico que o necessário: camadas de abstração, tratamento de casos que não existem aqui, padrões de projeto sobrando. Cortar isso até sobrar o simples é a tarefa, não um extra.
3. **Rodar antes de commitar.** Código gerado e não executado não vai para PR. Nunca.
4. **Nada de dado real no prompt.** Nome de aluno, credencial, string de conexão, conteúdo de prova. O repositório é público e o prompt vai para um serviço de terceiros.

**Declaração na PR.** O template de Pull Request tem um campo curto: *usei IA para quê?* Uma linha basta — "gerei o esqueleto do formulário e ajustei na mão", "pedi ajuda para entender o erro de CORS". Não é vigilância. Serve para o Tech Lead calibrar o review e para a turma perceber, ao longo do bimestre, onde a ferramenta ajuda de verdade e onde ela atrapalha.

**Isso vale para os professores também.** O MVP vai ser construído com auxílio de IA, e o código que sair daí é o primeiro exemplo que os alunos vão ler. Se o MVP vier cheio de abstração desnecessária e sem comentários, nenhuma regra escrita aqui vai segurar o resto.

### 13.5 Scripts operacionais

Os scripts de backup, deploy, migração e alerta são os mais esquecidos e os que mais assustam quem herda o projeto. Todo script precisa de um cabeçalho com quatro respostas:

```
# O QUE FAZ:      dump diário do banco de produção e envio para o armazenamento externo
# QUANDO RODA:    todo dia às 03:00 UTC, via GitHub Actions (.github/workflows/backup.yml)
# SE FALHAR:      não há backup do dia; verificar antes de qualquer migração
# RODAR NA MÃO:   npm run backup -- --env=producao
```

### 13.6 Complemento à Definition of Done

Além dos critérios da seção 8.4, uma demanda de software só é Done se:

- o código roda e foi executado por quem o enviou;
- o não-óbvio está comentado, com o porquê;
- nenhuma dependência nova entrou sem justificativa;
- o autor consegue explicar qualquer trecho;
- o guia afetado, se houver, foi atualizado na mesma PR.

## 14. Telas do MVP

1. **Login** — botão único "Entrar com GitHub".
2. **Novo briefing** — texto livre e campos de apoio, para o professor.
3. **Revisão da decomposição** — briefing à esquerda, requisitos gerados à direita, com aceitar/editar/dividir/mesclar/recusar.
4. **Meu painel** — demandas do aluno agrupadas por status, com prazo em destaque.
5. **Quadro da sprint** — kanban por status, filtro por projeto e por pessoa.
6. **Detalhe da demanda** — descrição, critérios de aceite, histórico, comentários, link da issue/PR, botões de mudança de status.
7. **Backlog do projeto** — lista priorizada, arrastar para a sprint.
8. **Nova demanda manual** — formulário que muda conforme o tipo (software ou física).
9. **Painel do professor** — visão da turma: quem está com o quê, atrasos, demandas sem responsável.
10. **Admin** — usuários, papéis, projetos, sprints.

## 15. Documentação

A documentação não é entregável de fim de projeto. **Um aluno que não entende o processo não consegue participar dele**, e o processo aqui é metade do conteúdo do curso. Um guia mal escrito não gera dúvida: gera aluno parado esperando o professor.

Regra de ouro: **mudança de fluxo só é Done se o guia correspondente foi atualizado na mesma PR.** Documentação desatualizada é pior que documentação ausente, porque quem a segue erra com confiança.

### 15.1 Princípios de escrita

- **Escrever para quem nunca viu.** Nada de "basta fazer o fork" sem explicar o que é fork.
- **Um passo por linha, com o que se espera ver na tela depois dele.** O aluno precisa saber se deu certo antes de seguir.
- **Captura de tela em toda etapa que envolve clicar.** Texto descrevendo interface envelhece mal e confunde.
- **Sempre um exemplo completo e real, de ponta a ponta.** Exemplo genérico com `foo` e `bar` não ensina ninguém.
- **Erros comuns documentados junto do passo**, não numa seção de FAQ no fim que ninguém lê.
- **Português claro.** Termo técnico em inglês é explicado na primeira aparição e depois usado normalmente — o aluno precisa aprender o vocabulário de mercado, mas não pode ser reprovado por ele.

### 15.2 Documentos e público

| Documento | Para quem | Responde |
|---|---|---|
| `README.md` | Todo mundo, na raiz | O que é o Mutirão, quem mantém, como rodar |
| `guia-do-aluno.md` | Aluno desenvolvedor | Como pegar uma demanda e entregá-la |
| `convencoes-git.md` | Aluno desenvolvedor | Fork, branch, commit, PR, review, merge |
| `guia-do-aluno-infra.md` | Aluno da trilha de suporte | Demandas físicas, evidência, checklist |
| `guia-do-professor.md` | Professor / PO | Briefing, revisão da decomposição, sprint, homologação |
| `guia-do-solicitante.md` | Secretaria, comunidade | Como pedir algo e o que esperar |
| `ambiente-de-desenvolvimento.md` | Aluno desenvolvedor | Instalar Node, clonar, `.env`, subir local |
| `glossario.md` | Todos | Sprint, backlog, PR, merge, review, homologação, DoR, DoD |
| `arquitetura.md` | Quem for mexer no código | Como o sistema é montado por dentro |
| `modelo-dados.md` | Quem for mexer no código | Schema comentado |
| `decomposicao-ia.md` | Professor / mantenedor | Prompt, schema de saída, política de uso |

### 15.3 Guia do aluno — estrutura obrigatória

O documento precisa cobrir o ciclo inteiro, na ordem em que o aluno vive:

1. **Antes de começar** — criar conta no GitHub, pedir acesso ao Mutirão, instalar o ambiente.
2. **Entender o quadro** — o que é backlog, sprint, cada status e o que significa uma demanda estar em cada um.
3. **Pegar uma demanda** — como escolher, o que olhar antes de assumir, o que perguntar na planning.
4. **Estimar** — o que é ponto, como funciona a estimativa em grupo, por que a IA sugere complexidade mas não define prazo.
5. **Desenvolver** — fork, branch com o código da demanda, commits, o que fazer quando trava.
6. **Abrir a PR** — título com o código entre colchetes, descrição, o que anexar, como pedir review.
7. **Passar pelo review** — como receber crítica de código, como responder, o que fazer quando pedem mudança.
8. **Entregar** — merge, homologação, demo para o solicitante.
9. **Quando dá errado** — atrasei, travei, não entendi o requisito, conflito de merge, PR não vinculou à demanda.

O item 9 é o mais importante e o mais esquecido. **Quase todo aluno que some do projeto some porque travou e não sabia que podia avisar.** Registrar impedimento tem que estar documentado como comportamento esperado e normal, não como confissão de fracasso.

### 15.4 Guia do professor — estrutura obrigatória

1. Escrever um briefing que funciona — com exemplo de briefing ruim e o mesmo briefing reescrito.
2. Revisar a decomposição — quando aceitar, quando editar, quando recusar tudo e reescrever.
3. Montar a sprint — capacidade da turma, prioridade, distribuição justa.
4. Conduzir planning, daily assíncrona, review e retrospectiva.
5. Acompanhar sem microgerenciar — o que os indicadores de atraso significam e o que fazer com eles.
6. Fazer code review de aluno iniciante — como criticar o código sem desmontar a pessoa.
7. Homologar — checar critério de aceite, o que fazer quando a entrega não atende.
8. Início e fim de bimestre — cadastrar turma, encerrar sprint, arquivar projeto.

### 15.5 Exemplo completo, ponta a ponta

A documentação precisa de **um caso real percorrido inteiro**, com captura de tela em cada etapa. O caso escolhido é o requisito de reprodução de áudio do projeto piloto:

| # | Etapa | Quem | O que acontece |
|---|---|---|---|
| 1 | Briefing | Professora do AEE | Escreve em texto livre que precisa aplicar prova para alunos que não leem mas entendem ouvindo |
| 2 | Decomposição | Motor de IA | Devolve 7 requisitos em rascunho, entre eles "Reproduzir áudio da questão automaticamente" |
| 3 | Revisão | PO | Aceita 5, edita 1, recusa 1. Requisito vira `PROVA-014` e ganha issue no GitHub |
| 4 | Planning | Turma | Estima `PROVA-014` em 3 pontos, prazo de 5 dias, João assume |
| 5 | Fork | João | Cria fork de `professor/prova-audio-acessivel` |
| 6 | Branch | João | `feat/PROVA-014-reproduzir-audio-questao` |
| 7 | Desenvolvimento | João | Commits; status muda para Em desenvolvimento; prazo começa a contar |
| 8 | Impedimento | João | Trava no formato do áudio, registra impedimento; Tech Lead responde no mesmo dia |
| 9 | PR | João | Abre `[PROVA-014] Reproduzir áudio da questão ao abrir` — webhook move para Em revisão |
| 10 | Review | Tech Lead | Pede mudança; status vai para Ajustes solicitados |
| 11 | Ajuste | João | Novo commit na mesma branch; review aprova |
| 12 | Merge | Professor | PR mergeada; issue fecha; status vai para Homologada |
| 13 | Demo | João | Mostra funcionando para a professora do AEE na review da sprint |
| 14 | Conclusão | Professora do AEE | Confere critérios de aceite e homologa. Demanda Concluída |

Cada linha dessa tabela é uma seção do guia, com captura de tela e o texto exato que apareceu no sistema e no GitHub.

### 15.6 Onde a documentação vive

Os arquivos ficam em `/docs`, versionados junto do código — assim mudança de processo e mudança de guia andam na mesma PR.

Além disso, **o sistema linka para o guia certo no lugar certo**: um "como abrir a PR?" na tela de detalhe da demanda, um "como escrever um bom briefing?" na tela de briefing. Documentação que exige o aluno lembrar que ela existe não é lida.

### 15.7 Quem escreve

A primeira versão é dos professores, junto com o MVP. A partir da abertura aos alunos, **melhoria de documentação vira demanda no backlog** como qualquer outra, com estimativa e responsável. Aluno que acabou de aprender uma coisa é quem melhor sabe o que faltou explicar.

## 16. Roadmap

### Fase 0 — Fundação (professores)
Projeto no Neon, modelagem do schema com Prisma, autenticação GitHub, CRUD de usuários e projetos, backup automatizado funcionando.

Na hospedagem: criar o repositório público `mutirao` na conta pessoal, definir a licença, subir o ambiente de homologação na Vercel, validar conexão via pooler do Neon e testar se preview de PR vinda de fork consegue subir.

Na documentação: `README.md` e primeira versão de `convencoes-git.md`.

### Fase 1 — MVP utilizável (professores)
Demandas, sprints, quadro kanban, mudança de status, prazos, painel do aluno e do professor. **Meta: sistema pronto antes da primeira turma entrar.**

### Fase 2 — Briefing e decomposição (professores)
Tela de briefing, serviço de decomposição com saída em JSON validado, tela de revisão, rastreabilidade das três versões, caminho manual de fallback.

### Fase 3 — Integração GitHub (professores)
Criação de issue, sincronização por labels, webhook de PR, vínculo automático demanda↔PR.

### Fase 3.5 — Documentação antes de abrir
`guia-do-aluno.md`, `guia-do-professor.md`, `convencoes-git.md`, `ambiente-de-desenvolvimento.md` e `glossario.md` escritos e revisados por alguém que não participou do desenvolvimento. **Nenhuma turma entra antes disso.** O exemplo ponta a ponta da seção 15.5 é produzido nesta fase, usando o próprio Mutirão como cobaia.

### Fase 4 — Abertura aos alunos
Cadastro da turma, primeira sprint real. O projeto piloto é o **sistema de aplicação de prova com áudio para alunos autistas não alfabetizados**.

### Fase 5 — Demandas físicas
Tipo `fisica` completo: local, patrimônio, checklist, upload de evidência, fila de infraestrutura.

### Fase 6 — Evolução pelos próprios alunos
O Mutirão vira um projeto do backlog. Alunos passam a receber demandas de melhoria do próprio sistema que usam — métricas, notificações, relatórios, decomposição de demandas físicas, o que faltar.

## 17. Projeto piloto — Prova com áudio

Serve como referência de como um briefing deve ser decomposto. Requisitos iniciais esperados:

- Cadastro de prova com questões e alternativas.
- Áudio por questão e por alternativa (upload ou síntese de voz).
- Interface de resposta sem texto obrigatório: ícones grandes, cores, navegação por poucos botões.
- Reprodução automática ao entrar na questão e botão de repetir.
- Registro das respostas e correção.
- Relatório para o professor.
- Testes de acessibilidade com usuário real, acompanhados pelo AEE.

Este projeto é também o primeiro caso de uso do armazenamento de arquivos (seção 11.4), pelo volume de áudio.

## 18. Métricas

Para o professor:

- Demandas concluídas por sprint (velocidade da turma).
- Tempo médio de ciclo (Em desenvolvimento → Concluída).
- Taxa de entrega dentro do prazo.
- Demandas por aluno e distribuição de carga.
- Tempo médio de PR aberta até review.
- Retrabalho: quantas vezes uma demanda voltou para "Ajustes solicitados".
- Taxa de aceite da decomposição: quantos requisitos gerados pela IA foram aprovados sem edição, editados ou recusados.

Métricas são de turma e de processo. Comparação pública entre alunos individualmente não deve ser exposta no sistema.

## 19. Riscos

| Risco | Mitigação |
|---|---|
| Aluno abandona a demanda no meio do bimestre | Prazos curtos, demandas pequenas (máx. 8 pontos), reatribuição simples |
| Sistema vira burocracia e ninguém atualiza status | Poucos campos obrigatórios; status atualizado automaticamente pelo GitHub sempre que possível |
| Professor aprova requisito gerado sem ler | Tela de revisão exige ação por requisito; aceitar em lote fica atrás de confirmação |
| Cota de compute do Neon esgotada no meio do mês | Autoscale limitado a 0,25 CU e alerta ao atingir 70% da cota |
| Perda de dados além da janela de 6h do Neon | `pg_dump` diário fora do Neon, restauração testada mensalmente |
| Solicitante externo cria expectativa irreal | Termo de expectativa no cadastro do projeto; deixar claro que é ambiente de aprendizagem |
| Sobrecarga de review no professor | Tech Lead aluno faz o primeiro review; professor faz o segundo |
| Demandas físicas atropelarem as de software | Fila e capacidade separadas por trilha |
| Dependência do provedor de IA | Interface isolada, caminho manual sempre disponível |
| Vercel Hobby não conecta em repo de organização | Decidir na Fase 0 entre plano Pro ou deploy por GitHub Actions |
| Timeout de função na decomposição por IA | Processamento assíncrono com polling, nunca chamada síncrona |
| Esgotamento de conexões do Postgres | Uso obrigatório do pooler do Neon; proibido usar a string direta em função serverless |
| Fila de build em dia de entrega (1 build simultâneo) | Combinar janela de abertura de PR; não deixar tudo para a véspera da demo |
| Escola passa a depender de um sistema que não é dela | Propriedade declarada no README desde o início; licença permissiva garante que a escola possa manter a própria cópia |
| Primeira PR de aluno chegar antes de haver licença definida | Licença é item da Fase 0, não da Fase 4 |
| Dado sensível commitado em repositório público | Regra explícita no guia do aluno, `.gitignore` bem feito, varredura de segredos nas Actions |
| Documentação desatualizada em relação ao sistema | Mudança de fluxo só é Done se o guia correspondente foi atualizado na mesma PR |
| Código gerado por IA que ninguém entende nem consegue manter | Teste de defesa no review; PR devolvida se o autor não explica |
| MVP dos professores já nascer complexo demais para o aluno herdar | As regras da seção 13 valem primeiro para quem constrói o MVP |

## 20. Decisões pendentes

1. Quantidade de alunos e turmas na primeira sprint.
2. Carga horária semanal real disponível por aluno.
3. ~~Qual licença adotar.~~ **Decidido em 2026-09-01: MIT** — arquivo `LICENSE` na raiz do repositório.
4. Onde guardar os **arquivos binários** — R2, B2 ou similar. Vercel não serve para isso, e o Neon é só Postgres.
5. Front e back como **dois projetos Vercel** separados ou colapsados em um só (o que implicaria trocar Vite por Next.js).
6. Qual provedor e modelo de IA para a decomposição, e quem paga a conta.
7. Duração da sprint: 2 semanas confirma, ou alinhar com bimestre?
8. Demandas físicas terão SLA por tipo (ex.: formatação = 2 dias)?
9. O sistema alimentará avaliação formal do aluno? Se sim, com quais critérios?
10. Comunidade externa poderá escrever briefing direto no sistema ou só via professor?
11. Notificações: e-mail, WhatsApp, ou só dentro do sistema?

---

## Próximos documentos

Na raiz:

- `README.md` — porta de entrada do repositório. Conteúdo mínimo: o que é o Mutirão e para quem serve; a quem o projeto pertence (a escola) e em qual conta está hospedado; status atual e fase do roadmap; stack em uma linha; como rodar localmente em cinco passos; link para cada guia de `/docs`; como pedir acesso; como contribuir, apontando para `convencoes-git.md`; licença; e o aviso de que o repositório é público e não recebe dado sensível.

Em `/docs`, na ordem de urgência:

- `convencoes-git.md` — fork, branch, commit, PR, review, merge.
- `ambiente-de-desenvolvimento.md` — do zero até rodar na máquina do aluno.
- `guia-do-aluno.md` — o ciclo completo, com o exemplo da seção 15.5.
- `guia-do-professor.md` — briefing, revisão, sprint, homologação.
- `glossario.md` — vocabulário mínimo.
- `guia-do-solicitante.md` — como pedir algo e o que esperar.
- `guia-do-aluno-infra.md` — demandas físicas e evidências.
- `arquitetura.md` — decisões técnicas e diagrama de componentes.
- `modelo-dados.md` — schema Prisma comentado.
- `padroes-de-codigo.md` — a seção 13 em formato operacional, com exemplos de bom e mau código tirados do próprio repositório.
- `decomposicao-ia.md` — prompt, schema JSON de saída, versionamento e política de uso.
