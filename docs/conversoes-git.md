# Convenções de Git — Mutirão

> Vale desde o primeiro commit, inclusive para os professores.
> O passo a passo ilustrado para alunos, com capturas de tela, entra na Fase 3.5 — ver [`plan.md`](plan.md), seção 15.

---

## O fluxo, em uma frase

**Fork → branch → commits → Pull Request → review → merge.**

Ninguém dá push direto no repositório principal. Nem aluno, nem professor.

---

## 1. Branches

### Nomes

```
feat/PROVA-014-reproduzir-audio-questao
fix/MUT-032-corrigir-calculo-de-prazo
docs/MUT-041-guia-do-aluno
chore/MUT-050-atualizar-dependencias
```

Formato: `tipo/CODIGO-DA-DEMANDA-descricao-curta`

| Tipo | Quando |
|---|---|
| `feat` | Funcionalidade nova |
| `fix` | Correção de bug |
| `docs` | Só documentação |
| `chore` | Configuração, dependência, script |
| `refactor` | Mudança de código sem mudar comportamento |

Descrição curta: minúsculas, sem acento, palavras separadas por hífen, no máximo cinco palavras.

### Branches permanentes

| Branch | O que é |
|---|---|
| `main` | Produção. Só recebe merge de PR aprovada |
| `homolog` | Homologação. Onde se testa antes da demo |

**Nunca commitar direto em `main`.**

### Uma branch por demanda

Se você está mexendo em duas demandas, são duas branches. Misturar as duas numa PR só faz o review ficar impossível.

---

## 2. Commits

### Formato

```
tipo: descrição no imperativo

Corpo opcional explicando o porquê, se não for evidente.
Quebrar em 72 colunas.
```

Exemplos:

```
feat: adicionar reprodução automática do áudio ao abrir a questão
fix: corrigir contagem de prazo em demandas sem data de início
docs: escrever seção de impedimentos no guia do aluno
chore: subir versão do Prisma para 6.2
```

### Regras

- **Imperativo, em português.** "adicionar", não "adicionado" nem "adicionando".
- **Primeira linha até 72 caracteres**, sem ponto final.
- **Minúscula depois dos dois-pontos.**
- **Um commit, uma ideia.** Se precisa de "e" para descrever, são dois commits.

### O que não fazer

```
❌ update
❌ correções
❌ ajustes finais
❌ agora vai
❌ feat: mudanças diversas no sistema
```

Daqui a seis meses, alguém vai procurar quando um comportamento mudou. `ajustes finais` não ajuda ninguém.

### Frequência

Commit pequeno e frequente. Um commit por dia de trabalho é pouco; um commit a cada mudança que funciona é o certo.

---

## 3. Pull Request

### Título

```
[PROVA-014] Reproduzir áudio da questão ao abrir
```

**O código entre colchetes é obrigatório.** É por ele que o Mutirão encontra a demanda e move o status automaticamente. Sem o código, a PR não vincula e você vai ter que atualizar o status na mão — e provavelmente vai esquecer.

### Descrição

```markdown
## O que faz
Uma ou duas frases.

## Como testar
1. Abrir /prova/1
2. A questão deve tocar o áudio sozinha ao carregar
3. O botão de repetir deve tocar de novo

## Usei IA para quê?
Gerei o esqueleto do componente de áudio e ajustei os eventos na mão.

## Checklist
- [ ] Rodei o código e funciona
- [ ] Comentei o que não é óbvio
- [ ] Não entrou dependência nova sem justificativa
- [ ] Não tem dado sensível nem .env no diff
- [ ] Consigo explicar qualquer linha deste diff
- [ ] Atualizei o guia afetado, se houver
```

O campo de IA é obrigatório e pode ser "não usei". Ver [`padroes-de-codigo.md`](padroes-de-codigo.md), seção 9.

### Tamanho

**PR pequena é aprovada rápido; PR gigante fica parada.** Se o diff passa de umas 400 linhas, provavelmente a demanda deveria ter sido dividida. Avise na planning quando perceber isso — dividir depois é pior.

---

## 4. Review

### Para quem recebe

Crítica é ao código, não a você. Toda PR de todo desenvolvedor recebe comentário, sempre — inclusive as dos professores.

- Responda cada comentário, mesmo que seja "corrigido".
- Discordar é permitido. Explique o motivo; quem revisa pode estar errado.
- Não abra PR nova para corrigir: novo commit na mesma branch, e a PR atualiza sozinha.

### Para quem revisa

- Aponte o problema e o caminho, não só o problema.
- Separe o que bloqueia do que é sugestão. Use "sugestão:" no começo do comentário quando não for impeditivo.
- Se aprovar, aprove. Não deixe PR pronta parada.
- Aplique o teste de defesa quando o código parecer acima do nível esperado — não como acusação, como conversa.

---

## 5. Mantendo o fork atualizado

O repositório principal continua andando enquanto você trabalha. Antes de abrir a PR:

```bash
# só na primeira vez: registrar o repositório original
git remote add upstream https://github.com/PROFESSOR/mutirao.git

# sempre que for começar algo novo ou antes de abrir a PR
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

Depois, traga sua branch para o dia:

```bash
git checkout feat/PROVA-014-reproduzir-audio-questao
git merge main
```

**Fork desatualizado é a causa número um de conflito de merge.** Atualize antes de começar, não depois de terminar.

---

## 6. Conflito de merge

Acontece, não é erro seu, e não quebra nada. O Git só está dizendo que duas pessoas mexeram na mesma linha e ele não sabe qual manter.

```
<<<<<<< HEAD
código que está na sua branch
=======
código que veio do main
>>>>>>> main
```

Você apaga as três linhas de marcação e deixa o código correto — que pode ser um dos dois, ou uma combinação.

**Na dúvida, chame o Tech Lead antes de resolver.** Resolver conflito errado apaga o trabalho de outra pessoa silenciosamente, e isso é bem pior que pedir ajuda.

---

## 7. O que nunca entra no Git

Este repositório é **público**.

```
❌ .env, credenciais, tokens, string de conexão
❌ nome, foto, matrícula ou qualquer dado de aluno
❌ fotos de laboratório ou de sala
❌ áudios e conteúdos de prova
❌ node_modules, build, arquivos temporários
```

Se você commitou algo assim por engano: **não apague num commit novo.** Avise o professor imediatamente. Conteúdo commitado continua no histórico mesmo depois de removido, e a remediação é outra.

---

## 8. Comandos do dia a dia

```bash
# começar uma demanda
git checkout main
git pull upstream main
git checkout -b feat/PROVA-014-reproduzir-audio-questao

# durante o trabalho
git status
git add .
git commit -m "feat: adicionar reprodução automática do áudio"
git push origin feat/PROVA-014-reproduzir-audio-questao

# ver o que mudou antes de commitar
git diff

# desfazer alteração não commitada de um arquivo
git checkout -- caminho/do/arquivo

# ver o histórico resumido
git log --oneline -10
```
