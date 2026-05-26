# Orientação de Regras do Dashboard (SINDATA)

## Regra central de filiação (`FILIADO.ASSOCIADO`)

- `ASSOCIADO = -1`: pessoa está filiada/associada ao SINTSESE (ativa no vínculo sindical).
- `ASSOCIADO = 0`: pessoa está desfiliada (não filiada ao SINTSESE).

## Card: Situação Funcional da Filiação

Título:
- `Situação Funcional da Filiação`

Descrição:
- `Quantidade e percentual por situação da filiação, considerando apenas ASSOCIADOS ativos no cadastro.`

Regra obrigatória:
- Todas as consultas desse card devem considerar somente `FILIADO.ASSOCIADO = -1`.

Isso vale para:
- Total por situação.
- Percentual por situação.
- Distribuição por sexo dentro da situação.
- Distribuição por região dentro da situação.

## Regra de região dentro da Situação Funcional

Base sempre:
- `FILIADO.ASSOCIADO = -1`

Origem da região por situação:
- `SITUACAO = 1` (Ativo): região vem do `PREDIO.REGIAO` via `FILIADO.CODIGO_EMPRESA` + `FILIADO.CODIGO_PREDIO`.
- `SITUACAO = 3` (Aposentado): região vem da pessoa:
  - `PESSOAS.ESTADO` + `PESSOAS.CIDADE` -> `GLO_CIDADE.UF` + `GLO_CIDADE.CIDADE`
  - `GLO_CIDADE.REGIAO` -> `REGIAO.CODIGO`
  - Exibir `REGIAO.DESCRICAO`

## Diferenças de total na distribuição por região

Quando a soma por região for menor que o total da situação, a diferença normalmente é de registros sem região mapeada.

Exemplo validado:
- Aposentados associados (`ASSOCIADO = -1`): `10.106`
- Soma das regiões de aposentados: `10.104`
- Diferença: `2`

Justificativa técnica:
- Existem `2` filiações de aposentados associados sem região válida na cadeia:
  - `PESSOAS(ESTADO/CIDADE)` não encontrou correspondência em `GLO_CIDADE(UF/CIDADE)`, ou
  - `GLO_CIDADE.REGIAO` não encontrou correspondência em `REGIAO.CODIGO`.

## Regra para card de desfiliados

Quando o contexto for desfiliados, aplicar:
- `FILIADO.ASSOCIADO = 0`

Nunca misturar a regra do card de associados (`-1`) com o card de desfiliados (`0`).

## Padrao do botao de inconsistencias (regiao)

- O botao `Inconsistencias (N)` e padrao nas secoes de distribuicao por regiao.
- Ao clicar, deve listar `CPF`, `Nome` e `Motivo` para manutencao cadastral.
- Criterio de inconsistencia:
  - `regiaoCodigo IS NULL`, ou
  - `regiaoCodigo` sem correspondencia em `REGIAO.CODIGO`.
  - `CPF` sem correspondencia em `PESSOAS` (quando o contexto exigir o vinculo com pessoa).

### No card "Situacao dos Desfiliados"

- Sempre usar `FILIADO.ASSOCIADO = 0`.
- O botao de inconsistencias deve considerar **todas as situacoes ativas** (nao apenas `SITUACAO = 3`).

## Padrao do botao de inconsistencias (sexo)

- O botao `Inconsistencias (N)` tambem e padrao nas secoes de distribuicao por sexo.
- Ao clicar, deve listar `CPF`, `Nome` e `Motivo` para manutencao cadastral.
- Criterios minimos de inconsistencia de sexo:
  - `CPF` sem correspondencia em `PESSOAS`;
  - `PESSOAS.SEXO` nulo/vazio;
  - `PESSOAS.SEXO` sem correspondencia em `GENERO.GENERO`.
