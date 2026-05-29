# Atualização de Servidor - SINDATA (Playbook)

Este guia consolida o procedimento validado em produção para atualizar o SINDATA com segurança, sem perder tempo e sem risco para o banco.

## 1) Princípios de segurança

- Não executar comandos de banco (DDL/DML/migrations) durante deploy da aplicação.
- Atualizar apenas código, build e processos.
- Antes de atualizar, preservar alterações locais com `stash`.
- Rodar um comando por vez e validar saída.

## 2) Portas oficiais

- Frontend (acesso do usuário): `3333`
  - URL: `http://<IP_DO_SERVIDOR>:3333`
- Backend API: `3334`
  - Health: `http://127.0.0.1:3334/api/health`
  - API base: `http://<IP_DO_SERVIDOR>:3334/api`

## 3) Node.js usado no SINDATA

- Node dedicado da aplicação:  
  `D:\Apps\_runtime\node-v20.19.0-win-x64\node.exe`
- Não depender do Node global (ex.: v18) para backend/frontend deste projeto.

## 4) Pré-check rápido (antes do pull)

```powershell
cd D:\Apps\SINDATA
git status -sb
git fetch origin
git stash push -u -m "backup-local-antes-update-producao"
git pull --ff-only origin main
```

## 5) Build com Node 20 (obrigatório)

```powershell
$env:PATH = "D:\Apps\_runtime\node-v20.19.0-win-x64;$env:PATH"
cd D:\Apps\SINDATA\backend
npm run build
cd ..\frontend
npm run build
```

## 6) Configuração de produção do frontend

Arquivo:

- `D:\Apps\SINDATA\frontend\.env.production`

Conteúdo:

```env
VITE_API_URL=http://192.168.1.15:3334/api
```

Depois de alterar `.env.production`, rebuild do frontend:

```powershell
$env:PATH = "D:\Apps\_runtime\node-v20.19.0-win-x64;$env:PATH"
cd D:\Apps\SINDATA\frontend
npm run build
```

## 7) Scripts estáveis (estado correto)

### `scripts/start-stable.ps1`

- Backend deve subir com Node 20 dedicado:

```powershell
-FilePath 'D:\Apps\_runtime\node-v20.19.0-win-x64\node.exe'
```

- Frontend preview deve subir na porta `3333`:

```powershell
--port', '3333'
```

- No `Save-Pid`, usar parâmetro `ProcessId` (não `Pid`):

```powershell
[int] $ProcessId
Save-Pid -Name $Name -ProcessId $proc.Id
```

### `scripts/watchdog-stable.ps1`

- Restart do backend com Node 20 dedicado:

```powershell
-FilePath 'D:\Apps\_runtime\node-v20.19.0-win-x64\node.exe'
```

- Health check do backend em `3334`:

```powershell
http://127.0.0.1:3334/api/health
```

- Health check do frontend em `3333`:

```powershell
http://127.0.0.1:3333
```

