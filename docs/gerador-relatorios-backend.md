# Gerador de Relatorios - Backend Seguro (Fases 2, 3 e 4)

## Objetivo
Evoluir o modulo de relatorios de MVP local para arquitetura segura e incremental:
- Fase 2: persistencia real de modelos;
- Fase 3: metadados controlados (allowlist);
- Fase 4: previa real segura baseada no catalogo.

## Principios de seguranca aplicados
- sem SQL livre vindo do frontend;
- sem uso de nomes de tabela/campo livres como autoridade;
- validacao contra catalogo ativo no backend;
- rotas autenticadas;
- ownership de modelos vinculado ao usuario autenticado;
- fallback local apenas no frontend, sem relaxar seguranca do backend.

## Fase 2 implementada
Tabela:
- `saved_report_models`

Endpoints:
- `GET /api/reports/models`
- `GET /api/reports/models/:id`
- `POST /api/reports/models`
- `PUT /api/reports/models/:id`
- `DELETE /api/reports/models/:id`
- `POST /api/reports/models/:id/duplicate`

## Fase 3 implementada
Tabelas de metadados:
- `report_data_sources`
- `report_tables`
- `report_fields`
- `report_relations`
- `report_filter_operators`

Migration:
- `backend/database/migrations/20260528_02_report_metadata_catalog.sql`

Endpoints:
- `GET /api/reports/metadata`
- `GET /api/reports/metadata/tables`
- `GET /api/reports/metadata/tables/:id/fields`
- `GET /api/reports/metadata/relations`
- `GET /api/reports/metadata/filter-operators`

Todos autenticados e retornando apenas registros ativos.

## Fase 4 implementada
Migration:
- `backend/database/migrations/20260528_03_report_execution_logs.sql`
- `backend/database/migrations/20260528_04_report_mask_name.sql`

Tabela de log:
- `report_execution_logs`
  - `report_model_id`
  - `user_id`
  - `user_login`
  - `action`
  - `status`
  - `filters_summary`
  - `rows_returned`
  - `execution_time_ms`
  - `error_message`
  - `created_at`

Endpoint:
- `POST /api/reports/preview`

Arquivos:
- `backend/src/modules/reports/report-preview.types.ts`
- `backend/src/modules/reports/report-preview.service.ts`
- `backend/src/modules/reports/report-preview.controller.ts`

## Validacoes da previa (Fase 4)
Antes de consultar dados:
- valida tabelas selecionadas ativas no catalogo;
- valida campos selecionados ativos e `is_selectable = 1`;
- valida filtros com campo ativo e `is_filterable = 1`;
- valida ordenacao com campo ativo e `is_sortable = 1`;
- valida operador por `data_type` em `report_filter_operators`;
- valida relacoes somente quando homologadas em `report_relations`;
- bloqueia ligacao manual fora do catalogo com mensagem amigavel;
- aplica limite maximo de 100 registros para previa.

## Montagem segura da consulta
- identifiers de tabela/campo saem apenas de `technical_name` do catalogo;
- filtros usam parametros (sem concatenar valor do usuario);
- `ORDER BY` apenas por `fieldId` validado;
- `JOIN` apenas por relacoes homologadas;
- paginacao via `OFFSET/FETCH`.

## Mascara de dados sensiveis
- CPF mascarado no backend quando `mask_type = cpf` e `settings.maskCpf = true`;
- com `settings.maskCpf = false`, CPF pode ser exibido sem mascara nesta fase;
- Nome mascarado no backend quando `mask_type = name` (ou campo equivalente `pessoas.nome`) e `settings.maskName = true`;
- com `settings.maskName = false`, nome pode ser exibido completo nesta fase;
- frontend nao e fonte de verdade para mascaramento.
- TODO proxima fase: aplicar permissao por perfil/campo para eventualmente forcar mascara independentemente do checkbox.

## Contrato de resposta da previa
Retorna:
- `columns`
- `rows`
- `pagination`
- `summary`
- `warnings`

Sem retorno de SQL bruto ou stack trace.

## Compatibilidade e fallback
- modelos salvos da Fase 2 seguem funcionando;
- frontend tenta previa real via API;
- em indisponibilidade da API, usa previa local temporaria com aviso.

## Limitacoes atuais
- sem exportacao real;
- sem execucao completa de relatorio sem limite;
- sem painel administrativo para logs/catalogo.

## Proxima fase recomendada
- exportacao controlada (CSV/XLSX/PDF) com seguranca;
- ampliacao de auditoria e monitoramento;
- evolucao de permissoes por campo/perfil.
