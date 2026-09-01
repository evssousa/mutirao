import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { construirApp } from "../src/app.js";
import { autenticarComo, limparUsuariosDeTeste } from "./auxiliar.js";

describe("rotas de usuários", () => {
  let app: FastifyInstance;
  const sufixo = `usuarios-${Date.now()}`;

  beforeAll(async () => {
    app = await construirApp({ logger: false });
  });

  afterAll(async () => {
    await limparUsuariosDeTeste(sufixo);
    await app.close();
  });

  it("GET /api/usuarios exige papel admin", async () => {
    const { cookie } = await autenticarComo("desenvolvedor", `${sufixo}-dev`);
    const resposta = await app.inject({ method: "GET", url: "/api/usuarios", headers: { cookie } });
    expect(resposta.statusCode).toBe(403);
  });

  it("GET /api/usuarios lista para admin", async () => {
    const { cookie } = await autenticarComo("admin", `${sufixo}-admin`);
    const resposta = await app.inject({ method: "GET", url: "/api/usuarios", headers: { cookie } });
    expect(resposta.statusCode).toBe(200);
    expect(Array.isArray(resposta.json())).toBe(true);
  });

  it("POST /api/usuarios cria usuário com papel padrão desenvolvedor", async () => {
    const { cookie } = await autenticarComo("admin", `${sufixo}-admin-cria`);
    const resposta = await app.inject({
      method: "POST",
      url: "/api/usuarios",
      headers: { cookie },
      payload: { githubLogin: `teste-${sufixo}-novo`, nome: "Aluno Teste" },
    });

    expect(resposta.statusCode).toBe(201);
    const corpo = resposta.json();
    expect(corpo.papel).toBe("desenvolvedor");
    expect(corpo.ativo).toBe(true);
  });

  it("POST /api/usuarios recusa sem githubLogin ou nome", async () => {
    const { cookie } = await autenticarComo("admin", `${sufixo}-admin-invalido`);
    const resposta = await app.inject({
      method: "POST",
      url: "/api/usuarios",
      headers: { cookie },
      payload: { nome: "Sem login" },
    });
    expect(resposta.statusCode).toBe(400);
  });

  it("POST /api/usuarios recusa papel fora do enum", async () => {
    const { cookie } = await autenticarComo("admin", `${sufixo}-admin-papel`);
    const resposta = await app.inject({
      method: "POST",
      url: "/api/usuarios",
      headers: { cookie },
      payload: { githubLogin: `teste-${sufixo}-papel-invalido`, nome: "X", papel: "rei" },
    });
    expect(resposta.statusCode).toBe(400);
  });

  it("PATCH /api/usuarios/:id troca papel e desativa", async () => {
    const { cookie } = await autenticarComo("admin", `${sufixo}-admin-patch`);
    const { usuario: alvo } = await autenticarComo("desenvolvedor", `${sufixo}-alvo`);

    const resposta = await app.inject({
      method: "PATCH",
      url: `/api/usuarios/${alvo.id}`,
      headers: { cookie },
      payload: { papel: "tech_lead", ativo: false },
    });

    expect(resposta.statusCode).toBe(200);
    const corpo = resposta.json();
    expect(corpo.papel).toBe("tech_lead");
    expect(corpo.ativo).toBe(false);
  });
});
