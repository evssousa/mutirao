-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('solicitante', 'product_owner', 'tech_lead', 'desenvolvedor', 'tecnico_infra', 'admin');

-- CreateEnum
CREATE TYPE "StatusProjeto" AS ENUM ('ideacao', 'ativo', 'pausado', 'entregue');

-- CreateEnum
CREATE TYPE "StatusBriefing" AS ENUM ('rascunho', 'enviado', 'decomposto', 'revisado', 'arquivado');

-- CreateEnum
CREATE TYPE "StatusDecomposicao" AS ENUM ('processando', 'pronta', 'falhou');

-- CreateEnum
CREATE TYPE "StatusSprint" AS ENUM ('planejada', 'em_andamento', 'encerrada');

-- CreateEnum
CREATE TYPE "TipoDemanda" AS ENUM ('software', 'fisica');

-- CreateEnum
CREATE TYPE "OrigemDemanda" AS ENUM ('ia', 'manual');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('baixa', 'media', 'alta', 'critica');

-- CreateEnum
CREATE TYPE "Complexidade" AS ENUM ('baixa', 'media', 'alta');

-- CreateEnum
CREATE TYPE "StatusDemanda" AS ENUM ('rascunho', 'recusada', 'backlog', 'refinada', 'selecionada', 'em_desenvolvimento', 'em_execucao', 'aguardando_material', 'em_revisao', 'ajustes_solicitados', 'aprovada', 'executada', 'homologada', 'concluida', 'bloqueada', 'cancelada');

