# Modelo de dados — Mutirão

> Versão detalhada da seção 6 do [`plan.md`](plan.md).
> Este documento é decisão de arquitetura, não descrição dela: mudou aqui, muda o `schema.prisma` na mesma PR.

---

## Visão geral

```
Briefing ──> Decomposicao ──> Demanda <── Sprint
                                 │
                                 ├── Usuario (responsavel)
                                 ├── Projeto
                                 ├── Comentario
                                 ├── RegistroTempo
                                 ├── HistoricoStatus
                                 ├── DemandaDependencia
                                 └── Arquivo (evidências)
```

`Demanda` é a entidade central. Tudo gira em torno dela.

---

## Decisões de modelagem

**Uma só entidade `Demanda`, com campo `tipo`.** Demanda de software e demanda física compartilham quase tudo: prazo, responsável, status, sprint, comentários, histórico. Separar em duas tabelas criaria dois sistemas dentro de um, e o aluno da trilha de infra precisa ver o mesmo quadro que o desenvolvedor.

**`HistoricoStatus` é tabela, não log.** Todas as métricas da seção 18 do plano saem dela: tempo de ciclo, taxa de entrega no prazo, retrabalho. Sem ela, não há como responder "quanto tempo essa demanda ficou parada em review".

**Arquivo binário nunca vai para o banco.** `Arquivo` guarda só a chave do objeto no armazenamento externo.

**Datas em UTC, sempre.** O fuso é aplicado na exibição. Prazo calculado em fuso local é fonte garantida de bug em horário de verão.

**Nada de `delete` em Demanda.** Demanda cancelada muda de status. Histórico escolar de um bimestre não pode sumir porque alguém clicou errado.

---

## Schema Prisma

