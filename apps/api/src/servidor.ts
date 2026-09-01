// Ponto de entrada da API do Mutirão.
// Em desenvolvimento sobe um servidor Fastify normal (`npm run dev`);
// em produção, o mesmo app é adaptado para rodar como Vercel Function
// (docs/plan.md, seção 12.1) — a adaptação fica em src/vercel.ts quando
// a Fase 0 chegar no deploy.
import Fastify from "fastify";
import { prisma } from "./prisma.js";
import { registrarAutenticacao } from "./auth/plugin.js";
import { rotasAuth } from "./rotas/auth.js";
import { rotasUsuarios } from "./rotas/usuarios.js";
import { rotasProjetos } from "./rotas/projetos.js";

const app = Fastify({ logger: true });

// Rota de saúde: usada para confirmar que a API subiu e que o banco
// responde, inclusive depois de um cold start do Neon (plan.md, seção 11.3).
app.get("/api/saude", async () => {
  await prisma.$queryRaw`SELECT 1`;
  return { status: "ok" };
});

async function montarApp() {
  await registrarAutenticacao(app);
  await app.register(rotasAuth);
  await app.register(rotasUsuarios);
  await app.register(rotasProjetos);
}

const porta = Number(process.env.PORTA_API ?? 3333);

montarApp()
  .then(() => app.listen({ port: porta, host: "0.0.0.0" }))
  .catch((erro) => {
    app.log.error(erro);
    process.exit(1);
  });
