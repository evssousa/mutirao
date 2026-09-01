// Conversa com a API do GitHub para o fluxo de OAuth (docs/plan.md, seção 9.4).
// Consumido só por src/rotas/auth.ts.

type PerfilGithub = {
  login: string;
  nome: string | null;
  email: string | null;
};

// Troca o "code" que o GitHub manda no redirect por um access_token.
// É a etapa 2 do "Authorization Code Flow" padrão do OAuth.
export async function trocarCodigoPorToken(codigo: string): Promise<string> {
  const resposta = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: codigo,
    }),
  });

  const dados = (await resposta.json()) as { access_token?: string; error?: string };

  if (!dados.access_token) {
    throw new Error(`GitHub não devolveu access_token: ${dados.error ?? "erro desconhecido"}`);
  }

  return dados.access_token;
}

// Busca o perfil público de quem acabou de logar, para checar o github_login
// contra a lista de permissão (Usuario cadastrado previamente pelo admin).
export async function buscarPerfilGithub(accessToken: string): Promise<PerfilGithub> {
  const resposta = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!resposta.ok) {
    throw new Error(`GitHub recusou a busca de perfil: HTTP ${resposta.status}`);
  }

  const perfil = (await resposta.json()) as { login: string; name: string | null; email: string | null };

  return { login: perfil.login, nome: perfil.name, email: perfil.email };
}
