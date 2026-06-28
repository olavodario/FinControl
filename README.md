# FinControl

Sistema de gestao financeira pessoal. Registre receitas e despesas, categorize transacoes, acompanhe saldo por conta e monitore orcamento mensal - tudo em tempo real.

## Pre-requisitos

- Node.js 20+
- pnpm 9+
- XAMPP com MariaDB rodando na porta 3306

## Rodando localmente

### 1. Criar o banco de dados

Abra o MySQL/MariaDB (via phpMyAdmin ou terminal) e execute:

```sql
CREATE DATABASE IF NOT EXISTS fincontrol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configurar variaveis de ambiente

```bash
# Backend
cp apps/api/.env.example apps/api/.env
# Edite apps/api/.env com seus valores (JWT_SECRET, JWT_REFRESH_SECRET)

# Frontend
cp apps/web/.env.example apps/web/.env
```

### 3. Instalar dependencias

```bash
pnpm install
```

### 4. Gerar o cliente Prisma e aplicar migrations

```bash
cd apps/api
pnpm db:generate
pnpm db:migrate
cd ../..
```

### 5. Subir os servidores

```bash
pnpm dev
```

- API: http://localhost:3333
- Web: http://localhost:5173

## Scripts disponiveis

| Script           | Descricao                                   |
| ---------------- | ------------------------------------------- |
| `pnpm dev`       | Sobe API e frontend em modo desenvolvimento |
| `pnpm build`     | Compila todos os packages e apps            |
| `pnpm lint`      | Roda ESLint em todo o projeto               |
| `pnpm test`      | Executa todos os testes com Vitest          |
| `pnpm typecheck` | Verifica tipos TypeScript em todo o projeto |
| `pnpm format`    | Formata o codigo com Prettier               |

## Verificando a API

```bash
curl http://localhost:3333/health
# {"status":"ok","timestamp":"..."}
```

## Deploy (Vercel)

> O banco de dados deve ser acessivel publicamente (ex: PlanetScale, Railway, Neon, Supabase).  
> XAMPP local nao funciona em producao.

### API (apps/api)

1. Importe o projeto `apps/api` na Vercel como um novo projeto
2. Configure as variaveis de ambiente no painel da Vercel:

| Variavel             | Valor                                                           |
| -------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`       | Connection string do banco remoto                               |
| `JWT_SECRET`         | Secret longo e aleatorio                                        |
| `JWT_REFRESH_SECRET` | Secret longo e aleatorio (diferente)                            |
| `NODE_ENV`           | `production`                                                    |
| `FRONTEND_URL`       | URL do deploy do frontend (ex: `https://fincontrol.vercel.app`) |

3. Build command: `pnpm build` | Output: `dist`

### Frontend (apps/web)

1. Importe o projeto `apps/web` na Vercel como um novo projeto
2. Configure a variavel de ambiente:

| Variavel       | Valor                                                          |
| -------------- | -------------------------------------------------------------- |
| `VITE_API_URL` | URL do deploy da API (ex: `https://fincontrol-api.vercel.app`) |

3. Build command: `pnpm build` | Output: `dist`

## Stack

| Camada    | Tecnologia                    |
| --------- | ----------------------------- |
| Frontend  | React 18 + Vite + TailwindCSS |
| Backend   | Node.js + Express + Prisma    |
| Banco     | MariaDB (XAMPP)               |
| Monorepo  | pnpm workspaces + Turborepo   |
| Linguagem | TypeScript 5 (strict)         |
