# TicketsFrontend

Painel administrativo em Angular 20 para a API Go **TicketsCrud** (chamados de assistência técnica). Oferece login + CRUD completo sobre as seis entidades: Tickets, Usuários, Categorias, Responsáveis, Comentários e Arquivos.

Stack: Angular 20 (componentes standalone + signals), Tailwind CSS com componentes personalizados (tabelas, diálogos, toasts), autenticação JWT.

## Pré-requisitos

- Node.js 20+ e npm
- A API TicketsCrud em execução e acessível (padrão `http://localhost:8080`)

## Executar (desenvolvimento)

1. Certifique-se de que a API TicketsCrud está em execução. Se ela escutar em um
   endereço diferente de `http://localhost:8080`, defina `BACKEND_URL` (veja
   [Configuração](#configuração)).

2. Inicie o frontend:
   ```bash
   npm install
   npm start          # serve na FRONTEND_PORT (padrão 4200) com o proxy de dev
   ```
   Abra `http://localhost:4200`.

O servidor de desenvolvimento faz proxy de `/api/*` para o backend (veja `proxy.conf.js`), de modo que o navegador nunca faz uma requisição cross-origin durante o desenvolvimento. O destino do proxy e outras configurações são ajustáveis — veja [Configuração](#configuração).

## Configuração

A configuração é controlada por variáveis de ambiente (lidas de um arquivo `.env`
local, se presente — copie `.env.example` para `.env` para começar). Todas são
opcionais; os padrões reproduzem a configuração local padrão. Você também pode
passá-las inline, por exemplo
`BACKEND_URL=http://localhost:9000 FRONTEND_PORT=4300 npm start`.

| Variável | Padrão | Quando se aplica | Descrição |
|----------|--------|------------------|-----------|
| `BACKEND_URL` | `http://localhost:8080` | serve de dev | URL para a qual o proxy do dev-server encaminha `/api`. Usada por `proxy.conf.js`. |
| `FRONTEND_PORT` | `4200` | serve de dev | Porta em que o servidor de desenvolvimento Angular escuta. Usada por `scripts/serve.js`. |
| `API_BASE_URL` | `/api` | tempo de build | URL base que o app chama. Mantenha `/api` em dev (usa o proxy); defina para a origem da API em produção, por exemplo `https://api.example.com`. |
| `PRODUCTION` | `false` | tempo de build | Marca o build como produção (`true`/`false`). |

Como funciona: `BACKEND_URL`/`FRONTEND_PORT` são lidas em tempo de serve de dev
pelos scripts de configuração Node. `API_BASE_URL`/`PRODUCTION` são embutidas no
bundle em tempo de build — `scripts/set-env.js` gera
`src/environments/environment.ts` a partir delas, executado automaticamente pelos
hooks npm `prestart` / `prebuild` (ou manualmente via `npm run set-env`).

## Build (produção)

```bash
npm run build      # gera em dist/TicketsFrontend (executa set-env antes)
```

Em produção, sirva o build estático atrás de um host que faça proxy de `/api`
para a API Go (por exemplo nginx) e mantenha `API_BASE_URL=/api`, ou defina
`API_BASE_URL` para a origem da API antes de fazer o build.

## Estrutura do projeto

```
src/app/
  core/
    models/        Interfaces TypeScript + metadados de enum (espelham a API, snake_case)
    auth/          AuthService, interceptor JWT, guards de rota
    interceptors/  interceptor de erros (exibe erros de texto puro da API como toasts)
    services/      CrudService<T> genérico + um service por entidade
  layout/          MainLayout (shell com sidenav + toolbar)
  shared/          ConfirmDialog, classe base EntityListPage
  features/        login, dashboard e <entidade>/ list + form-dialog por entidade
```
