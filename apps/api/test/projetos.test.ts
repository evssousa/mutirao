import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { construirApp } from "../src/app.js";
import { autenticarComo, limparProjetosDeTeste, limparUsuariosDeTeste } from "./auxiliar.js";

describe("rotas de projetos", () => {
  let app: FastifyInstance;
  const sufixo = `projetos-${Date.now()}`;

  beforeAll(async () => {
    app = await construirApp({ logger: false });
  });

  afterAll(async () => {
    await limparProjetosDeTeste(sufixo);
    await limparUsuariosDeTeste(sufixo);
    await app.close();
  });

  it("GET /api/projetos exige login, mas qualquer papel pode listar", async () => {
    const semLogin = await app.inject({ method: "GET", url: "/api/projetos" });
    expect(semLogin.statusCode).toBe(401);

    const { cookie } = await autenticarComo("desenvolvedor", `${sufixo}-listar`);
    const comLogin = await app.inject({ method: "GET", url: "/api/projetos", headers: { cookie } });
    expect(comLogin.statusCode).toBe(200);
  });

  it("POST /api/projetos recusa quem não é admin nem product_owner", async () => {
    const { cookie } = await autenticarComo("desenvolvedor", `${sufixo}-dev`);
    const resposta = await app.inject({
      method: "POST",
      url: "/api/projetos",
      headers: { cookie },
      payload: {
        nome: "Projeto de teste",
        prefixoCodigo: `TESTE-${sufixo}`,
        descricao: "x",
        solicitanteId: "qualquer",
      },
    });
    expect(resposta.statusCode).toBe(403);
  });

  it("POST /api/projetos cria projeto quando quem chama é product_owner", async () => {
    const { usuario: po, cookie } = await autenticarComo("product_owner", `${sufixo}-po`);
    const resposta = await app.inject({
      method: "POST",
      url: "/api/projetos",
      headers: { cookie },
      payload: {
        nome: "Projeto de teste",
        prefixoCodigo: `TESTE-${sufixo}`,
        descricao: "Criado pelo teste de integração",
        solicitanteId: po.id,
      },
    });

    expect(resposta.statusCode).toBe(201);
    const corpo = resposta.json();
    expect(corpo.status).toBe("ideacao"); // default do schema
    expect(corpo.prefixoCodigo).toBe(`TESTE-${sufixo}`);
  });

  it("POST /api/projetos recusa solicitanteId que não existe", async () => {
    const { cookie } = await autenticarComo("admin", `${sufixo}-admin-invalido`);
    const resposta = await app.inject({
      method: "POST",
      url: "/api/projetos",
      headers: { cookie },
      payload: {
        nome: "Projeto órfão",
        prefixoCodigo: `TESTE-${sufixo}-orfao`,
        descricao: "x",
        solicitanteId: "id-que-nao-existe",
      },
    });
    expect(resposta.statusCode).toBe(400);
  });

  it("PATCH /api/projetos/:id atualiza status", async () => {
    const { usuario: po, cookie } = await autenticarComo("product_owner", `${sufixo}-po-patch`);
    const criado = await app.inject({
      method: "POST",
      url: "/api/projetos",
      headers: { cookie },
      payload: {
        nome: "Projeto pra atualizar",
        prefixoCodigo: `TESTE-${sufixo}-patch`,
        descricao: "x",
        solicitanteId: po.id,
      },
    });
    const { id } = criado.json();

    const resposta = await app.inject({
      method: "PATCH",
      url: `/api/projetos/${id}`,
      headers: { cookie },
      payload: { status: "ativo" },
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json().status).toBe("ativo");
  });
});
