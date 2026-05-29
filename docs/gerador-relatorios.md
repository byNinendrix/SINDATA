# Gerador de Relatorios - SINDATA

## Visao geral
O Gerador de Relatorios permite montar modelos personalizados por interface visual, com:
- selecao de tabelas;
- selecao de campos;
- ligacoes entre campos;
- filtros;
- configuracoes da consulta;
- previa;
- salvamento e reutilizacao de modelos.

## Fase 2 (persistencia de modelos)
Implementado:
- CRUD backend de modelos salvos (`/api/reports/models`);
- duplicacao de modelo;
- soft delete;
- frontend API-first com fallback localStorage (`sindata:savedReports`).

## Fase 3 (metadados controlados / allowlist)
Implementado:
- catalogo backend controlado de metadados (sem exposicao automatica do banco);
- API autenticada de metadados;
- frontend consumindo metadados da API com fallback para mocks locais;
- aplicacao de flags de campo no frontend:
  - `isSelectable`
  - `isFilterable`
  - `isSortable`
  - `isGroupable`
- carregamento de relacoes sugeridas do backend;
- filtros respeitando `requiresValue` e `requiresSecondValue` dos operadores do catalogo;
- compatibilidade com modelos salvos da Fase 2.

## Fase 4 (previa real segura)
Implementado:
- endpoint autenticado `POST /api/reports/preview`;
- validacao integral da definicao contra catalogo ativo:
  - `report_tables`
  - `report_fields`
  - `report_relations`
  - `report_filter_operators`
- bloqueio de ligacoes manuais nao homologadas para execucao da previa real;
- consulta montada apenas com identifiers vindos do catalogo;
- filtros com operadores por tipo e valores parametrizados;
- ordenacao validada por `fieldId` permitido;
- limite e paginacao com teto de 100 registros;
- mascaramento de CPF no backend;
- logs de previa em `report_execution_logs`;
- frontend integrado com previa real e fallback local temporario.

Comportamento da opcao `Mascarar CPF` na previa real:
- `maskCpf = true`: CPF exibido mascarado.
- `maskCpf = false`: CPF exibido sem mascara nesta fase (sem bloqueio por perfil/campo implementado ainda).
- Observacao: em fase futura, permissoes por perfil/campo poderao sobrescrever essa opcao para proteger dados sensiveis.

Comportamento da opcao `Mascarar Nome` na previa real:
- `maskName = true`: nome exibido parcialmente mascarado no backend.
- `maskName = false`: nome exibido completo nesta fase (sem bloqueio por perfil/campo implementado ainda).
- Padrao aplicado: primeiro e ultimo nome visiveis e miolo mascarado (`MARIA APARECIDA SANTOS` -> `MARIA *** SANTOS`).

## Endpoints de metadados
- `GET /api/reports/metadata`
- `GET /api/reports/metadata/tables`
- `GET /api/reports/metadata/tables/:id/fields`
- `GET /api/reports/metadata/relations`
- `GET /api/reports/metadata/filter-operators`

Todos exigem autenticacao.

## Endpoint de previa real
- `POST /api/reports/preview`

Entrada:
- `selectedTables`
- `selectedFields` (`fieldId`, `alias`)
- `relations`
- `filters`
- `settings` (`orderByFieldId`, `orderDirection`, `limit`, `page`, `pageSize`, `maskCpf`, `maskName`, `removeDuplicates`)
- `reportModelId` (opcional)

Saida:
- `columns`
- `rows`
- `pagination`
- `summary`
- `warnings`

## Frontend: consumo e fallback
Servicos:
- `frontend/src/modules/relatorios/services/reportMetadataService.ts`
- `frontend/src/modules/relatorios/services/reportPreviewService.ts`

Comportamento:
1. tenta API primeiro;
2. em indisponibilidade, usa fallback local;
3. exibe aviso amigavel.

Avisos:
- metadados: `Nao foi possivel carregar metadados do servidor. Usando catalogo local temporario.`
- previa: `Nao foi possivel gerar a previa real. Exibindo previa local temporaria.`

Simulacao de fallback apenas em ambiente local/desenvolvimento:
- `?simulateMetadataFallback=1`: força uso de catalogo local temporario.
- `?simulatePreviewFallback=1`: força uso de previa local temporaria.

Observacao:
- esses parametros nao ativam fallback em producao (`import.meta.env.DEV`).

## Ajustes finos de UX (fase atual)
- botao `Atualizar previa` indica carregamento (`Carregando previa...`) e fica desabilitado durante a consulta;
- card de previa mostra estado de processamento (`Consultando dados, aguarde...`);
- painel de tabelas destaca melhor categorias com contador por grupo;
- campos das tabelas exibem tooltips explicitos para checkbox e icone de conexao;
- ligacoes manuais fora do catalogo aparecem com selo `Nao homologada` antes da execucao da previa;
- tela `Meus modelos salvos` traz filtro com label `Filtrar por categoria` e estado vazio especifico por categoria.

## Compatibilidade com modelos salvos
Ao abrir modelo salvo:
- configuracoes sao restauradas;
- se tabela/campo nao existir no catalogo atual, a tela segue funcional e avisa o usuario.

## Limitacoes atuais
- sem exportacao real do construtor;
- sem painel administrativo para manter o catalogo;
- logs de previa sem tela administrativa de consulta.

## Proxima fase recomendada
- execucao controlada do relatorio salvo;
- exportacao real com seguranca;
- auditoria operacional mais completa.
