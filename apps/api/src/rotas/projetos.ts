// CRUD de projetos (docs/plan.md, seção 6.1 e 14 — tela "Admin").
// Criar/editar é tarefa de PO ou admin; qualquer usuário logado pode listar.
import type { FastifyInstance } from "fastify";
import { prisma } from "../prisma.js";
import { exigirAutenticacao, exigirPapel } from "../auth/plugin.js";

type CorpoCriarProjeto = {
  nome: string;
  prefixoCodigo: string;
  descricao: string;
  solicitanteId: string;
};

type CorpoAtualizarProjeto = Partial<{
  nome: string;
  descricao: string;
  status: "ideacao" | "ativo" | "pausado" | "entregue";
  repoGithub: string;
  dataInicio: string;
  dataPrevista: string;
}>;

export async function rotasProjetos(app: FastifyInstance) {
  const podeGerenciar = { preHandler: exigirPapel("admin", "product_owner") };

  app.get("/api/projetos", { preHandler: exigirAutenticacao }, async () => {
    return prisma.projeto.findMany({ orderBy: { criadoEm: "desc" } });
  });

  app.post<{ Body: CorpoCriarProjeto }>("/api/projetos", podeGerenciar, async (req, reply) => {
    const { nome, prefixoCodigo, descricao, solicitanteId } = req.body;

    if (!nome || !prefixoCodigo || !descricao || !solicitanteId) {
      return reply
        .code(400)
        .send({ erro: "nome, prefixoCodigo, descricao e solicitanteId são obrigatórios." });
    }

    const solicitante = await prisma.usuario.findUnique({ where: { id: solicitanteId } });
    if (!solicitante) {
      return reply.code(400).send({ erro: "solicitanteId não corresponde a nenhum usuário." });
    }

    const projeto = await prisma.projeto.create({
      data: { nome, prefixoCodigo, descricao, solicitanteId },
    });

    reply.code(201).send(projeto);
  });

  app.patch<{ Params: { id: string }; Body: CorpoAtualizarProjeto }>(
    "/api/projetos/:id",
    podeGerenciar,
    async (req, reply) => {
      const { nome, descricao, status, repoGithub, dataInicio, dataPrevista } = req.body;

      const projeto = await prisma.projeto.update({
        where: { id: req.params.id },
        data: {
          nome,
          descricao,
          status,
          repoGithub,
          dataInicio: dataInicio ? new Date(dataInicio) : undefined,
          dataPrevista: dataPrevista ? new Date(dataPrevista) : undefined,
        },
      });

      reply.send(projeto);
    },
  );
}
