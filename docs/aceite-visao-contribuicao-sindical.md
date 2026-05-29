# Aceite Técnico — Visão por Contribuição Sindical

## 1. Identificação

- Sistema: SINDATA — Inteligência Sindical
- Módulo: Dashboard
- Funcionalidade: Visão por Contribuição Sindical / Consignações
- Status final: Aprovado para homologação/go-live
- Data do aceite: 29/05/2026
- Responsável pela validação: validação assistida pelo usuário e runtime local

## 2. Escopo entregue

Foi criada uma nova seção independente no dashboard para análise de consignações/contribuição sindical, contendo:

- cards de resumo;
- distribuição por região;
- distribuição por ano/mês;
- distribuição por situação;
- distribuição por ente público;
- inconsistências/críticas de repasse;
- filtros locais;
- estados de loading, vazio e erro;
- integração com endpoints próprios.

## 3. Arquivos criados

- `backend/src/modules/dashboard/dashboard.consignacoes.types.ts`
- `backend/src/modules/dashboard/dashboard.consignacoes.service.ts`
- `frontend/src/modules/dashboard/services/dashboardConsignacoesService.ts`
- `frontend/src/modules/dashboard/components/ConsignacoesSection.tsx`

## 4. Arquivos alterados

- `backend/src/modules/dashboard/dashboard.controller.ts`
- `backend/src/modules/dashboard/dashboard.routes.ts`
- `frontend/src/modules/dashboard/pages/DashboardPage.tsx`

Observação: a alteração em `DashboardPage.tsx` foi restrita à inclusão da nova seção e import correspondente.

## 5. Endpoints homologados

- `GET /api/dashboard/consignacoes/resumo`
- `GET /api/dashboard/consignacoes/por-regiao`
- `GET /api/dashboard/consignacoes/por-periodo`
- `GET /api/dashboard/consignacoes/por-situacao`
- `GET /api/dashboard/consignacoes/por-ente-publico`
- `GET /api/dashboard/consignacoes/inconsistencias`

Registros da homologação:

- Com token: `200` nos cenários válidos.
- Sem token: `401`.
- Parâmetros inválidos: `400`.
- Nenhum `404` após correção operacional de runtime.
- Nenhum `500` identificado na homologação.

## 6. Cenários de filtros validados

Foram validados:

- sem filtros;
- `ano=2023`;
- `ano=2023&mes=9`;
- `ano=2025`;
- `ano=2026&mes=1`;
- `regiao=AJ`;
- `situacao=3`;
- `codigoEmpresa=0100`;
- `periodoInicio=2023-08&periodoFim=2023-09`;
- `codigoEmpresa=ZZZZ`, com retorno vazio coerente;
- `ano=abc&mes=13`, com retorno `400`.

## 7. Conferência SQL x API

Resumo sem filtros:

- totalContribuido: `1.215.616,14`
- quantidadeRegistros: `19.452`
- quantidadeContribuintes: `11.739`

Conferências consolidadas:

- Por região: SQL e API consistentes, 9 regiões.
- Por período: SQL e API consistentes, 5 períodos.
- Por situação: SQL e API consistentes, com tratamento amigável para `NULL`/vazio como “Sem situação”.
- Por ente público: SQL e API consistentes, 3 entes.
- Inconsistências: SQL `24`, API `24`.

## 8. Validação visual/manual

A validação visual/manual foi aprovada pelo usuário em navegador real.

Itens validados:

- seção “Visão por Contribuição Sindical” renderizada;
- cards principais renderizados;
- blocos expansíveis funcionando;
- filtros locais atualizando dados;
- endpoints retornando `200` na aba Network;
- ausência de erro crítico no Console;
- ausência de regressão visual aparente nos blocos antigos.

## 9. Regressão

Endpoints antigos mantidos com status OK:

- `GET /api/dashboard/resumo`
- `GET /api/dashboard/sexo-distribuicao`
- `GET /api/dashboard/filiacao-situacao-distribuicao`
- `GET /api/dashboard/filiacao-situacao-regiao-distribuicao`

Sem impacto aparente nos blocos:

- Pessoas;
- Filiação;
- Sexo;
- Região;
- Situação Funcional;
- Navegação;
- Login/logout;
- Gerador de Relatórios;
- Modelos Salvos.

## 10. Performance

Tempos observados dos endpoints novos:

- resumo: média `59,75 ms`, pico `178,37 ms`
- por-regiao: média `51,46 ms`, pico `258,48 ms`
- por-periodo: média `26,59 ms`, pico `89,56 ms`
- por-situacao: média `51,94 ms`, pico `270,65 ms`
- por-ente-publico: média `94,46 ms`, pico `210,61 ms`
- inconsistencias: média `6,42 ms`, pico `16,85 ms`

Registros:

- Nenhum endpoint passou de `300 ms` nos recortes principais.
- Índices não foram aplicados.
- Sugestão futura, se necessário: avaliar índice composto em `CONSIGNACAO` para filtros agregados frequentes, com plano de DBA.

## 11. Ocorrência corrigida

Ocorrência inicial de `404`:

- causa raiz: processo órfão antigo em `127.0.0.1:3334` rodando `dist/server.js` desatualizado;
- correção: reinício operacional do processo apontando para `backend/dist` atual;
- impacto: nenhum arquivo de código alterado nessa correção;
- resultado: endpoints deixaram de retornar `404`.

## 12. Confirmações finais

- nenhuma regra de negócio existente foi alterada;
- nenhuma query foi alterada após homologação;
- nenhum endpoint antigo foi alterado;
- nenhuma migration foi criada;
- nenhum índice foi aplicado;
- dashboard antigo permaneceu funcional;
- funcionalidade liberada para homologação/go-live.

## 13. Decisão final

A funcionalidade “Visão por Contribuição Sindical” está aprovada para uso em homologação/go-live, com API, SQL, performance, validação visual/manual e regressão básica validadas. A entrega foi considerada consistente, isolada e sem impacto aparente nas funcionalidades existentes.
