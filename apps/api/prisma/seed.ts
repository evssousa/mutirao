// O QUE FAZ:      popula o banco local com uma turma, um projeto e uma
//                  sprint fictícios, para quem clona o repositório ver o
//                  sistema com dados já no primeiro `npm run dev`.
// QUANDO RODA:     manualmente, via `npm run db:seed`.
// SE FALHAR:       banco local fica vazio; rodar de novo depois de corrigir.
// RODAR NA MÃO:    npm run db:seed --workspace apps/api
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const professor = await prisma.usuario.upsert({
    where: { githubLogin: "professor-exemplo" },
    update: {},
    create: {
      githubLogin: "professor-exemplo",
      nome: "Professor Exemplo",
      papel: "product_owner",
      ativo: true,
    },
  });

  // Admin real, usado para logar de verdade via GitHub OAuth em
  // desenvolvimento (docs/plan.md, seção 9.4 — login não cria conta
  // sozinho, então quem for testar precisa estar cadastrado aqui antes).
  await prisma.usuario.upsert({
    where: { githubLogin: "evssousa" },
    update: {},
    create: {
      githubLogin: "evssousa",
      nome: "Everson Sousa",
      papel: "admin",
      ativo: true,
    },
  });

  const projeto = await prisma.projeto.upsert({
    where: { prefixoCodigo: "PROVA" },
    update: {},
    create: {
      nome: "Prova com áudio acessível",
      prefixoCodigo: "PROVA",
      descricao: "Projeto piloto do Mutirão (docs/plan.md, seção 17).",
      status: "ativo",
      solicitanteId: professor.id,
    },
  });

  await prisma.sprint.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nome: "Sprint 1",
      objetivo: "Fundação do projeto piloto",
      status: "planejada",
      dataInicio: new Date(),
      dataFim: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`Seed concluído: projeto "${projeto.nome}" criado.`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
