// Auxiliares para os testes de integração das rotas.
import { sign } from "@fastify/cookie";
import type { Papel } from "@mutirao/shared";
import { prisma } from "../src/prisma.js";
import { NOME_COOKIE_SESSAO } from "../src/auth/plugin.js";

// Cria (ou reaproveita) um usuário de teste e devolve o header Cookie já
// pronto pra autenticar como ele em app.inject() — mesma assinatura que o
// @fastify/cookie usa de verdade em iniciarSessao(), só que sem passar
// pelo fluxo de OAuth completo.
export async function autenticarComo(papel: Papel, sufixo: string) {
  const segredo = process.env.SESSION_SECRET;
  if (!segredo) {
    throw new Error("SESSION_SECRET não definido — os testes de integração precisam do .env.");
  }

  const usuario = await prisma.usuario.upsert({
    where: { githubLogin: `teste-${sufixo}` },
    update: { papel, ativo: true },
    create: {
      githubLogin: `teste-${sufixo}`,
      nome: `Usuário de teste (${sufixo})`,
      papel,
      ativo: true,
    },
  });

  const cookie = `${NOME_COOKIE_SESSAO}=${sign(usuario.id, segredo)}`;
  return { usuario, cookie };
}

// Remove os projetos criados por UMA suíte, pelo prefixo (o mesmo "sufixo"
// passado a autenticarComo, prefixado com "TESTE-"). Precisa rodar antes de
// limparUsuariosDeTeste() — Projeto.solicitanteId aponta pra Usuario, sem
// cascade.
//
// Escopado por prefixo (não um "apaga tudo que é teste") de propósito: o
// vitest roda os arquivos de teste em paralelo, então a limpeza de uma
// suíte não pode arriscar apagar dado que outra ainda está usando.
export async function limparProjetosDeTeste(prefixo: string) {
  await prisma.projeto.deleteMany({ where: { prefixoCodigo: { startsWith: `TESTE-${prefixo}` } } });
}

// Remove os usuários criados por UMA suíte, pelo prefixo (o mesmo "sufixo"
// passado a autenticarComo). Mesmo motivo do escopo acima.
export async function limparUsuariosDeTeste(prefixo: string) {
  await prisma.usuario.deleteMany({ where: { githubLogin: { startsWith: `teste-${prefixo}` } } });
}