```prisma
// Modelo de dados do Mutirão.
// Convenções: nomes de domínio em português, datas em UTC, sem hard delete.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  // conexão via pooler do Neon — obrigatório em ambiente serverless
  url       = env("DATABASE_URL")
  // conexão direta, usada só por migrations (o pooler não suporta DDL)
  directUrl = env("DIRECT_URL")
}

// ---------------------------------------------------------------------------
// ENUMS
// ---------------------------------------------------------------------------

enum Papel {
  solicitante
  product_owner
  tech_lead
  desenvolvedor
  tecnico_infra
  admin
}

enum StatusProjeto {
  ideacao
  ativo
  pausado
  entregue
}

enum StatusBriefing {
  rascunho
  enviado
  decomposto
  revisado
  arquivado
}

enum StatusDecomposicao {
  processando   // chamada ao modelo em andamento (fluxo assíncrono, ver plan.md 13.4)
  pronta
  falhou
}

enum StatusSprint {
  planejada
  em_andamento
  encerrada
}

enum TipoDemanda {
  software
  fisica
}

enum OrigemDemanda {
  ia
  manual
}

enum Prioridade {
  baixa
  media
  alta
  critica
}

enum Complexidade {
  baixa
  media
  alta
}

// Estados de software e de infraestrutura convivem no mesmo enum.
// A validação de qual transição é permitida para cada tipo fica na
// aplicação, não no banco — ver plan.md, seções 8.1 e 8.2.
enum StatusDemanda {
  rascunho              // gerada por IA, invisível para aluno
  recusada              // rascunho descartado na revisão
  backlog
  refinada
  selecionada
  em_desenvolvimento
  em_execucao           // equivalente de "em desenvolvimento" para demanda física
  aguardando_material   // só demanda física
  em_revisao
  ajustes_solicitados
  aprovada
  executada             // só demanda física, com evidência anexada
  homologada
  concluida
  bloqueada
  cancelada
}

enum TipoComentario {
  comentario
  impedimento
  atualizacao_status
}

// ---------------------------------------------------------------------------
// PESSOAS
// ---------------------------------------------------------------------------

model Usuario {
  id                     String  @id @default(cuid())
  githubLogin            String  @unique
  nome                   String
  email                  String?
  papel                  Papel   @default(desenvolvedor)
  turma                  String?
  // usada no planning para calcular a capacidade da sprint
  capacidadeSemanalHoras Int     @default(4)
  // acesso é por lista de permissão: sem registro aqui, não entra (plan.md 9.4)
  ativo                  Boolean @default(true)

  criadoEm DateTime @default(now())

  briefings          Briefing[]
  demandasAtribuidas Demanda[]         @relation("responsavel")
  comentarios        Comentario[]
  registrosTempo     RegistroTempo[]
  mudancasStatus     HistoricoStatus[]
  decomposicoesRevisadas Decomposicao[] @relation("revisor")
  arquivosEnviados   Arquivo[]
  projetosSolicitados Projeto[]        @relation("solicitante")

  @@index([ativo])
}

// ---------------------------------------------------------------------------
// PROJETO
// ---------------------------------------------------------------------------

model Projeto {
  id            String        @id @default(cuid())
  nome          String
  // prefixo dos códigos de demanda deste projeto, ex.: "PROVA" -> PROVA-014
  prefixoCodigo String        @unique
  descricao     String
  status        StatusProjeto @default(ideacao)

  // "owner/nome" no GitHub; nulo enquanto o repositório não existe
  repoGithub String?

  dataInicio   DateTime?
  dataPrevista DateTime?

  solicitanteId String
  solicitante   Usuario @relation("solicitante", fields: [solicitanteId], references: [id])

  criadoEm DateTime @default(now())

  demandas  Demanda[]
  briefings Briefing[]

  @@index([status])
}

// ---------------------------------------------------------------------------
// BRIEFING E DECOMPOSIÇÃO  (plan.md, seção 7)
// ---------------------------------------------------------------------------

model Briefing {
  id     String         @id @default(cuid())
  titulo String
  // campo principal, deliberadamente livre: o professor descreve o problema
  // como um cliente descreveria, sem entregar a solução pronta
  textoLivre    String
  publicoAlvo   String?
  dorQueResolve String?
  restricoes    String?
  prazoDesejado DateTime?
  status        StatusBriefing @default(rascunho)

  autorId String
  autor   Usuario @relation(fields: [autorId], references: [id])

  // nulo quando o briefing ainda não virou projeto
  projetoId String?
  projeto   Projeto? @relation(fields: [projetoId], references: [id])

  criadoEm     DateTime @default(now())
  atualizadoEm DateTime @updatedAt

  anexos         Arquivo[]
  decomposicoes  Decomposicao[]

  @@index([autorId, status])
}

// Um briefing pode ser decomposto mais de uma vez (regeração após ajuste
// do texto). Guardamos todas as tentativas: a rastreabilidade das três
// versões — briefing, saída bruta, versão aprovada — é requisito.
model Decomposicao {
  id         String             @id @default(cuid())
  briefingId String
  briefing   Briefing           @relation(fields: [briefingId], references: [id])
  status     StatusDecomposicao @default(processando)

  modeloUsado  String? // ex.: "claude-sonnet-4-6"
  promptVersao String? // versão do prompt, para auditoria
  saidaBruta   Json? // resposta do modelo, exatamente como veio
  custoTokens  Int?
  duracaoMs    Int?
  erro         String? // preenchido quando status = falhou

  geradoEm   DateTime  @default(now())
  revisadoEm DateTime?
  revisorId  String?
  revisor    Usuario?  @relation("revisor", fields: [revisorId], references: [id])

  demandasGeradas Demanda[]

  @@index([briefingId])
}

// ---------------------------------------------------------------------------
// SPRINT
// ---------------------------------------------------------------------------

model Sprint {
  id       Int          @id @default(autoincrement())
  nome     String
  objetivo String?
  status   StatusSprint @default(planejada)

  dataInicio DateTime
  dataFim    DateTime

  demandas Demanda[]

  @@index([status])
}

// ---------------------------------------------------------------------------
// DEMANDA — entidade central
// ---------------------------------------------------------------------------

model Demanda {
  id String @id @default(cuid())
  // PREFIXO-NNN, gerado a partir do projeto; "INFRA-NNN" para demanda física
  codigo String @unique

  tipo   TipoDemanda
  origem OrigemDemanda @default(manual)

  titulo    String
  descricao String
  // lista de critérios verificáveis; usada na homologação
  criteriosAceite String[]

  prioridade Prioridade    @default(media)
  status     StatusDemanda @default(backlog)

  // sugerida pela IA. A estimativa em pontos e horas é dos alunos, na
  // planning — a IA não define prazo (plan.md 7.4)
  complexidadeSugerida Complexidade?
  estimativaPontos     Int?
  estimativaHoras      Float?

  // data/hora limite explícita, definida na planning.
  // Não é o fim da sprint por padrão.
  prazo        DateTime?
  // marca a entrada em "em desenvolvimento"; é daqui que o prazo conta
  iniciadaEm   DateTime?
  concluidaEm  DateTime?

  projetoId String?
  projeto   Projeto? @relation(fields: [projetoId], references: [id])

  sprintId Int?
  sprint   Sprint? @relation(fields: [sprintId], references: [id])

  responsavelId String?
  responsavel   Usuario? @relation("responsavel", fields: [responsavelId], references: [id])

  decomposicaoId String?
  decomposicao   Decomposicao? @relation(fields: [decomposicaoId], references: [id])

  // --- integração GitHub (plan.md, seção 9.2) ---
  githubIssueNumber Int?
  githubPrNumber    Int?
  githubUrl         String?

  // --- campos exclusivos de demanda física ---
  local      String?
  patrimonio String?
  checklist  Json? // [{ item: string, feito: boolean }]

  criadoEm     DateTime @default(now())
  atualizadoEm DateTime @updatedAt

  comentarios     Comentario[]
  registrosTempo  RegistroTempo[]
  historicoStatus HistoricoStatus[]
  evidencias      Arquivo[]
  dependeDe       DemandaDependencia[] @relation("dependente")
  bloqueia        DemandaDependencia[] @relation("bloqueadora")

  @@index([status])
  @@index([sprintId, status])
  @@index([responsavelId, status])
  @@index([prazo])
}

model DemandaDependencia {
  id String @id @default(cuid())

  demandaId String
  demanda   Demanda @relation("dependente", fields: [demandaId], references: [id])

  dependeDeId String
  dependeDe   Demanda @relation("bloqueadora", fields: [dependeDeId], references: [id])

  @@unique([demandaId, dependeDeId])
}

// ---------------------------------------------------------------------------
// ACOMPANHAMENTO
// ---------------------------------------------------------------------------

model Comentario {
  id    String         @id @default(cuid())
  texto String
  tipo  TipoComentario @default(comentario)

  demandaId String
  demanda   Demanda @relation(fields: [demandaId], references: [id])

  autorId String
  autor   Usuario @relation(fields: [autorId], references: [id])

  // preenchido quando o comentário veio espelhado de uma issue do GitHub
  githubCommentId BigInt? @unique

  criadoEm DateTime @default(now())

  @@index([demandaId, criadoEm])
}

model RegistroTempo {
  id          String   @id @default(cuid())
  horas       Float
  data        DateTime
  observacao  String?

  demandaId String
  demanda   Demanda @relation(fields: [demandaId], references: [id])

  usuarioId String
  usuario   Usuario @relation(fields: [usuarioId], references: [id])

  criadoEm DateTime @default(now())

  @@index([demandaId])
  @@index([usuarioId, data])
}

// Toda transição de status é registrada. É a base de todas as métricas
// de ciclo — não remover, não sobrescrever.
model HistoricoStatus {
  id   String         @id @default(cuid())
  de   StatusDemanda?  // nulo na criação da demanda
  para StatusDemanda

  demandaId String
  demanda   Demanda @relation(fields: [demandaId], references: [id])

  // nulo quando a mudança veio de webhook do GitHub, não de uma pessoa
  usuarioId String?
  usuario   Usuario? @relation(fields: [usuarioId], references: [id])

  criadoEm DateTime @default(now())

  @@index([demandaId, criadoEm])
  @@index([para, criadoEm])
}

// ---------------------------------------------------------------------------
// ARQUIVOS
// ---------------------------------------------------------------------------

// Só metadado. O binário fica no armazenamento de objetos externo
// (plan.md 11.4) — nunca no Postgres, nunca no repositório.
model Arquivo {
  id           String @id @default(cuid())
  chaveObjeto  String @unique
  nomeOriginal String
  mime         String
  tamanhoBytes Int

  enviadoPorId String
  enviadoPor   Usuario @relation(fields: [enviadoPorId], references: [id])

  // um arquivo é anexo de briefing OU evidência de demanda
  briefingId String?
  briefing   Briefing? @relation(fields: [briefingId], references: [id])

  demandaId String?
  demanda   Demanda? @relation(fields: [demandaId], references: [id])

  criadoEm DateTime @default(now())

  @@index([demandaId])
  @@index([briefingId])
}
```

