# Glossário — Mutirão

> Documento vivo. Encontrou um termo que não está aqui? Adicione — isso é uma contribuição válida e vira demanda no backlog.

Muito termo desta área não tem tradução consagrada em português. Onde não tem, usamos o termo em inglês mesmo, porque é o que você vai encontrar no mercado. **Não saber o vocabulário não é ignorância, é só falta de exposição.** Pergunte.

---

## Processo de trabalho

**Backlog** — a lista de tudo que ainda não foi feito, em ordem de prioridade. O que está no topo é o que vem primeiro.

**Sprint** — período fixo de trabalho, aqui de duas semanas, com um conjunto definido de demandas. No fim da sprint, mostra-se o que ficou pronto.

**Briefing** — o texto em que o professor ou solicitante descreve o problema com as próprias palavras, antes de virar requisito. É o pedido cru.

**Requisito** — a descrição do que precisa ser feito, já organizada, com critérios de aceite. Um briefing vira vários requisitos.

**Demanda** — no Mutirão, é o nome de qualquer item de trabalho: um requisito de software ou uma tarefa física. É o cartão no quadro.

**Critério de aceite** — a lista do que precisa ser verdade para a demanda ser considerada pronta. É o que o solicitante confere na homologação.

**Decomposição** — o processo de quebrar um briefing em requisitos menores. No Mutirão, uma IA faz o rascunho e o professor revisa.

**Estimativa** — o quanto a turma acha que uma demanda vai custar de esforço, medida em pontos.

**Ponto** — unidade de esforço relativo, não de horas. Uma demanda de 5 pontos é mais ou menos cinco vezes mais trabalhosa que uma de 1. Usamos a sequência 1, 2, 3, 5, 8, 13.

**Capacidade** — quanto a turma consegue fazer numa sprint, dado o tempo que cada um tem disponível.

**Impedimento** — qualquer coisa que te impede de continuar: dúvida não respondida, acesso que falta, dependência de outra demanda. **Registrar impedimento é comportamento esperado, não confissão de fracasso.**

**Homologação** — o momento em que o solicitante confere se o que foi entregue resolve o que ele pediu. Só ele pode dizer que sim.

**DoR — Definition of Ready** — a lista mínima que uma demanda precisa ter para poder entrar numa sprint: descrição, critério de aceite, estimativa, responsável.

**DoD — Definition of Done** — a lista mínima para uma demanda ser considerada concluída. Ver [`plan.md`](plan.md), seções 8.4 e 13.6.

**Retrabalho** — quando uma demanda volta atrás no fluxo, geralmente porque o review pediu mudança. Um pouco é normal; muito é sinal de requisito mal escrito.

---

## Cerimônias

**Planning** — reunião de início de sprint. Escolhe-se o que entra, estima-se, e cada um assume o que vai fazer.

**Daily** — atualização rápida sobre o que você fez, o que vai fazer e se travou em algo. Aqui é assíncrona: um comentário no sistema.

**Review (da sprint)** — no fim da sprint, mostra-se o que ficou pronto para quem pediu. Também chamada de demo.

**Retrospectiva** — conversa sobre como foi o processo, não sobre o produto. O que funcionou, o que atrapalhou, o que muda na próxima.

---

## Papéis

**PO — Product Owner** — quem decide o que é prioridade e se a entrega atende. Aqui, o professor responsável.

**Tech Lead** — quem revisa código, tira dúvida técnica e destrava quem travou. Pode ser um aluno veterano.

**Solicitante** — quem pediu. Professor, secretaria, alguém da comunidade.

---

## Git e GitHub

**Repositório (repo)** — a pasta do projeto versionada pelo Git, com todo o histórico de mudanças.

**Fork** — sua cópia pessoal do repositório de outra pessoa, na sua conta do GitHub. É onde você trabalha.

**Clone** — baixar um repositório do GitHub para a sua máquina.

