# Arquitetura — Mutirão

> **A escrever junto com o código, na mesma PR que introduz cada decisão.**
>
> Documento de arquitetura escrito no fim vira ficção: registra o que a pessoa
> lembra, não o que fez. Escrito junto, ele guarda também as decisões que
> **não** foram tomadas e o porquê — que é a parte mais útil para quem herdar.

Visão geral e stack estão na seção 12 do [`plan.md`](plan.md). Este documento
detalha o como.

## Estrutura prevista

1. Diagrama de componentes
2. Organização de pastas do `apps/api` e do `apps/web`
3. Camadas do back-end e o que pode chamar o quê
4. Autenticação e sessão, do clique no botão até o cookie
5. Autorização por papel — onde a checagem acontece
6. Integração com o GitHub: cliente, webhook, verificação de assinatura
7. Motor de decomposição: interface, fluxo assíncrono, tratamento de falha
8. Upload e leitura de arquivos
9. Jobs agendados (backup, alertas de prazo)
10. Tratamento de erro e observabilidade
11. Registro de decisões — uma entrada por decisão relevante

## Formato do registro de decisões

```
### YYYY-MM-DD — Título da decisão
Contexto: o que motivou.
Decisão: o que foi escolhido.
Alternativas descartadas: quais e por quê.
Consequências: o que isso torna fácil e o que torna difícil.
```

## Registro de decisões

### 2026-09-02 — Um projeto Vercel só para front e back
Contexto: `plan.md` (seção 12.4 e seção 20, item 5) deixava em aberto se
front e back seriam dois projetos Vercel separados ou um só — e supunha
que colapsar em um exigiria trocar Vite por Next.js.

Decisão: um projeto Vercel só, com Root Directory na raiz do repositório.
A Vercel builda o site estático de `apps/web` (`vercel.json`:
`buildCommand` + `outputDirectory`) e trata qualquer arquivo dentro de
`/api` na raiz como função serverless — isso não é exclusividade do
Next.js, funciona pra qualquer framework front-end. Criamos
`api/[...caminho].ts`: um catch-all que repassa a requisição inteira pro
app Fastify já existente em `apps/api/src/app.ts` (que continua sendo o
mesmo código rodado localmente por `apps/api/src/servidor.ts`).

Consequências:
- Front e back ficam na mesma URL/origem. `fetch("/api/...")` no front
  funciona igual em local, preview e produção, sem variável de ambiente
  de URL da API nem CORS.
- Cada PR de aluno ganha uma única URL de preview com front e back juntos
  — mais fácil de testar e de explicar do que duas URLs sincronizadas.
- O Prisma Client precisa do engine `rhel-openssl-3.0.x` além do
  `native` (schema.prisma) porque a função roda sobre Amazon Linux 2023,
  diferente da máquina de quem desenvolve.
- `npm install` na raiz dispara `postinstall` → `prisma generate`, porque
  o bundler da função precisa do client já gerado antes de empacotar
  `api/[...caminho].ts`.

Alternativas descartadas: dois projetos Vercel separados (ver seção 20 do
plano) — mais próximo de microsserviço, mas exige o front conhecer a URL
da API por variável de ambiente e duplica a URL de preview por PR. Sem
ganho concreto para o tamanho atual do sistema.