---

## Consultas que o schema precisa atender

Se alguma destas ficar difícil, o modelo está errado.

| Pergunta | De onde sai |
|---|---|
| Quais demandas estão comigo agora? | `Demanda` por `responsavelId` e `status` |
| O que está atrasado na sprint? | `Demanda` por `sprintId` e `prazo < now()` |
| Quanto tempo em média leva do início à conclusão? | `HistoricoStatus`, diferença entre transições |
| Quantas vezes essa demanda voltou para ajustes? | `HistoricoStatus`, contagem de `para = ajustes_solicitados` |
| Quanto tempo uma PR fica esperando review? | `HistoricoStatus`, `em_revisao` → `aprovada` |
| A carga está bem distribuída na turma? | `Demanda` agrupada por `responsavelId` |
| Quantos requisitos gerados pela IA foram aprovados sem edição? | `Decomposicao.saidaBruta` comparada com a `Demanda` resultante |

---

## Pendente

- **Migrations**: nomear em português e sempre reversíveis. Testar `migrate` contra um branch do Neon antes de aplicar em produção.
- **Seed**: script com uma turma fictícia, um projeto e uma sprint completa, para que quem clona o repositório veja o sistema com dados no primeiro `npm run dev`.
- Definir se `checklist` vira tabela própria caso a trilha de infra precise de item com responsável e data.
