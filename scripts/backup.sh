#!/usr/bin/env bash
# O QUE FAZ:      dump completo do banco de produção (schema + dados), em
#                 formato comprimido do pg_dump, salvo em backups/.
# QUANDO RODA:    todo dia às 03:00 UTC, via GitHub Actions
#                 (.github/workflows/backup.yml). O arquivo gerado vira
#                 artifact do próprio workflow — fica fora do Neon, e fora
#                 do Git (repositório é público, dump nunca é commitado).
# SE FALHAR:      não há backup do dia; olhar o log do job "backup" nas
#                 Actions. Verificar isso antes de rodar qualquer migration
#                 arriscada em produção — é a janela de proteção que temos.
# RODAR NA MÃO:   DATABASE_URL_BACKUP="postgresql://..." ./scripts/backup.sh
#
# Por que não usa o pooler: pg_dump precisa manter uma única sessão do
# início ao fim para tirar um retrato consistente do banco. O pooler do
# Neon roda em modo transação, feito para conexões curtas e numerosas de
# função serverless — não para uma sessão longa como essa. Por isso este
# script exige a URL de conexão direta (a mesma usada pelas migrations,
# plan.md seção 12.1), nunca a do pooler.
set -euo pipefail

if [ -z "${DATABASE_URL_BACKUP:-}" ]; then
  echo "erro: variável DATABASE_URL_BACKUP não definida (precisa ser a conexão direta, não o pooler)" >&2
  exit 1
fi

pasta_destino="backups"
carimbo_data="$(date -u +%Y-%m-%d-%H%M%S)"
arquivo_saida="${pasta_destino}/mutirao-${carimbo_data}.dump"

mkdir -p "$pasta_destino"

# -Fc: formato "custom" do pg_dump — já vem comprimido e permite restauração
# seletiva (só uma tabela, por exemplo) com pg_restore.
pg_dump "$DATABASE_URL_BACKUP" --format=custom --no-owner --file="$arquivo_saida"

tamanho_bytes=$(stat -c%s "$arquivo_saida" 2>/dev/null || stat -f%z "$arquivo_saida")
if [ "$tamanho_bytes" -lt 1024 ]; then
  # Um dump de verdade nunca fica abaixo de ~1KB, mesmo com o banco vazio
  # (o schema sozinho já passa disso). Arquivo menor que isso é sinal de
  # dump que falhou silenciosamente — melhor barrar aqui do que descobrir
  # isso só na hora de restaurar.
  echo "erro: dump gerado é suspeito de pequeno (${tamanho_bytes} bytes) — não confiar nele" >&2
  exit 1
fi

echo "backup ok: ${arquivo_saida} (${tamanho_bytes} bytes)"
