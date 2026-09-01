import { describe, expect, it } from "vitest";
import { construirApp } from "../src/app.js";

describe("GET /api/saude", () => {
  it("responde ok e confirma a conexão com o banco", async () => {
    const app = await construirApp({ logger: false });
    const resposta = await app.inject({ method: "GET", url: "/api/saude" });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toEqual({ status: "ok" });

    await app.close();
  });
});
