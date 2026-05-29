# Checklist Operacional - Validacao Visual/Manual

Modulo: Gerador de Relatorios do SINDATA  
Ambiente: ____________________________  
Data: ____/____/________  
Validador(a): ____________________________  
Usuario utilizado: ____________________________

## 1. Login e acesso
- [ ] Entrar no sistema com usuario real.
- [ ] Acessar o menu Gerador de Relatorios.
- [ ] Confirmar que a tela abre sem erro.
- [ ] Confirmar que nao aparece tela em branco.
- [ ] Confirmar que nao ha erro visivel no console do navegador.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 2. Carregamento de metadados
- [ ] Confirmar que as tabelas aparecem no painel esquerdo.
- [ ] Confirmar que a busca por tabelas funciona.
- [ ] Confirmar que as categorias aparecem agrupadas com titulo e contador (ex.: Pessoas e Filiacoes (2)).
- [ ] Confirmar que nao aparece aviso de catalogo local temporario quando API esta ativa.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 3. Selecao de tabelas
- [ ] Selecionar Pessoas.
- [ ] Selecionar Filiacoes.
- [ ] Selecionar Predio.
- [ ] Confirmar que os cards aparecem no canvas.
- [ ] Confirmar que os cards nao piscam.
- [ ] Confirmar que os cards nao mudam de posicao sozinhos.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 4. Selecao de campos
- [ ] Marcar CPF e Nome em Pessoas.
- [ ] Marcar Status em Filiacoes.
- [ ] Marcar Descricao em Predio.
- [ ] Confirmar que os campos aparecem no painel Campos do relatorio.
- [ ] Passar mouse no checkbox e validar tooltip: "Marcar campo para aparecer no relatorio".
- [ ] Passar mouse no icone de conexao e validar tooltip: "Arraste para criar uma ligacao com outro campo".
- [ ] Confirmar que checkbox nao inicia arraste.
- [ ] Confirmar que o icone de ligacao nao marca campo como retorno.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 5. Ligacoes visuais
- [ ] Criar ligacao Pessoas.CPF -> Filiacoes.CPF.
- [ ] Criar ligacao Filiacoes.CODIGO_PREDIO -> Predio.CODIGO.
- [ ] Confirmar que as linhas aparecem no canvas.
- [ ] Confirmar que as linhas acompanham os cards ao mover.
- [ ] Confirmar que as ligacoes aparecem na secao Ligacoes criadas.
- [ ] Confirmar que ligacoes nao homologadas exibem selo "Nao homologada" na lista.
- [ ] Remover uma ligacao e confirmar que a linha some.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 6. Zoom, pan e movimentacao
- [ ] Usar Zoom +.
- [ ] Usar Zoom -.
- [ ] Usar Centralizar.
- [ ] Usar Ajustar a tela.
- [ ] Usar Resetar layout.
- [ ] Mover cards no canvas.
- [ ] Confirmar que nenhum botao falha.
- [ ] Confirmar que o canvas nao pisca.
- [ ] Confirmar que zoom nao reseta sozinho.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 7. Previa real simples
- [ ] Montar relatorio apenas com Pessoas.
- [ ] Selecionar CPF e Nome.
- [ ] Clicar Atualizar previa.
- [ ] Confirmar que o botao muda para "Carregando previa..." e fica desabilitado durante a consulta.
- [ ] Confirmar que o card "Previa do resultado" mostra "Consultando dados, aguarde...".
- [ ] Confirmar que retorna dados reais.
- [ ] Confirmar que CPF vem mascarado.
- [ ] Com "Mascarar Nome" desmarcado, confirmar que Nome vem completo.
- [ ] Com "Mascarar Nome" marcado, confirmar que Nome vem mascarado.
- [ ] Confirmar que nao aparece SQL, stack trace ou erro tecnico.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 8. Previa com filtro
- [ ] Adicionar filtro Pessoas.Nome contem Maria.
- [ ] Clicar Atualizar previa.
- [ ] Confirmar que o resultado e atualizado.
- [ ] Se nao houver dados, confirmar mensagem: "Nenhum registro encontrado para os filtros aplicados."

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 9. Previa com relacao homologada
- [ ] Selecionar Pessoas e Filiacoes.
- [ ] Criar ligacao Pessoas.CPF -> Filiacoes.CPF.
- [ ] Selecionar campos das duas tabelas.
- [ ] Clicar Atualizar previa.
- [ ] Confirmar que preview retorna dados.
- [ ] Confirmar que a ligacao visual permanece na tela.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 10. Relacao nao homologada
- [ ] Criar uma ligacao manual nao homologada (exemplo: Pessoas.Nome -> Filiacoes.Status).
- [ ] Confirmar que a ligacao recebe selo visual "Nao homologada".
- [ ] Clicar Atualizar previa.
- [ ] Confirmar mensagem: "Esta ligacao ainda nao esta homologada no catalogo de dados. Use uma ligacao sugerida pelo catalogo ou solicite homologacao da relacao."
- [ ] Confirmar que a tela continua funcionando.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 11. Salvar modelo
- [ ] Montar relatorio valido.
- [ ] Clicar Salvar relatorio.
- [ ] Preencher nome, descricao, categoria e visibilidade.
- [ ] Confirmar mensagem de sucesso.
- [ ] Confirmar que nao aparece aviso de modo local se API estiver funcionando.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 12. Meus modelos salvos
- [ ] Abrir Meus modelos salvos.
- [ ] Confirmar que o modelo salvo aparece.
- [ ] Testar busca por nome.
- [ ] Testar filtro por categoria com o label "Filtrar por categoria" e opcao "Todas as categorias".
- [ ] Ao selecionar categoria sem resultados, confirmar mensagem: "Nenhum modelo encontrado para esta categoria."
- [ ] Abrir modelo salvo.
- [ ] Confirmar que tabelas, campos, filtros, ligacoes e layout sao restaurados.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 13. Duplicar e excluir
- [ ] Duplicar modelo salvo.
- [ ] Confirmar nome "Copia de ...".
- [ ] Abrir copia e confirmar que configuracao foi preservada.
- [ ] Excluir modelo.
- [ ] Confirmar que aparece confirmacao antes de excluir.
- [ ] Confirmar que modelo sai da lista.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 14. Fallback visual
- [ ] Em ambiente local/dev, abrir a rota com `?simulatePreviewFallback=1`.
- [ ] Clicar Atualizar previa.
- [ ] Confirmar mensagem: "Nao foi possivel gerar a previa real. Exibindo previa local temporaria."
- [ ] Confirmar que a tela nao quebra.
- [ ] Em ambiente local/dev, abrir a rota com `?simulateMetadataFallback=1` e confirmar aviso de catalogo local temporario.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 15. Responsividade
- [ ] Testar em tela grande.
- [ ] Testar em tela menor.
- [ ] Confirmar que paineis nao sobrepoem botoes.
- [ ] Confirmar que o canvas continua utilizavel.
- [ ] Confirmar que modais aparecem corretamente.

