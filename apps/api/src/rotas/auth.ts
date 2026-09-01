// Login via GitHub OAuth (docs/plan.md, seção 9.4).
//
// Fluxo:
//   1. GET  /api/auth/login/github     -> redireciona pro GitHub
//   2. GitHub pede autorização e volta pra nossa callback com um "code"
//   3. GET  /api/auth/callback/github  -> troca code por token, busca o
//      perfil, confere a lista de permissão e abre a sessão
import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../prisma.js";
import { trocarCodigoPorToken, buscarPerfilGithub } from "../auth/github.js";
import { iniciarSessao, encerrarSessao, exigirAutenticacao } from "../auth/plugin.js";

const NOME_COOKIE_ESTADO = "mutirao_oauth_estado";

function urlCallback() {
  // URL_API sobrescreve a base em ambientes onde "localhost" não é
  // alcançável de fora, como a porta encaminhada do GitHub Codespaces
  // (ex.: https://<codespace>-3333.app.github.dev). Precisa bater com a
  // "Authorization callback URL" cadastrada no OAuth App do GitHub.
  const portaApi = process.env.PORTA_API ?? "3333";
  const base = process.env.URL_API ?? `http://localhost:${portaApi}`;
  return `${base}/api/auth/callback/github`;
}

export async function rotasAuth(app: FastifyInstance) {
  // Passo 1: manda o navegador pro GitHub. Um "state" aleatório é gerado e
  // guardado num cookie de curta duração — na volta, comparamos os dois
  // para garantir que o callback não foi forjado por outro site (proteção
  // padrão contra CSRF no fluxo OAuth).
  app.get("/api/auth/login/github", async (_req, reply) => {
    const estado = crypto.randomBytes(16).toString("hex");

    reply.setCookie(NOME_COOKIE_ESTADO, estado, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 minutos bastam para o usuário logar no GitHub
    });

    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID ?? "");
    url.searchParams.set("redirect_uri", urlCallback());
    url.searchParams.set("scope", "read:user user:email");
    url.searchParams.set("state", estado);

    reply.redirect(url.toString());
  });

  // Passo 2: o GitHub volta pra cá com ?code=...&state=...
  app.get<{ Querystring: { code?: string; state?: string } }>(
    "/api/auth/callback/github",
    async (req, reply) => {
      const urlWeb = process.env.URL_WEB ?? "http://localhost:5173";
      const { code, state } = req.query;

      const estadoEsperado = req.cookies[NOME_COOKIE_ESTADO];
      reply.clearCookie(NOME_COOKIE_ESTADO, { path: "/" });

      if (!code || !state || state !== estadoEsperado) {
        // Não confiamos num callback sem "state" batendo — mesma regra do
        // fluxo OAuth padrão contra ataque de CSRF.
        return reply.redirect(`${urlWeb}/login?erro=estado_invalido`);
      }

      const accessToken = await trocarCodigoPorToken(code);
      const perfil = await buscarPerfilGithub(accessToken);

      // Regra central da seção 9.4: login não cria conta sozinho. Só entra
      // quem o admin já cadastrou antes na lista de permissão.
      const usuario = await prisma.usuario.findUnique({
        where: { githubLogin: perfil.login },
      });

      if (!usuario || !usuario.ativo) {
        return reply.redirect(`${urlWeb}/login?erro=sem_acesso`);
      }

      iniciarSessao(reply, usuario.id);
      reply.redirect(urlWeb);
    },
  );

  app.post("/api/auth/logout", async (req, reply) => {
    encerrarSessao(reply);
    reply.send({ ok: true });
  });

  // Usado pelo front para saber quem está logado e com qual papel.
  app.get("/api/auth/eu", { preHandler: exigirAutenticacao }, async (req, reply) => {
    const { id, githubLogin, nome, papel, turma } = req.usuario!;
    reply.send({ id, githubLogin, nome, papel, turma });
  });
}
