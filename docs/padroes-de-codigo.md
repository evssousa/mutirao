# Padrões de código — Mutirão

> Versão operacional da seção 13 do [`plan.md`](plan.md).
> Vale a partir do primeiro commit, inclusive para os professores.

---

## A regra que explica todas as outras

**Quem vai ler este código tem menos experiência que quem o escreveu, e não pode perguntar nada a ele.**

O aluno do próximo bimestre herda o código do aluno anterior. O professor herda o código de quem já se formou. Ninguém tem a quem recorrer.

Por isso, aqui, **código simples e óbvio vale mais que código eficiente ou elegante**. Otimização e abstração só entram quando existe problema real e medido.

Critério de aceite, em uma pergunta: *um aluno do primeiro ano lê isso e entende o que acontece?*

---

## 1. Nomes

### Domínio em português, técnica em inglês

O código deve conversar com o modelo de dados. Se a tabela chama `Demanda`, a variável não chama `task`.

```ts
// bom
const demandasAtrasadas = await buscarDemandasVencidas(sprintId);
function calcularPrazoRestante(demanda: Demanda): number { }

// ruim — mistura sem critério
const overdueDemandas = await getDemandasVencidas(sprintId);
```

Ficam em inglês: palavras-chave da linguagem, nomes de bibliotecas e termos técnicos consagrados (`request`, `response`, `handler`, `commit`, `payload`, `token`).

### Nome descritivo, sempre

```ts
// ruim
const d = ds.filter(x => x.s === 'em_desenvolvimento');
function handleStuff(data) { }

// bom
const emDesenvolvimento = demandas.filter(
  demanda => demanda.status === 'em_desenvolvimento'
);
function atribuirResponsavel(demandaId: string, usuarioId: string) { }
```

Nome comprido é melhor que nome enigmático. Ninguém nunca reclamou de entender rápido demais.

### Booleano começa com verbo de estado

`estaAtrasada`, `podeEditar`, `temEvidencia`. Não `atraso`, `edicao`, `evidencia`.

---

## 2. Funções

### Uma responsabilidade

Se você precisa da palavra "e" para descrever o que a função faz, são duas funções.

```ts
// ruim — valida, salva e notifica
async function salvarDemanda(dados) { }

// bom
function validarDemanda(dados): ErroValidacao[] { }
async function salvarDemanda(dados: DemandaValida): Promise<Demanda> { }
async function notificarResponsavel(demanda: Demanda): Promise<void> { }
```

### Curta

Se não cabe na tela sem rolar, provavelmente está fazendo coisa demais. Não é regra rígida — é sinal de alerta.

### Sair cedo em vez de aninhar

```ts
// ruim
function podeAssumir(usuario, demanda) {
  if (usuario.ativo) {
    if (demanda.status === 'selecionada') {
      if (!demanda.responsavelId) {
        return true;
      }
    }
  }
  return false;
}

// bom
function podeAssumir(usuario: Usuario, demanda: Demanda): boolean {
  if (!usuario.ativo) return false;
  if (demanda.status !== 'selecionada') return false;
  if (demanda.responsavelId) return false;
  return true;
}
```

---

## 3. Explícito ganha de implícito

Proibido, salvo justificativa comentada:

- Encadeamento de cinco operações numa linha
- Ternário aninhado
- Desestruturação profunda que esconde a origem do valor
- Operador que exige consultar documentação para entender

```ts
// ruim
const r = ds.filter(d=>d.s==='ativo').map(d=>({...d,p:d.p??0})).sort((a,b)=>b.p-a.p)[0]?.id ?? null;

// bom
const ativas = demandas.filter(demanda => demanda.status === 'ativo');
const ordenadasPorPrioridade = ativas.sort(
  (a, b) => b.prioridade - a.prioridade
);
const maisPrioritaria = ordenadasPorPrioridade[0];
const idMaisPrioritaria = maisPrioritaria ? maisPrioritaria.id : null;
```

Sim, são cinco linhas em vez de uma. As cinco linhas se leem em dez segundos; a linha única, em dois minutos.

---

## 4. Abstração

**Duplicar duas vezes antes de abstrair.** Na terceira ocorrência, extraia.

Abstração prematura é o jeito mais rápido de tornar um MVP escolar ilegível. Um helper genérico que atende três casos hipotéticos e nenhum caso real é dívida, não patrimônio.

Sinais de que você abstraiu cedo demais:

- A função tem um parâmetro `options` com cinco campos opcionais
- Existe uma camada que só repassa a chamada para outra
- Você precisa abrir quatro arquivos para entender uma operação simples

---

## 5. Dependências

**Biblioteca nova exige justificativa na PR.** Duas perguntas antes de instalar:

1. Isso resolve algo que levaria mais de um dia para fazer na mão?
2. O próximo aluno vai conseguir entender o que ela faz?

Cada dependência é mais uma coisa que alguém precisa aprender antes de mexer no projeto. Uma função de 20 linhas que você entende é melhor que um pacote de 200 KB que você não entende.

---

## 6. Tipagem

Explícita nas fronteiras, inferida por dentro.

