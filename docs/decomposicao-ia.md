# Decomposição por IA — Mutirão

> **A escrever na Fase 2**, junto com a implementação.
>
> Desenho e princípios estão na seção 7 do [`plan.md`](plan.md).
> Este documento é a parte operacional.

## Estrutura prevista

1. Provedor e modelo em uso, e como trocar
2. Prompt completo, versionado — histórico de versões com o motivo de cada mudança
3. Schema JSON da saída esperada, com exemplo válido
4. O que fazer quando a saída não valida
5. Fluxo assíncrono: registro, disparo, polling, timeout
6. Limites de uso por professor e como são aplicados
7. O que nunca vai no prompt (dado pessoal, credencial, conteúdo de prova)
8. Caminho manual de fallback
9. Como medir a qualidade: taxa de aceite sem edição, edição, recusa
10. Exemplos reais: briefing de entrada, saída bruta, versão aprovada

## Regra

O item 10 é o mais valioso do documento. Todo briefing decomposto em produção
é candidato a exemplo — guardar os bons **e os ruins**.
