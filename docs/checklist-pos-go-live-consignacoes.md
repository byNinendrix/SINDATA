# Checklist Pós-Go-Live — Visão por Contribuição Sindical

## 1. Identificação

- Sistema: SINDATA — Inteligência Sindical
- Módulo: Dashboard
- Funcionalidade: Visão por Contribuição Sindical / Consignações
- Documento de aceite relacionado: `docs/aceite-visao-contribuicao-sindical.md`
- Janela de acompanhamento: 24h e 72h após liberação

## 2. Monitoramento nas primeiras 24h

### API

Validar:

- endpoints de consignações retornando 200 com token;
- ausência de 404;
- ausência de 500;
- ausência de erro de autenticação indevida;
- tempo de resposta abaixo de 300ms nos cenários comuns.

Endpoints:

- `GET /api/dashboard/consignacoes/resumo`
- `GET /api/dashboard/consignacoes/por-regiao`
- `GET /api/dashboard/consignacoes/por-periodo`
- `GET /api/dashboard/consignacoes/por-situacao`
- `GET /api/dashboard/consignacoes/por-ente-publico`
- `GET /api/dashboard/consignacoes/inconsistencias`

### Frontend

Validar:

- seção carregando no dashboard;
- cards renderizando;
- blocos expansíveis funcionando;
- filtros locais atualizando dados;
- estado vazio funcionando;
- ausência de erro crítico no Console;
- ausência de loop de chamadas no Network.

### Dados

Validar:

- Total Contribuído coerente com o banco;
- Quantidade de Registros coerente;
- Quantidade de Contribuintes coerente;
- Percentuais fechando aproximadamente em 100%;
- “Sem situação” exibido corretamente quando houver situação vazia/nula.

### Regressão

Validar que continuam funcionando:

- dashboard antigo;
- login/logout;
- navegação lateral;
- gerador de relatórios;
- modelos salvos.

## 3. Monitoramento nas primeiras 72h

Validar:

- estabilidade dos tempos de resposta;
- ausência de reclamações dos usuários;
- ausência de divergência de valores reportada;
- ausência de travamento no dashboard;
- ausência de crescimento anormal de logs de erro;
- comportamento consistente em horários de maior uso.

## 4. Critérios de alerta

Abrir ocorrência se houver:

- qualquer endpoint de consignações retornando 500;
- retorno 404 em rota já homologada;
- erro de autenticação indevida para usuário logado;
- divergência entre SQL e API;
- dashboard travando ou tela branca;
- tempo médio recorrente acima de 300ms;
- erro visual que impeça leitura dos indicadores;
- regressão em dashboards antigos.

## 5. Ações recomendadas em caso de incidente

1. Registrar horário, usuário e cenário.
2. Capturar print da tela.
3. Capturar Console e Network.
4. Coletar endpoint, status HTTP e payload.
5. Comparar com SQL direto, se for divergência de dado.
6. Verificar se o processo correto da API está rodando em 127.0.0.1:3334.
7. Não aplicar correção sem diagnóstico.
8. Priorizar correção isolada, sem mexer em regra de negócio.

## 6. Checklist rápido

### 24h

- [ ] Endpoints novos 200
- [ ] Sem 404
- [ ] Sem 500
- [ ] Tempo médio aceitável
- [ ] Cards carregando
- [ ] Filtros funcionando
- [ ] Blocos expansíveis funcionando
- [ ] Console sem erro crítico
- [ ] Network sem loop
- [ ] Dashboards antigos funcionando

### 72h

- [ ] Sem reclamações de usuários
- [ ] Sem divergência de valores
- [ ] Sem erro recorrente em logs
- [ ] Performance estável
- [ ] Sem regressão visual
- [ ] Sem regressão funcional

## 7. Encerramento do acompanhamento

Registrar:

- Data/hora do encerramento;
- Responsável;
- Status final:
  - Estável
  - Estável com observações
  - Requer ajuste
- Observações;
- Próximas ações, se houver.