```ts
// fronteira — tipo explícito
export async function buscarDemanda(id: string): Promise<Demanda | null> {
  // dentro — inferência tudo bem
  const resultado = await prisma.demanda.findUnique({ where: { id } });
  return resultado;
}
```

**`any` só com comentário explicando por quê.** Se não dá para explicar, não dá para usar.

---

## 7. Comentários

### Comente o porquê, não o quê

```ts
// ruim
// incrementa o contador
contador++;

// bom
// o GitHub envia o body como texto puro; fazer parse aqui quebra
// a verificação da assinatura HMAC
const bodyBruto = await request.text();
```

O código já diz o que faz. Só a pessoa diz por quê.

### Obrigatório comentar

**Cabeçalho de arquivo** — uma a três linhas:

```ts
/**
 * Sincronização de status entre o Mutirão e as issues do GitHub.
 * Consumido por: rotas de mudança de status e handler de webhook.
 */
```

**Regra de negócio** — sempre:

```ts
// o prazo conta a partir de "Em desenvolvimento", não da entrada na sprint:
// o aluno pode assumir a demanda dias antes de começar de fato
const inicioContagem = demanda.iniciadaEm;
```

**Trecho não óbvio** — regex, cálculo de data, fuso horário, parser, criptografia:

```ts
// extrai o código da demanda do título da PR: "[PROVA-014] Descrição"
// aceita letras, números e hífen dentro dos colchetes
const CODIGO_NO_TITULO = /^\[([A-Z0-9-]+)\]/;
```

**Gambiarra** — com o motivo e a condição de remoção:

```ts
// GAMBIARRA: o pooler do Neon derruba conexão ociosa e o Prisma não
// reconecta sozinho na primeira tentativa. Remover quando atualizarmos
// o Prisma para a versão que corrige isso.
```

### Comentário desatualizado é bug

Mudou o código, muda o comentário na mesma PR. Comentário mentiroso é pior que comentário ausente, porque quem o lê erra com confiança.

---

## 8. Scripts operacionais

Todo script de backup, deploy, migração ou alerta começa com quatro respostas:

```bash
#!/usr/bin/env bash
# O QUE FAZ:    dump diário do banco de produção e envio para o armazenamento externo
# QUANDO RODA:  todo dia às 03:00 UTC, via .github/workflows/backup.yml
# SE FALHAR:    não há backup do dia; verificar antes de qualquer migração
# RODAR NA MÃO: npm run backup -- --env=producao
```

São os arquivos mais esquecidos do projeto e os que mais assustam quem herda.

---

## 9. Uso de IA no desenvolvimento

**É permitido e incentivado.** Claude, ChatGPT, Copilot, o que ajudar. Saber trabalhar com essas ferramentas faz parte da profissão hoje.

### A regra central: você assina o que envia

Código numa PR é seu, independentemente de quem ou o que o escreveu.

### O teste de defesa

No review, o Tech Lead pode apontar qualquer linha e pedir explicação. Não saber explicar devolve a PR.

Não é punição nem acusação. É o mesmo padrão que um desenvolvedor júnior enfrenta em qualquer empresa séria. E ninguém vai perguntar se você usou IA — vão perguntar se você entende.

### Simplificar o que veio da IA faz parte da tarefa

Essas ferramentas tendem a gerar código mais sofisticado e mais genérico que o necessário: camadas sobrando, tratamento de casos que não existem aqui, padrões de projeto aplicados por reflexo.

Cortar isso até sobrar o simples **é o trabalho**, não um extra.

### Sempre

- **Rodar antes de commitar.** Código gerado e não executado não vai para PR. Nunca.
- **Conferir se combina com o resto do projeto.** Se a IA usou uma biblioteca que não está aqui ou um padrão que ninguém segue, adapte.

### Nunca

- **Dado real no prompt.** Nome de aluno, credencial, string de conexão, conteúdo de prova. O prompt vai para um serviço de terceiros.
- **Colar sem ler.** Óbvio, e ainda assim é o erro mais comum.

### Declaração na PR

O template de Pull Request tem um campo curto: *usei IA para quê?*

Uma linha basta:

- "gerei o esqueleto do formulário e ajustei os campos na mão"
- "pedi ajuda para entender o erro de CORS"
- "não usei"

Não é vigilância. Serve para o Tech Lead calibrar o review e para a turma perceber, ao longo do bimestre, onde a ferramenta ajuda de verdade e onde ela atrapalha.

### Isto vale para os professores

O MVP será construído com auxílio de IA, e é o primeiro código que os alunos vão ler. Se ele nascer cheio de abstração desnecessária e sem comentários, nenhuma regra escrita aqui vai segurar o resto do projeto.

---

## 10. Checklist antes de abrir a PR

- [ ] O código roda e eu o executei
- [ ] Os nomes dizem o que as coisas são
- [ ] Nenhuma função faz duas coisas
- [ ] O não-óbvio está comentado, com o porquê
- [ ] Nenhuma dependência nova entrou sem justificativa
- [ ] Nenhum dado sensível, credencial ou `.env` no commit
- [ ] Eu consigo explicar qualquer linha deste diff
- [ ] O guia afetado, se houver, foi atualizado nesta mesma PR
- [ ] O título da PR tem o código da demanda entre colchetes
