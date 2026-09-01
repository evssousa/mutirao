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
