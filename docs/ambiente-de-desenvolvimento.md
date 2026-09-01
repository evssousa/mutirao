# Ambiente de desenvolvimento — Mutirão

> Escrito durante a configuração real do ambiente, na Fase 0 (2026-09-01),
> rodando cada passo num container limpo antes de descrever aqui. Validar de
> novo numa máquina do laboratório assim que o primeiro aluno configurar —
> é lá que aparecem os passos esquecidos.

## 1. Pré-requisitos

| Ferramenta | Versão usada nesta configuração | Observação |
|---|---|---|
| Node.js | v24.14.0 | `package.json` exige `>=20`; qualquer LTS atual serve |
| npm | 11.9.0 | vem com o Node |
| Git | 2.53.0 | — |
| Docker | 29.3.0 | só necessário para rodar o Postgres **local**; ver seção 6 |
| Editor | livre | o repo não fixa um; VS Code é o mais comum na turma |

## 2. Criar conta no GitHub e pedir acesso ao Mutirão

O login do sistema é feito via GitHub OAuth, mas **login não cria conta
sozinho** (docs/plan.md, seção 9.4): o admin precisa ter cadastrado o seu
`githubLogin` na tabela `Usuario` antes. Peça esse cadastro ao admin do
projeto antes de tentar logar.

## 3. Fork e clone

```bash
git clone https://github.com/<seu-usuario>/mutirao.git
cd mutirao
```

## 4. Instalar dependências

Monorepo com npm workspaces (`apps/api`, `apps/web`, `packages/shared`) —
um único `npm install` na raiz resolve os três:

```bash
npm install
```

## 5. Obter as variáveis de ambiente e preencher o `.env`

```bash
cp .env.example .env
```

Preencha cada valor seguindo os comentários do próprio `.env.example`. Para
rodar **só a API local + banco local** (sem OAuth real, sem IA), o mínimo
necessário é:

- `DATABASE_URL` e `DIRECT_URL` — ver seção 6 (banco local via Docker, aponta
  as duas para o mesmo lugar; só o Neon em produção precisa de pooler e
  conexão direta separados).
- `SESSION_SECRET` — qualquer string aleatória serve em dev. Gerar uma:
  ```bash
  openssl rand -hex 32
  ```

`GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` e `IA_PROVEDOR`/`IA_API_KEY` podem
ficar vazios para subir o projeto e ver a tela — só são necessários para
testar o login de verdade e a decomposição por IA, respectivamente.

## 6. Criar o banco local ou o branch no Neon

Duas opções. Em dúvida, use a local — é mais rápida para o dia a dia e não
depende de rede.

### Opção A — Postgres local via Docker (recomendada no dia a dia)

```bash
docker run -d --name mutirao-postgres \
  -e POSTGRES_USER=mutirao \
  -e POSTGRES_PASSWORD=mutirao \
  -e POSTGRES_DB=mutirao \
  -p 5432:5432 \
  postgres:16-alpine
```

No `.env`, aponte as duas variáveis para o mesmo container (sem pooler, é
local):

```
DATABASE_URL="postgresql://mutirao:mutirao@localhost:5432/mutirao"
DIRECT_URL="postgresql://mutirao:mutirao@localhost:5432/mutirao"
```

Confirme que subiu:

```bash
docker exec mutirao-postgres pg_isready -U mutirao
# esperado: "accepting connections"
```

### Opção B — branch no Neon (para testar o que só acontece em produção)

Criar um branch do projeto Neon compartilhado da turma e copiar as duas
strings de conexão (pooler e direta) de lá para `DATABASE_URL`/`DIRECT_URL`
— ver docs/plan.md, seção 11 e 12.1, sobre por que produção usa pooler.
Passo a passo detalhado de onde pegar essas strings: **a preencher** quando
o Neon do projeto estiver criado.

## 7. Rodar as migrations

```bash
npm run db:migrate
```

Aplica as migrations existentes em `apps/api/prisma/migrations/` e gera o
Prisma Client. Se você mudou o `schema.prisma`, isso cria uma nova migration
— nesse caso o comando pede um nome (`--name <algo>`); ver
docs/padroes-de-codigo.md para a convenção de nome.

## 8. Carregar o seed

```bash
npm run db:seed
```

Popula: um professor de exemplo (`professor-exemplo`), o admin
`evssousa` (cadastro necessário para login OAuth de verdade, seção 9.4),
o projeto piloto "Prova com áudio acessível" (`PROVA`) e a Sprint 1. É
seguro rodar mais de uma vez — usa `upsert`.

## 9. Subir o projeto e confirmar que abriu

Dois processos, em dois terminais (ou `npm run dev` na raiz, que sobe os
dois juntos):

```bash
npm run dev --workspace apps/api   # http://localhost:3333
npm run dev --workspace apps/web   # http://localhost:5173
```

## 10. Como saber que deu certo em cada passo

| Passo | Como confirmar |
|---|---|
| Instalar dependências | `npm install` termina sem erro; `node_modules/` existe nos três workspaces |
| Banco local no ar | `docker exec mutirao-postgres pg_isready -U mutirao` → `accepting connections` |
| Migration aplicada | `npm run db:migrate` termina com "Your database is now in sync with your schema" |
| Seed carregado | `npm run db:seed` termina com "Seed concluído: projeto ... criado." |
| API no ar | `curl http://localhost:3333/api/saude` → `{"status":"ok"}` (confirma API **e** conexão com o banco) |
| Autorização funcionando | `curl http://localhost:3333/api/usuarios` (sem login) → `401 Não autenticado` |
| Front no ar | abrir `http://localhost:5173` no navegador → título "Mutirão" e texto "API: ok" |
| Front conversa com a API | `curl http://localhost:5173/api/saude` (via proxy do Vite) → `{"status":"ok"}` |

Login via GitHub só é testável com `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`
reais de um OAuth App; sem isso, `GET /api/auth/login/github` ainda deve
responder `302` (redireciona ao GitHub, mesmo que o GitHub recuse por faltar
client id válido).

## 11. Erros comuns

*(a preencher conforme aparecerem — todo erro que um aluno encontrar na
configuração entra aqui **no mesmo dia**, ver regra abaixo.)*

| Erro | Causa | Solução |
|---|---|---|
| `listen EADDRINUSE: address already in use 0.0.0.0:3333` | já tem uma API rodando nessa porta (esquecida de uma sessão anterior) | achar e encerrar o processo antigo, ou mudar `PORTA_API` no `.env` |
| `SESSION_SECRET não definido — confira o .env` | `.env` não tem `SESSION_SECRET` preenchido | gerar um com `openssl rand -hex 32` e colar no `.env` |
| `column "..." does not exist` ao consultar o banco direto via SQL | os nomes de coluna do Prisma seguem `camelCase`, não o nome do campo em português traduzido | conferir o nome exato em `apps/api/prisma/schema.prisma` ou usar o Prisma Client em vez de SQL cru |

## Regra

Todo erro que um aluno encontrar na configuração entra na seção 11 **no mesmo dia**.