**Branch** — uma linha de trabalho paralela. Você cria uma para cada demanda, mexe à vontade, e o código principal fica intacto.

**`main`** — a branch principal, que representa o que está em produção.

**Commit** — um ponto salvo no histórico, com uma mensagem dizendo o que mudou e por quê.

**Push** — enviar seus commits locais para o GitHub.

**Pull (ou fetch)** — trazer para a sua máquina o que mudou no GitHub.

**Upstream** — o repositório original, do qual você fez fork. Você puxa atualizações dele.

**PR — Pull Request** — o pedido para que o seu trabalho seja incorporado ao repositório principal. É onde acontece a revisão.

**Code review** — a leitura do seu código por outra pessoa antes do merge. Todo mundo passa por isso, sempre.

**Merge** — juntar o trabalho de uma branch em outra. Sua PR aprovada é mergeada na `main`.

**Conflito de merge** — quando duas pessoas mexeram na mesma linha e o Git não sabe qual manter. Normal, resolvível, e não é culpa sua.

**Issue** — um item de trabalho registrado no GitHub. No Mutirão, cada demanda vira uma issue automaticamente.

**Webhook** — um aviso automático que o GitHub manda para o Mutirão quando algo acontece — por exemplo, quando você abre uma PR.

**`.gitignore`** — arquivo que lista o que o Git deve ignorar: `node_modules`, `.env`, arquivos temporários.

---

## Técnico

**Front-end** — a parte que roda no navegador, que a pessoa vê e clica.

**Back-end** — a parte que roda no servidor: regras de negócio, acesso ao banco, integrações.

**API** — o conjunto de endereços pelos quais o front-end conversa com o back-end.

**Endpoint** — cada endereço específico dessa conversa, por exemplo `/api/demandas`.

**Banco de dados** — onde os dados ficam guardados de forma permanente. Aqui é Postgres.

**Postgres** — o sistema de banco de dados relacional que usamos. Organiza dados em tabelas com relações entre elas.

**Neon** — o serviço que hospeda nosso Postgres na nuvem.

**ORM** — biblioteca que traduz entre o código e o banco, para não precisar escrever SQL na mão. Aqui é o Prisma.

**Prisma** — nosso ORM. O arquivo `schema.prisma` descreve todas as tabelas.

**Migration** — um arquivo que registra uma mudança na estrutura do banco, para que todo mundo aplique a mesma mudança na mesma ordem.

**Schema** — a estrutura do banco: quais tabelas existem, quais campos, quais relações.

**Seed** — dados falsos de exemplo, carregados no banco para você conseguir testar o sistema sem cadastrar tudo na mão.

**Deploy** — colocar o sistema no ar, disponível para as pessoas usarem.

**Vercel** — onde o Mutirão é hospedado.

**Serverless** — jeito de rodar o back-end em que não existe um servidor ligado o tempo todo: o código sobe quando alguém acessa e desliga depois.

**Cold start** — a lentidão da primeira requisição depois de um tempo parado, porque o sistema precisa "acordar".

**Ambiente** — uma cópia do sistema com uma finalidade. Temos local (sua máquina), homologação (para testar) e produção (uso real).

**Variável de ambiente** — configuração que muda de ambiente para ambiente, como a senha do banco. Fica no `.env`, que **nunca** vai para o Git.

**`.env`** — arquivo com as variáveis de ambiente da sua máquina. Contém segredo. Nunca commitar.

**OAuth** — o jeito de entrar num sistema usando a conta de outro serviço. Aqui, você entra no Mutirão com sua conta do GitHub.

**JSON** — formato de texto para trocar dados entre sistemas.

**CI/CD** — automação que testa e publica o código sozinha a cada mudança. Aqui, GitHub Actions e Vercel.

**GitHub Actions** — a ferramenta que roda essas automações: nosso backup diário e os alertas de prazo.

**LGPD** — Lei Geral de Proteção de Dados. Regula o que se pode fazer com dado pessoal. É por isso que dado de aluno não entra em repositório público.