-- CreateEnum
CREATE TYPE "TipoComentario" AS ENUM ('comentario', 'impedimento', 'atualizacao_status');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "githubLogin" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "papel" "Papel" NOT NULL DEFAULT 'desenvolvedor',
    "turma" TEXT,
    "capacidadeSemanalHoras" INTEGER NOT NULL DEFAULT 4,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "prefixoCodigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "StatusProjeto" NOT NULL DEFAULT 'ideacao',
    "repoGithub" TEXT,
    "dataInicio" TIMESTAMP(3),
    "dataPrevista" TIMESTAMP(3),
    "solicitanteId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Briefing" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "textoLivre" TEXT NOT NULL,
    "publicoAlvo" TEXT,
    "dorQueResolve" TEXT,
    "restricoes" TEXT,
    "prazoDesejado" TIMESTAMP(3),
    "status" "StatusBriefing" NOT NULL DEFAULT 'rascunho',
    "autorId" TEXT NOT NULL,
    "projetoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Briefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decomposicao" (
    "id" TEXT NOT NULL,
    "briefingId" TEXT NOT NULL,
    "status" "StatusDecomposicao" NOT NULL DEFAULT 'processando',
    "modeloUsado" TEXT,
    "promptVersao" TEXT,
    "saidaBruta" JSONB,
    "custoTokens" INTEGER,
    "duracaoMs" INTEGER,
    "erro" TEXT,
    "geradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisadoEm" TIMESTAMP(3),
    "revisorId" TEXT,

    CONSTRAINT "Decomposicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sprint" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "objetivo" TEXT,
    "status" "StatusSprint" NOT NULL DEFAULT 'planejada',
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demanda" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoDemanda" NOT NULL,
    "origem" "OrigemDemanda" NOT NULL DEFAULT 'manual',
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criteriosAceite" TEXT[],
    "prioridade" "Prioridade" NOT NULL DEFAULT 'media',
    "status" "StatusDemanda" NOT NULL DEFAULT 'backlog',
    "complexidadeSugerida" "Complexidade",
    "estimativaPontos" INTEGER,
    "estimativaHoras" DOUBLE PRECISION,
    "prazo" TIMESTAMP(3),
    "iniciadaEm" TIMESTAMP(3),
    "concluidaEm" TIMESTAMP(3),
    "projetoId" TEXT,
    "sprintId" INTEGER,
    "responsavelId" TEXT,
    "decomposicaoId" TEXT,
    "githubIssueNumber" INTEGER,
    "githubPrNumber" INTEGER,
    "githubUrl" TEXT,
    "local" TEXT,
    "patrimonio" TEXT,
    "checklist" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Demanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandaDependencia" (
    "id" TEXT NOT NULL,
    "demandaId" TEXT NOT NULL,
    "dependeDeId" TEXT NOT NULL,

    CONSTRAINT "DemandaDependencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo" "TipoComentario" NOT NULL DEFAULT 'comentario',
    "demandaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "githubCommentId" BIGINT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroTempo" (
    "id" TEXT NOT NULL,
    "horas" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT,
    "demandaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroTempo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoStatus" (
    "id" TEXT NOT NULL,
    "de" "StatusDemanda",
    "para" "StatusDemanda" NOT NULL,
    "demandaId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arquivo" (
    "id" TEXT NOT NULL,
    "chaveObjeto" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "enviadoPorId" TEXT NOT NULL,
    "briefingId" TEXT,
    "demandaId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Arquivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_githubLogin_key" ON "Usuario"("githubLogin");

-- CreateIndex
CREATE INDEX "Usuario_ativo_idx" ON "Usuario"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "Projeto_prefixoCodigo_key" ON "Projeto"("prefixoCodigo");

-- CreateIndex
CREATE INDEX "Projeto_status_idx" ON "Projeto"("status");

-- CreateIndex
CREATE INDEX "Briefing_autorId_status_idx" ON "Briefing"("autorId", "status");

-- CreateIndex
CREATE INDEX "Decomposicao_briefingId_idx" ON "Decomposicao"("briefingId");

-- CreateIndex
CREATE INDEX "Sprint_status_idx" ON "Sprint"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Demanda_codigo_key" ON "Demanda"("codigo");

-- CreateIndex
CREATE INDEX "Demanda_status_idx" ON "Demanda"("status");

-- CreateIndex
CREATE INDEX "Demanda_sprintId_status_idx" ON "Demanda"("sprintId", "status");

-- CreateIndex
CREATE INDEX "Demanda_responsavelId_status_idx" ON "Demanda"("responsavelId", "status");

-- CreateIndex
CREATE INDEX "Demanda_prazo_idx" ON "Demanda"("prazo");

-- CreateIndex
CREATE UNIQUE INDEX "DemandaDependencia_demandaId_dependeDeId_key" ON "DemandaDependencia"("demandaId", "dependeDeId");

-- CreateIndex
CREATE UNIQUE INDEX "Comentario_githubCommentId_key" ON "Comentario"("githubCommentId");

-- CreateIndex
CREATE INDEX "Comentario_demandaId_criadoEm_idx" ON "Comentario"("demandaId", "criadoEm");

-- CreateIndex
CREATE INDEX "RegistroTempo_demandaId_idx" ON "RegistroTempo"("demandaId");

-- CreateIndex
CREATE INDEX "RegistroTempo_usuarioId_data_idx" ON "RegistroTempo"("usuarioId", "data");

-- CreateIndex
CREATE INDEX "HistoricoStatus_demandaId_criadoEm_idx" ON "HistoricoStatus"("demandaId", "criadoEm");

-- CreateIndex
CREATE INDEX "HistoricoStatus_para_criadoEm_idx" ON "HistoricoStatus"("para", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Arquivo_chaveObjeto_key" ON "Arquivo"("chaveObjeto");

-- CreateIndex
CREATE INDEX "Arquivo_demandaId_idx" ON "Arquivo"("demandaId");

-- CreateIndex
CREATE INDEX "Arquivo_briefingId_idx" ON "Arquivo"("briefingId");

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Briefing" ADD CONSTRAINT "Briefing_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Briefing" ADD CONSTRAINT "Briefing_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decomposicao" ADD CONSTRAINT "Decomposicao_briefingId_fkey" FOREIGN KEY ("briefingId") REFERENCES "Briefing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decomposicao" ADD CONSTRAINT "Decomposicao_revisorId_fkey" FOREIGN KEY ("revisorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demanda" ADD CONSTRAINT "Demanda_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demanda" ADD CONSTRAINT "Demanda_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demanda" ADD CONSTRAINT "Demanda_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demanda" ADD CONSTRAINT "Demanda_decomposicaoId_fkey" FOREIGN KEY ("decomposicaoId") REFERENCES "Decomposicao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandaDependencia" ADD CONSTRAINT "DemandaDependencia_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandaDependencia" ADD CONSTRAINT "DemandaDependencia_dependeDeId_fkey" FOREIGN KEY ("dependeDeId") REFERENCES "Demanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroTempo" ADD CONSTRAINT "RegistroTempo_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroTempo" ADD CONSTRAINT "RegistroTempo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoStatus" ADD CONSTRAINT "HistoricoStatus_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoStatus" ADD CONSTRAINT "HistoricoStatus_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_enviadoPorId_fkey" FOREIGN KEY ("enviadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_briefingId_fkey" FOREIGN KEY ("briefingId") REFERENCES "Briefing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE SET NULL ON UPDATE CASCADE;
