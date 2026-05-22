# Ato Financeiro

Ferramenta de controle financeiro pessoal e empresarial, pronta para produção.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Charts | Recharts |
| State | Zustand + React Query (TanStack) |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Banco de dados | PostgreSQL |
| Auth | JWT + bcrypt |
| Testes | Vitest (frontend) + Jest + Supertest (backend) |
| Export | ExcelJS (XLSX) + CSV nativo |
| Deploy | Docker + Nginx |

---

## Funcionalidades

- **Dashboard** — saldo do mês, cards de receita/despesa, gráfico de evolução, gráfico de categorias e alertas de orçamento
- **Transações** — CRUD completo, filtros por data/categoria/tipo/valor/busca, paginação, suporte a recorrência
- **Relatórios** — gráfico de área, barras de comparação, pizza por categoria, ranking e exportação Excel/CSV
- **Orçamentos** — limites por categoria/mês com barra de progresso, alerta configurável (%), indicador de excesso
- **Categorias** — categorias padrão + personalizadas com cor e ícone
- **Configurações** — perfil, moeda, idioma, troca de senha
- **Autenticação** — registro, login, refresh token automático, logout seguro
- **Dark mode** — toggle persistido no localStorage

---

## Requisitos

- Node.js 20+
- PostgreSQL 14+ (ou Docker)

---

## Instalação e execução local

### 1. Clonar e instalar dependências

```bash
git clone <repo-url>
cd ato-finaceiro

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configurar variáveis de ambiente do backend

```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL e JWT secrets
```

### 3. Criar banco de dados e rodar migrations

```bash
cd backend
npm run db:migrate     # cria as tabelas
npm run db:seed        # insere categorias padrão
```

### 4. Iniciar em desenvolvimento

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
# API disponível em http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
# App disponível em http://localhost:5173
```

---

## Deploy com Docker

```bash
# Copiar variáveis de ambiente
cp backend/.env.example .env

# Editar .env com JWT_SECRET e JWT_REFRESH_SECRET seguros

# Subir todos os serviços (PostgreSQL + API + Frontend/Nginx)
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

O app ficará disponível em **http://localhost**.

---

## Testes

```bash
# Frontend (Vitest)
cd frontend && npm test

# Backend (Jest + Supertest)
# Requer PostgreSQL de teste em TEST_DATABASE_URL
cd backend && npm test

# Coverage
cd frontend && npm run test:coverage
cd backend && npm run test:coverage
```

---

## Estrutura do projeto

```
ato-finaceiro/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Modelos do banco de dados
│   │   └── seed.ts            # Categorias padrão
│   ├── src/
│   │   ├── controllers/       # Handlers HTTP
│   │   ├── middlewares/       # Auth, validação, erros
│   │   ├── routes/            # Definição de rotas
│   │   ├── services/          # Lógica de negócio
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Logger, Prisma client, erros
│   │   └── app.ts             # Entry point
│   └── tests/                 # Testes de integração
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── charts/        # Recharts (área, pizza, barras)
│       │   ├── layout/        # Sidebar, Header, AppLayout
│       │   ├── modals/        # TransactionModal, BudgetModal, CategoryModal
│       │   └── ui/            # Button, Input, Select, Card, Modal, Badge...
│       ├── hooks/             # React Query hooks por domínio
│       ├── pages/             # Dashboard, Transactions, Reports, Budgets...
│       ├── services/          # Axios clients por domínio
│       ├── store/             # Zustand (auth)
│       ├── types/             # TypeScript types
│       └── utils/             # Formatação de moeda, data, download
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/v1/auth/register` | Cadastro |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Renovar tokens |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/profile` | Perfil do usuário |
| PUT | `/api/v1/auth/profile` | Atualizar perfil |
| PUT | `/api/v1/auth/password` | Alterar senha |

### Transações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/transactions` | Listar com filtros e paginação |
| POST | `/api/v1/transactions` | Criar |
| GET | `/api/v1/transactions/:id` | Detalhes |
| PUT | `/api/v1/transactions/:id` | Atualizar |
| DELETE | `/api/v1/transactions/:id` | Remover |
| GET | `/api/v1/transactions/summary` | Resumo mensal |
| GET | `/api/v1/transactions/by-category` | Agrupamento por categoria |
| GET | `/api/v1/transactions/monthly-evolution` | Evolução mensal |
| GET | `/api/v1/transactions/export/excel` | Exportar XLSX |
| GET | `/api/v1/transactions/export/csv` | Exportar CSV |

### Categorias, Orçamentos
Seguem padrão REST: `GET / POST /:id PUT /:id DELETE /:id`

---

## Segurança

- Senhas com bcrypt (12 rounds)
- JWT access token (7d) + refresh token rotativo (30d) armazenado em banco
- Rate limiting: 100 req / 15 min por IP
- Helmet (headers de segurança)
- CORS restrito ao domínio do frontend
- Validação de entrada com express-validator em todas as rotas
- Todos os dados isolados por `userId` — sem vazamento entre usuários

---

## Melhorias futuras

1. **Importação de OFX/CSV** — importar extrato bancário automaticamente
2. **Metas financeiras** — definir objetivos com progresso visual
3. **Notificações por email** — alertas de orçamento via Nodemailer
4. **Multi-conta** — carteira, conta corrente, poupança, cartão
5. **PWA** — suporte offline com Service Worker
6. **2FA** — autenticação de dois fatores com TOTP
7. **Contas compartilhadas** — finanças familiares com múltiplos usuários
8. **IA** — categorização automática de transações com NLP
