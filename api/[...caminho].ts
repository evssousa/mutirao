// Função serverless da Vercel que expõe a API do Mutirão sob /api/*.
// Consumida só pela própria Vercel — não é importada por nenhum código do
// projeto (docs/plan.md, seção 12.4: um projeto Vercel só para front e
// back, sem trocar Vite por Next.js).
//
// O nome do arquivo "[...caminho]" é convenção da Vercel para "catch-all":
// casa qualquer caminho debaixo de /api/ (ex.: /api/saude,
// /api/auth/callback/github) e cai sempre nesta função. As rotas do
// Fastify já são declaradas com o prefixo /api dentro delas
// (apps/api/src/app.ts), então nenhum caminho é reescrito aqui — só
// repassamos a requisição inteira para o app já montado.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { FastifyInstance } from "fastify";
import { construirApp } from "../apps/api/src/app.js";

// Guardado no escopo do módulo: a Vercel reaproveita a mesma instância da
// função entre invocações "quentes" (a mesma ideia do cliente Prisma único
// em apps/api/src/prisma.ts). Construir o app Fastify uma vez só evita
// recriar rotas e plugins a cada requisição.
let appPromise: Promise<FastifyInstance> | undefined;

function obterApp(): Promise<FastifyInstance> {
  if (!appPromise) {
    // logger desligado aqui: a Vercel já coleta stdout/stderr da função nos
    // logs do próprio painel, não precisa do logger padrão do Fastify por cima.
    appPromise = construirApp({ logger: false }).then(async (app) => {
      await app.ready();
      return app;
    });
  }
  return appPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await obterApp();
  // Fastify expõe um http.Server por baixo; emitir "request" nele é o jeito
  // documentado de entregar uma requisição já recebida por fora (aqui, pela
  // função da Vercel) para um app Fastify pronto, sem escutar numa porta.
  app.server.emit("request", req, res);
}
