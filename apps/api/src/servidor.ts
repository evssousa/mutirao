// Ponto de entrada da API do Mutirão.
// Em desenvolvimento sobe um servidor Fastify normal (`npm run dev`);
// em produção, o mesmo app é adaptado para rodar como Vercel Function
// (docs/plan.md, seção 12.1) — a adaptação fica em src/vercel.ts quando
// a Fase 0 chegar no deploy.
import { construirApp } from "./app.js";

const porta = Number(process.env.PORTA_API ?? 3333);

construirApp()
  .then((app) => app.listen({ port: porta, host: "0.0.0.0" }))
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  });