## 8) Subida padrão

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File D:\Apps\SINDATA\scripts\stop-stable.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File D:\Apps\SINDATA\scripts\start-stable.ps1
```

> Observação: erro de lock em `watchdog.out.log` pode acontecer; não necessariamente derruba backend/frontend. Validar por health e portas.

## 9) Validação pós-deploy

```powershell
netstat -ano | findstr /R /C:":3333" /C:":3334"
```

Esperado:

- `0.0.0.0:3333 LISTENING`
- `0.0.0.0:3334 LISTENING`

Health backend:

```powershell
try { (Invoke-WebRequest -Uri http://127.0.0.1:3334/api/health -UseBasicParsing -TimeoutSec 5).StatusCode } catch { $_.Exception.Message }
```

Esperado: `200`.

No navegador:

1. Abrir `http://192.168.1.15:3333`
2. `Ctrl + F5`
3. Login novamente

## 10) Diagnóstico rápido de falhas comuns

### A) `TypeError: diagnostics.tracingChannel is not a function`

Causa: backend rodando com Node 18.

Correção: garantir Node 20 no `start-stable.ps1` e `watchdog-stable.ps1`.

### B) Frontend novo e API retornando `404` em endpoints novos

Causa comum: processo antigo ocupando `3334`.

Comandos:

```powershell
$pid3334 = (Get-NetTCPConnection -LocalPort 3334 -State Listen).OwningProcess
Get-Process -Id $pid3334 | Select-Object Id,ProcessName,Path,StartTime
Stop-Process -Id <PID_ANTIGO> -Force
```

Subir backend novo:

```powershell
Start-Process -FilePath "D:\Apps\_runtime\node-v20.19.0-win-x64\node.exe" -ArgumentList "dist/server.js" -WorkingDirectory "D:\Apps\SINDATA\backend" -WindowStyle Hidden
```

Teste do endpoint (sem token pode retornar 401, e isso é OK):

```powershell
try { (Invoke-WebRequest -Uri http://127.0.0.1:3334/api/dashboard/sexo-distribuicao -UseBasicParsing -TimeoutSec 5).StatusCode } catch { if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { $_.Exception.Message } }
```

### C) `401 Unauthorized` no browser após deploy

Causa: token expirado ou origem diferente.

Correção: `Ctrl + F5` + login novamente.

### D) `401` no `/api/auth/login` mesmo com usuário/senha corretos

Causa comum: processo antigo no `:3334` ainda ativo, mesmo após pull/build.

Passo 1 - confirmar processo real que escuta `3334` (não usar variável `$pid`, ela é reservada no PowerShell):

```powershell
$backendProcId = (Get-NetTCPConnection -LocalPort 3334 -State Listen | Select-Object -First 1 -ExpandProperty OwningProcess)
Get-CimInstance Win32_Process -Filter "ProcessId = $backendProcId" | Select-Object ProcessId, ExecutablePath, CommandLine
```

Passo 2 - reciclar backend de forma cirúrgica:

```powershell
Stop-Process -Id $backendProcId -Force
Start-Process -FilePath "D:\Apps\_runtime\node-v20.19.0-win-x64\node.exe" -ArgumentList "dist/server.js" -WorkingDirectory "D:\Apps\SINDATA\backend" -WindowStyle Hidden
```

Passo 3 - validar login direto na API:

```powershell
$body = '{"login":"master","senha":"701202"}'
Invoke-WebRequest -Uri "http://127.0.0.1:3334/api/auth/login" -Method POST -ContentType "application/json; charset=utf-8" -Body $body -UseBasicParsing
```

Esperado: `200` com `token`.

### E) Regra de senha legada do SGS (importante)

Nesta base, o usuário `master` usa hash legado `MD5(USR_CODIGO + senha)` no `FR_USUARIO.USR_SENHA`.
Logo, o backend precisa manter compatibilidade com:

- texto puro
- `MD5(senha)`
- `MD5(senha+senha)`
- `MD5(codigo+senha)` (legado observado em produção)
- `SHA1(senha)`

Se login funcionar no teste direto do `AuthService` mas falhar no endpoint HTTP, o problema é processo antigo/estado, não regra de senha.

## 11) Versionar mudanças operacionais no servidor

Quando houver ajuste de script/env em produção:

```powershell
cd D:\Apps\SINDATA
git add scripts/start-stable.ps1 scripts/watchdog-stable.ps1 frontend/.env.production frontend/src/modules/dashboard/pages/DashboardPage.tsx
git commit -m "fix(prod): ajustes de runtime/portas para deploy estável"
git push origin main
```

## 12) Checklist curto (copiar e usar)

1. `git status -sb`
2. `git fetch origin`
3. `git stash push -u -m "backup-local-antes-update-producao"`
4. `git pull --ff-only origin main`
5. Garantir `.env.production` com `:3334/api`
6. Build backend/frontend com Node 20
7. `stop-stable` -> `start-stable`
8. Validar `3333`, `3334`, health `200`
9. `Ctrl+F5` e login

## 13) Padrao funcional (Dashboard - Regiao/Inconsistencias)

- O botao `Inconsistencias (N)` e padrao nas distribuicoes por regiao.
- Ao abrir, mostrar `CPF` e `Nome` para manutencao.
- No card "Situacao dos Desfiliados":
  - base obrigatoria: `FILIADO.ASSOCIADO = 0`
  - inconsistencias por regiao devem cobrir todas as situacoes ativas.

## 14) Hardening anti-regressao (obrigatorio apos incidentes)

### A) Nao editar `.tsx/.ts/.js` com `Get-Content` + `Set-Content` no Windows PowerShell 5.1

Risco: quebrar acentuacao (`Visao`, `Filiacao`) por encoding.

Use leitura/escrita explicita em UTF-8:

```powershell
$path = "D:\Apps\SINDATA\frontend\src\modules\dashboard\pages\DashboardPage.tsx"
$raw = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
# ...alteracao controlada...
[System.IO.File]::WriteAllText($path, $raw, [System.Text.UTF8Encoding]::new($false))
```

Se quebrar encoding acidentalmente, restaurar arquivo e refazer com metodo seguro:

```powershell
cd D:\Apps\SINDATA
git checkout -- frontend/src/modules/dashboard/pages/DashboardPage.tsx
```

### B) Confirmacao de rota nova no backend (teste sem token)

Para rotas protegidas novas, o esperado sem token e `401` (nao `404`).
Isso prova que a rota existe no processo em execucao.

```powershell
try { (Invoke-WebRequest -Uri "http://127.0.0.1:3334/api/dashboard/filiacao-situacao-regiao-esfera-sexo-distribuicao?situacaoCodigo=3&regiaoCodigo=AJ&esfera=ESTADO" -UseBasicParsing -TimeoutSec 5).StatusCode } catch { if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { $_.Exception.Message } }
```

### C) Se der `404` em rota nova, reciclar backend de forma cirurgica

```powershell
$backendProcId = (Get-NetTCPConnection -LocalPort 3334 -State Listen | Select-Object -First 1 -ExpandProperty OwningProcess)
Get-CimInstance Win32_Process -Filter "ProcessId = $backendProcId" | Select-Object ProcessId, ExecutablePath, CommandLine
Stop-Process -Id $backendProcId -Force
Start-Process -FilePath "D:\Apps\_runtime\node-v20.19.0-win-x64\node.exe" -ArgumentList "dist/server.js" -WorkingDirectory "D:\Apps\SINDATA\backend" -WindowStyle Hidden
```

### D) Evitar comandos gigantes em linha unica

- Preferir 1 comando por vez (padrao deste playbook).
- Evitar blocos longos com `;` em producao.
- Validar resultado apos cada passo (build, stop/start, portas, health).

## 15) Smoke test minimo apos deploy (frontend + backend)

1. Portas:
```powershell
netstat -ano | findstr /R /C:":3333" /C:":3334"
```

2. Health backend:
```powershell
try { (Invoke-WebRequest -Uri http://127.0.0.1:3334/api/health -UseBasicParsing -TimeoutSec 5).StatusCode } catch { $_.Exception.Message }
```

3. Rota protegida critica (sem token):
```powershell
try { (Invoke-WebRequest -Uri "http://127.0.0.1:3334/api/dashboard/filiacao-situacao-regiao-esfera-sexo-distribuicao?situacaoCodigo=3&regiaoCodigo=AJ&esfera=ESTADO" -UseBasicParsing -TimeoutSec 5).StatusCode } catch { if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { $_.Exception.Message } }
```
Esperado: `401` (se vier `404`, backend errado/antigo em execucao).

4. Browser:
  - `Ctrl + F5`
  - login novamente
  - validar tela sem texto quebrado de acentuacao

