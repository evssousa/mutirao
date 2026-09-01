// Sessão e autorização por papel (docs/plan.md, seções 5, 9.4 e 12.1).
//
// Por quê cookie assinado em vez de JWT: não precisamos que o cliente
// carregue nada além de "quem é você" — o papel e o resto do estado ficam
// no banco, consultados a cada requisição. Isso permite revogar acesso na
// hora (desativar o Usuario) sem esperar um token expirar.
//
// A assinatura usa @fastify/cookie (biblioteca oficial, mantida pelo time
// do Fastify) em vez de criptografia escrita à mão — assinatura de sessão
// é a última área do sistema onde vale a pena "reinventar simples".
import cookie from "@fastify/cookie";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Usuario, Papel } from "@prisma/client";
import { prisma } from "../prisma.js";

export const NOME_COOKIE_SESSAO = "mutirao_sessao";

declare module "fastify" {
  interface FastifyRequest {
    // Preenchido pelo hook abaixo quando o cookie de sessão é válido e
    // corresponde a um usuário ativo. Nulo para requisição anônima.
    usuario: Usuario | null;
  }
}

export async function registrarAutenticacao(app: FastifyInstance) {
  const segredo = process.env.SESSION_SECRET;
  if (!segredo) {
    throw new Error("SESSION_SECRET não definido — confira o .env (ver .env.example).");
  }

  await app.register(cookie, { secret: segredo });

  app.decorateRequest("usuario", null);

  // Roda em toda requisição: se houver cookie de sessão válido, carrega o
  // usuário correspondente. Não bloqueia nada aqui — quem exige login é o
  // preHandler `exigirAutenticacao`, usado rota a rota.
  app.addHook("onRequest", async (req: FastifyRequest) => {
    const bruto = req.cookies[NOME_COOKIE_SESSAO];
    if (!bruto) return;

    const { valid, value: usuarioId } = req.unsignCookie(bruto);
    if (!valid || !usuarioId) return;

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (usuario?.ativo) {
      req.usuario = usuario;
    }
  });
}

// Grava a sessão: assina o id do usuário e manda como cookie httpOnly.
// httpOnly impede leitura via JavaScript no navegador (mitiga XSS);
// sameSite "lax" é suficiente aqui porque o login é sempre navegação de
// topo (redirect), não uma chamada AJAX entre origens.
export function iniciarSessao(reply: FastifyReply, usuarioId: string) {
  reply.setCookie(NOME_COOKIE_SESSAO, usuarioId, {
    signed: true,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
}

export function encerrarSessao(reply: FastifyReply) {
  reply.clearCookie(NOME_COOKIE_SESSAO, { path: "/" });
}

// preHandler: barra requisição anônima. Usar em qualquer rota que exija
// login, mesmo sem exigir um papel específico.
export function exigirAutenticacao(req: FastifyRequest, reply: FastifyReply, feito: () => void) {
  if (!req.usuario) {
    reply.code(401).send({ erro: "Não autenticado. Faça login em /api/auth/login/github." });
    return;
  }
  feito();
}

// preHandler: além de logado, exige um dos papéis informados
// (docs/plan.md, seção 5 — regras de permissão por papel).
export function exigirPapel(...papeisPermitidos: Papel[]) {
  return (req: FastifyRequest, reply: FastifyReply, feito: () => void) => {
    if (!req.usuario) {
      reply.code(401).send({ erro: "Não autenticado." });
      return;
    }
    if (!papeisPermitidos.includes(req.usuario.papel)) {
      reply.code(403).send({ erro: `Ação restrita a: ${papeisPermitidos.join(", ")}.` });
      return;
    }
    feito();
  };
}
