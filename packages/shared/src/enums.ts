// Enums do domínio, espelhando os enums do schema Prisma
// (docs/modelo-dados.md). Front e back importam daqui para nunca
// divergir do que o banco aceita.
//
// Regra do projeto: mudou um enum aqui, muda no schema.prisma na mesma PR,
// e vice-versa (docs/plan.md, seção 6 e 13).

export const PAPEL = [
  "solicitante",
  "product_owner",
  "tech_lead",
  "desenvolvedor",
  "tecnico_infra",
  "admin",
] as const;
export type Papel = (typeof PAPEL)[number];

export const STATUS_PROJETO = ["ideacao", "ativo", "pausado", "entregue"] as const;
export type StatusProjeto = (typeof STATUS_PROJETO)[number];

export const STATUS_BRIEFING = [
  "rascunho",
  "enviado",
  "decomposto",
  "revisado",
  "arquivado",
] as const;
export type StatusBriefing = (typeof STATUS_BRIEFING)[number];

export const STATUS_DECOMPOSICAO = ["processando", "pronta", "falhou"] as const;
export type StatusDecomposicao = (typeof STATUS_DECOMPOSICAO)[number];

export const STATUS_SPRINT = ["planejada", "em_andamento", "encerrada"] as const;
export type StatusSprint = (typeof STATUS_SPRINT)[number];

export const TIPO_DEMANDA = ["software", "fisica"] as const;
export type TipoDemanda = (typeof TIPO_DEMANDA)[number];

export const ORIGEM_DEMANDA = ["ia", "manual"] as const;
export type OrigemDemanda = (typeof ORIGEM_DEMANDA)[number];

export const PRIORIDADE = ["baixa", "media", "alta", "critica"] as const;
export type Prioridade = (typeof PRIORIDADE)[number];

export const COMPLEXIDADE = ["baixa", "media", "alta"] as const;
export type Complexidade = (typeof COMPLEXIDADE)[number];

// Estados de demanda de software e de infraestrutura convivem no mesmo
// enum; qual transição vale para cada tipo é regra de aplicação, não do
// banco (docs/plan.md, seções 8.1 e 8.2).
export const STATUS_DEMANDA = [
  "rascunho",
  "recusada",
  "backlog",
  "refinada",
  "selecionada",
  "em_desenvolvimento",
  "em_execucao",
  "aguardando_material",
  "em_revisao",
  "ajustes_solicitados",
  "aprovada",
  "executada",
  "homologada",
  "concluida",
  "bloqueada",
  "cancelada",
] as const;
export type StatusDemanda = (typeof STATUS_DEMANDA)[number];

export const TIPO_COMENTARIO = ["comentario", "impedimento", "atualizacao_status"] as const;
export type TipoComentario = (typeof TIPO_COMENTARIO)[number];