Status: `Aprovado / Reprovado`  
Observacao: _______________________________________________

## 16. Evidencias por cenario
Use este bloco para cada falha ou observacao relevante.

### Registro de evidencia #1
- Cenario: ____________________________
- Status: `Aprovado / Reprovado`
- Mensagem exibida: ____________________________
- Observacao: ____________________________
- Passos para reproduzir:
  - Passo 1: ____________________________
  - Passo 2: ____________________________
  - Passo 3: ____________________________
- Print/arquivo: ____________________________

### Registro de evidencia #2
- Cenario: ____________________________
- Status: `Aprovado / Reprovado`
- Mensagem exibida: ____________________________
- Observacao: ____________________________
- Passos para reproduzir:
  - Passo 1: ____________________________
  - Passo 2: ____________________________
  - Passo 3: ____________________________
- Print/arquivo: ____________________________

### Registro de evidencia #3
- Cenario: ____________________________
- Status: `Aprovado / Reprovado`
- Mensagem exibida: ____________________________
- Observacao: ____________________________
- Passos para reproduzir:
  - Passo 1: ____________________________
  - Passo 2: ____________________________
  - Passo 3: ____________________________
- Print/arquivo: ____________________________

---

## Conclusao da validacao visual
- Preview real via UI aprovado? `Sim / Nao`
- Fallback visual aprovado? `Sim / Nao`
- Modelos salvos aprovados? `Sim / Nao`
- Canvas estavel? `Sim / Nao`
- Pendencias encontradas: _______________________________________________
- Decisao: `Liberar para proxima fase / Corrigir antes`
