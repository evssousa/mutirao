// Monta a aplicação Fastify sem subir servidor HTTP — reaproveitado pelo
// ponto de entrada real (servidor.ts) e pelos testes de integração
// (que usam app.inject(), sem precisar escutar numa porta de verdade).
import Fastify, { type FastifyInstance } from "fastify";
import { prisma } from "./prisma.js";
import { registrarAutenticacao } from "./auth/plugin.js";
import { rotasAuth } from "./rotas/auth.js";
import { rotasUsuarios } from "./rotas/usuarios.js";
import { rotasProjetos } from "./rotas/projetos.js";

export async function construirApp(opcoes: { logger?: boolean } = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: opcoes.logger ?? true });

  // Rota de saúde: usada para confirmar que a API subiu e que o banco
  // responde, inclusive depois de um cold start do Neon (plan.md, seção 11.3).
  app.get("/api/saude", async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok" };
  });

  await registrarAutenticacao(app);
  await app.register(rotasAuth);
  await app.register(rotasUsuarios);
  await app.register(rotasProjetos);

  return app;
}
