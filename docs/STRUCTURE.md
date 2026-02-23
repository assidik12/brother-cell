# Brother Cell - Project Structure

## 📁 Struktur Folder

```
brother_cell/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes (Controller Layer)
│   │   ├── auth/              # Authentication endpoints
│   │   └── user/              # User management
│   ├── admin/                  # Admin dashboard pages
│   ├── auth/                   # Auth pages (login, register)
│   ├── components/             # UI Components (Atomic Design)
│   │   ├── atoms/             # Basic building blocks
│   │   ├── molecules/         # Combinations of atoms
│   │   ├── organisms/         # Complex UI sections (TBD)
│   │   └── templates/         # Page layouts (TBD)
│   ├── lib/                    # Utility libraries
│   ├── providers/              # React context providers
│   ├── stores/                 # Zustand state management
│   ├── types/                  # TypeScript type definitions
│   └── validators/             # Zod validation schemas
│
├── src/                        # Business Logic Layer
│   ├── repositories/           # Database access layer
│   └── services/               # Business logic layer
│
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma
│   └── migrations/
│
├── generated/                  # Auto-generated files (Prisma client)
│
└── public/                     # Static assets
```

## 🏗️ Architecture (3-Layer)

### 1. Controller Layer (`app/api/`)

- Handles HTTP request/response
- Input validation with Zod
- Calls Service layer
- Returns formatted response

### 2. Service Layer (`src/services/`)

- Contains business logic
- No direct database queries
- Calls Repository layer
- Returns ServiceResult

### 3. Repository Layer (`src/repositories/`)

- Database queries with Prisma
- Returns raw entities
- No business logic

## 📦 Dependencies

| Package                 | Purpose        |
| ----------------------- | -------------- |
| `next`                  | Framework      |
| `prisma`                | ORM            |
| `next-auth`             | Authentication |
| `@tanstack/react-query` | Server state   |
| `zustand`               | Client state   |
| `zod`                   | Validation     |
| `react-hook-form`       | Form handling  |
| `tailwindcss`           | Styling        |

## 🎨 Atomic Design

| Level         | Description       | Examples                            |
| ------------- | ----------------- | ----------------------------------- |
| **Atoms**     | Basic UI elements | Button, Input, Badge, Modal         |
| **Molecules** | Atom combinations | FormField, SearchBar, ConfirmDialog |
| **Organisms** | Complex sections  | ProductTable, Sidebar (TBD)         |
| **Templates** | Page layouts      | DashboardLayout (TBD)               |

## 📝 Naming Conventions

| Type       | Convention  | Example                      |
| ---------- | ----------- | ---------------------------- |
| Files      | kebab-case  | `auth.service.ts`            |
| Components | PascalCase  | `Button`, `FormField`        |
| Functions  | camelCase   | `validateCredentials`        |
| Database   | snake_case  | `created_at`, `phone_number` |
| Constants  | UPPER_SNAKE | `BCRYPT_ROUNDS`              |

## 🔒 Security Rules

1. **Input Validation**: All user input validated with Zod
2. **Password Hashing**: bcrypt with 12 rounds
3. **Route Protection**: Middleware + NextAuth
4. **Race Condition**: Database transactions with row locking (vouchers)
