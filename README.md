# SINDATA - Inteligência Sindical

Base inicial completa do projeto com:

- Backend: Fastify + TypeScript + SQL Server (mssql)
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Login com JWT usando tabela `FR_USUARIO`
- Dashboard protegido com rota autenticada

## Estrutura

- `backend/`
- `frontend/`

## 1) Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` baseado em `.env.example`.

```bash
npm run dev
```

API: `http://localhost:3333`

## 2) Frontend

```bash
cd frontend
npm install
```

Crie o arquivo `.env` baseado em `.env.example`.

```bash
npm run dev
```

App: `http://localhost:5173`

## Execucao Unica (mais estavel)

Modo recomendado para evitar quedas do frontend:

1. Build do frontend:
```bash
cd frontend
npm run build
```
2. Build do backend:
```bash
cd ../backend
npm run build
```
3. Subir apenas o backend:
```bash
npm run start
```

Nesse modo, o backend passa a servir a API e o frontend na mesma porta:

- `http://localhost:3333/login`
- `http://192.168.1.92:3333/login`

## Execucao com Watchdog (opcional)

Para evitar queda do sistema durante uso, utilize o modo estavel com watchdog:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-stable.ps1
```

Esse modo:

- builda backend e frontend
- sobe backend em producao (`node dist/server.js`)
- sobe frontend em preview (`vite preview`)
- monitora as portas/health e reinicia automaticamente se algum processo cair

Se quiser rebuildar backend/frontend antes de subir:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-stable.ps1 -Rebuild
```

Para parar tudo:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\stop-stable.ps1
```

## Rotas principais (backend)

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me` (protegida)
- `GET /api/dashboard/resumo` (protegida)

## Observações

- Não há credenciais fixas no código.
- Conexão SQL Server via variáveis de ambiente.
- Autenticação atual usa comparação simples de senha para MVP.
- Há TODO técnico para validar padrão real de criptografia/hash do SGS/Maker antes de produção.
