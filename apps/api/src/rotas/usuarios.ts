// CRUD de usuários — só o admin mexe aqui (docs/plan.md, seção 5).
//
// É por este cadastro que a lista de permissão da seção 9.4 é alimentada:
// sem um Usuario com o github_login da pessoa, o login OAuth é recusado.
import type { FastifyInstance } from "fastify";
import { PAPEL, type Papel } from "@mutirao/shared";
import { prisma } from "../prisma.js";
import { exigirPapel } from "../auth/plugin.js";

type CorpoCriarUsuario = {
  githubLogin: string;
  nome: string;
  email?: string;
  papel?: Papel;
  turma?: string;
  capacidadeSemanalHoras?: number;
};

type CorpoAtualizarUsuario = Partial<
  Pick<CorpoCriarUsuario, "papel" | "turma" | "capacidadeSemanalHoras"> & { ativo: boolean }
>;

function papelValido(papel: unknown): papel is Papel {
  return typeof papel === "string" && (PAPEL as readonly string[]).includes(papel);
}

export async function rotasUsuarios(app: FastifyInstance) {
  const somenteAdmin = { preHandler: exigirPapel("admin") };

  app.get("/api/usuarios", somenteAdmin, async () => {
    return prisma.usuario.findMany({ orderBy: { criadoEm: "desc" } });
  });

  app.post<{ Body: CorpoCriarUsuario }>("/api/usuarios", somenteAdmin, async (req, reply) => {
    const { githubLogin, nome, email, papel, turma, capacidadeSemanalHoras } = req.body;

    if (!githubLogin || !nome) {
      return reply.code(400).send({ erro: "githubLogin e nome são obrigatórios." });
    }
    if (papel !== undefined && !papelValido(papel)) {
      return reply.code(400).send({ erro: `papel inválido. Use um de: ${PAPEL.join(", ")}` });
    }

    const usuario = await prisma.usuario.create({
      data: {
        githubLogin,
        nome,
        email,
        papel: papel ?? "desenvolvedor", // papel inicial padrão (plan.md 9.4)
        turma,
        capacidadeSemanalHoras: capacidadeSemanalHoras ?? 4,
      },
    });

    reply.code(201).send(usuario);
  });

  app.patch<{ Params: { id: string }; Body: CorpoAtualizarUsuario }>(
    "/api/usuarios/:id",
    somenteAdmin,
    async (req, reply) => {
      const { papel, turma, capacidadeSemanalHoras, ativo } = req.body;

      if (papel !== undefined && !papelValido(papel)) {
        return reply.code(400).send({ erro: `papel inválido. Use um de: ${PAPEL.join(", ")}` });
      }

      const usuario = await prisma.usuario.update({
        where: { id: req.params.id },
        data: { papel, turma, capacidadeSemanalHoras, ativo },
      });

      reply.send(usuario);
    },
  );
}
