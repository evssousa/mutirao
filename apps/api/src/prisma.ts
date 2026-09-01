// Cliente único do Prisma, reaproveitado entre requisições.
//
// Em ambiente serverless (Vercel Functions), cada invocação pode instanciar
// o módulo de novo; guardar a instância em `global` evita abrir uma conexão
// nova a cada chamada, o que esgotaria o pooler do Neon rapidinho
// (docs/plan.md, seção 12.1 e 19 — "Esgotamento de conexões do Postgres").
import { PrismaClient } from "@prisma/client";

const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalParaPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
