import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { construirApp } from "../src/app.js";
import { autenticarComo, limparUsuariosDeTeste } from "./auxiliar.js";

describe("autenticação", () => {
  let app: FastifyInstance;
  const sufixo = `auth-${Date.now()}`;

  beforeAll(async () => {
    app = await construirApp({ logger: false });
  });

  afterAll(async () => {
    await limparUsuariosDeTeste(sufixo);
    await app.close();
  });

  it("barra rota protegida sem cookie de sessão", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/auth/eu" });
    expect(resposta.statusCode).toBe(401);
  });

  it("barra rota protegida com cookie inválido", async () => {
    const resposta = await app.inject({
      method: "GET",
      url: "/api/auth/eu",
      headers: { cookie: "mutirao_sessao=lixo-nao-assinado" },
    });
    expect(resposta.statusCode).toBe(401);
  });

  it("aceita cookie de sessão válido e devolve o usuário logado", async () => {
    const { usuario, cookie } = await autenticarComo("desenvolvedor", `${sufixo}-eu`);

    const resposta = await app.inject({
      method: "GET",
      url: "/api/auth/eu",
      headers: { cookie },
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toMatchObject({
      githubLogin: usuario.githubLogin,
      papel: "desenvolvedor",
    });
  });

  it("recusa login de usuário desativado", async () => {
    const { usuario, cookie } = await autenticarComo("desenvolvedor", `${sufixo}-inativo`);
    const { prisma } = await import("../src/prisma.js");
    await prisma.usuario.update({ where: { id: usuario.id }, data: { ativo: false } });

    const resposta = await app.inject({ method: "GET", url: "/api/auth/eu", headers: { cookie } });
    expect(resposta.statusCode).toBe(401);
  });

  it("GET /api/auth/login/github redireciona pro GitHub com state", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/auth/login/github" });
    expect(resposta.statusCode).toBe(302);
    expect(resposta.headers.location).toContain("https://github.com/login/oauth/authorize");
    expect(resposta.headers["set-cookie"]).toBeDefined();
  });

  it("callback recusa state que não bate com o cookie", async () => {
    const resposta = await app.inject({
      method: "GET",
      url: "/api/auth/callback/github?code=qualquer&state=nao-bate",
      headers: { cookie: "mutirao_oauth_estado=outro-valor" },
    });
    expect(resposta.statusCode).toBe(302);
    expect(resposta.headers.location).toContain("erro=estado_invalido");
  });
});
