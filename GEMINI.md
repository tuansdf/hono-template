# Best Practices & Conventions

## 📁 Project Structure

```
src/
├── lib/                    # Shared libraries and infrastructure
│   ├── auth/               # Better Auth configuration
│   ├── config/             # Environment configuration (Zod-validated)
│   ├── db/                 # Drizzle ORM setup + schemas
│   │   └── schema/         # Database table definitions
│   ├── middleware/         # Hono middleware (auth, error handling, logging)
│   ├── types/              # Type augmentations (e.g., Hono context)
│   ├── errors.ts           # Custom error classes
│   ├── logger.ts           # Pino logger with request context
│   └── validator.ts        # Custom Zod validator wrapper
├── modules/                # Feature modules (routes, services, repos)
│   └── [feature]/
│       ├── [feature].router.ts
│       ├── [feature].service.ts
│       ├── [feature].repository.ts
│       ├── [feature].schema.ts     # Zod validation schemas
│       └── [feature].types.ts      # DTOs and interfaces
├── router.ts               # Main router (mounts module routers)
└── server.ts               # Application entry point
```

## 🏗️ Adding Routes, Services & Repositories

### Folder Structure per Feature

For each new feature, create a module folder under `src/modules/`:

```
src/modules/posts/
├── posts.router.ts       # Route definitions
├── posts.service.ts      # Business logic
├── posts.repository.ts   # Database access
├── posts.schema.ts       # Zod validation schemas
└── posts.types.ts        # DTOs and interfaces
```

### 1. Repository Layer (Data Access)

Repositories handle all database operations. Keep them pure data access with no business logic.

```typescript
// src/modules/posts/posts.repository.ts
import { db } from "@/lib/db/client";
import { post } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { CreatePostDto, UpdatePostDto } from "./posts.types";

class PostsRepository {
  async findAll() {
    return db.query.post.findMany();
  }

  async findById(id: string) {
    return db.query.post.findFirst({
      where: eq(post.id, id),
    });
  }

  async create(data: CreatePostDto) {
    const [created] = await db.insert(post).values(data).returning();
    return created;
  }

  async update(id: string, data: UpdatePostDto) {
    const [updated] = await db
      .update(post)
      .set(data)
      .where(eq(post.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    await db.delete(post).where(eq(post.id, id));
  }
}

export const postsRepository = new PostsRepository();
```

### 2. Service Layer (Business Logic)

Services contain business logic and orchestrate repository calls. Throw typed errors here.

```typescript
// src/modules/posts/posts.service.ts
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { postsRepository } from "./posts.repository";
import type { CreatePostDto, UpdatePostDto } from "./posts.types";

class PostsService {
  async getAll() {
    return postsRepository.findAll();
  }

  async getById(id: string) {
    const post = await postsRepository.findById(id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }
    return post;
  }

  async create(data: CreatePostDto, userId: string) {
    return postsRepository.create({
      ...data,
      authorId: userId,
    });
  }

  async update(id: string, data: UpdatePostDto, userId: string) {
    const post = await this.getById(id);
    if (post.authorId !== userId) {
      throw new ForbiddenError("You can only edit your own posts");
    }
    return postsRepository.update(id, data);
  }

  async delete(id: string, userId: string) {
    const post = await this.getById(id);
    if (post.authorId !== userId) {
      throw new ForbiddenError("You can only delete your own posts");
    }
    await postsRepository.delete(id);
  }
}

export const postsService = new PostsService();
```

### 3. Schema Layer (Validation)

Define Zod schemas for request validation:

```typescript
// src/modules/posts/posts.schema.ts
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().default(false),
});

export const updatePostSchema = createPostSchema.partial();

export const postIdParamSchema = z.object({
  id: z.string().uuid("Invalid post ID"),
});
```

### 4. Types Layer (DTOs)

Define TypeScript types inferred from schemas:

```typescript
// src/modules/posts/posts.types.ts
import type { z } from "zod";
import type { createPostSchema, updatePostSchema } from "./posts.schema";

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
```

### 5. Router Layer (HTTP Handlers)

Routers handle HTTP concerns only - validation, auth, calling services, responses:

```typescript
// src/modules/posts/posts.router.ts
import { authenticate } from "@/lib/middleware/authenticate";
import { zValidator } from "@/lib/validator";
import { Hono } from "hono";
import { createPostSchema, updatePostSchema, postIdParamSchema } from "./posts.schema";
import { postsService } from "./posts.service";

export const postsRouter = new Hono();

// Public routes
postsRouter.get("/", async (c) => {
  const posts = await postsService.getAll();
  return c.json({ data: posts });
});

postsRouter.get("/:id", zValidator("param", postIdParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const post = await postsService.getById(id);
  return c.json({ data: post });
});

// Protected routes
postsRouter.post(
  "/",
  authenticate,
  zValidator("json", createPostSchema),
  async (c) => {
    const data = c.req.valid("json");
    const user = c.get("user");
    const post = await postsService.create(data, user.id);
    return c.json({ data: post }, 201);
  },
);

postsRouter.put(
  "/:id",
  authenticate,
  zValidator("param", postIdParamSchema),
  zValidator("json", updatePostSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const user = c.get("user");
    const post = await postsService.update(id, data, user.id);
    return c.json({ data: post });
  },
);

postsRouter.delete(
  "/:id",
  authenticate,
  zValidator("param", postIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const user = c.get("user");
    await postsService.delete(id, user.id);
    return c.json({ message: "Post deleted" });
  },
);
```

### 6. Mount the Router

Register the module router in the main router:

```typescript
// src/router.ts
import { Hono } from "hono";
import { postsRouter } from "@/modules/posts/posts.router";

export const routes = new Hono();

routes.get("/health", (c) => c.text("OK"));
routes.route("/posts", postsRouter);
```

### Layer Responsibilities Summary

| Layer | Responsibility | Can Import |
|-------|----------------|------------|
| **Router** | HTTP handling, validation, responses | Service, Schema, Middleware |
| **Service** | Business logic, orchestration, errors | Repository, Types |
| **Repository** | Database CRUD operations | DB client, Schema |
| **Schema** | Zod validation definitions | Zod only |
| **Types** | DTOs and interfaces | Schema (for inference)

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | **Bun** |
| Framework | **Hono** |
| Database | **PostgreSQL** via **Drizzle ORM** |
| Validation | **Zod** (v4+) |
| Auth | **Better Auth** with session-based strategy |
| Logging | **Pino** (structured JSON) |

## ✅ Key Conventions

### 1. Path Aliases
Always use `@/` for imports:
```typescript
import { env } from "@/lib/config/env";  // ✅
import { env } from "../config/env";     // ❌
```

### 2. Environment Variables
- All env vars are **Zod-validated** at startup in `lib/config/env.ts`
- Use `env.VAR_NAME` everywhere, never `process.env.VAR_NAME` directly
- Add new vars to the schema first, then use them

```typescript
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  // Add new env vars here
});
```

### 3. Error Handling
Throw typed errors from the `lib/errors.ts` hierarchy:

```typescript
import { NotFoundError, BadRequestError } from "@/lib/errors";

throw new NotFoundError("User not found");
throw new BadRequestError("Invalid input", "INVALID_INPUT");
```

| Error Type | Status Code | Default Code |
|------------|-------------|--------------|
| `BadRequestError` | 400 | `BAD_REQUEST` |
| `UnauthorizedError` | 401 | `AUTH_UNAUTHORIZED` |
| `ForbiddenError` | 403 | `FORBIDDEN` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `ConflictError` | 409 | `CONFLICT` |
| `ValidationError` | 422 | `VALIDATION_ERROR` |
| `InternalError` | 500 | `INTERNAL_ERROR` |

### 4. Request Validation
Use the custom `zValidator` wrapper (throws on failure):

```typescript
import { zValidator } from "@/lib/validator";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1) });

routes.post("/users", zValidator("json", schema), async (c) => {
  const data = c.req.valid("json");
});
```

### 5. Authentication
Apply the `authenticate` middleware for protected routes:

```typescript
import { authenticate } from "@/lib/middleware/authenticate";

routes.get("/me", authenticate, async (c) => {
  const user = c.get("user");
  const session = c.get("session");
});
```

### 6. Database Schemas
Define tables in `lib/db/schema/` and export from `index.ts`:

```typescript
// lib/db/schema/users.ts
import { v7 as uuidv7 } from "uuid";

export const user = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => uuidv7()),
  // ...
});

// lib/db/schema/index.ts
export * from "./users";
```

Drizzle patterns:
- `text("id").primaryKey().$defaultFn(() => uuidv7())` for auto-generated UUID v7 IDs
- `timestamp("created_at").defaultNow().notNull()` for timestamps
- `.$onUpdate(() => new Date())` for auto-update timestamps
- Define relations using `relations()` helper

> **Why UUID v7?** UUID v7 is time-ordered, making it ideal for database primary keys as it maintains insertion order for better index performance while remaining globally unique.

### 7. Logging
Use the centralized logger with automatic request ID correlation:

```typescript
import { logger } from "@/lib/logger";

logger.info({ userId: "123" }, "User created");
logger.error({ error }, "Operation failed");
```

## 📋 Code Style (Prettier)

| Rule | Value |
|------|-------|
| Print Width | 100 |
| Tabs | 2 spaces |
| Semicolons | Yes |
| Quotes | Double (`"`) |
| Trailing Comma | All |

## 🚀 Scripts

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start dev server with hot reload |
| `bun run build` | Lint + typecheck + bundle |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | TypeScript type checking |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Run migrations |
| `bun run db:push` | Push schema to DB (dev only) |

## 🔒 Security Defaults

Pre-configured with:
- **CORS** with credentials and configurable origins
- **Secure headers** via `hono/secure-headers`
- **Request timeout** (30s)
- **Body size limit** (5MB)
- **Request ID** tracking

## 📝 Adding a New Feature Checklist

1. **Schema?** → Add to `lib/db/schema/`, run `db:generate` + `db:migrate`
2. **New env var?** → Add to `lib/config/env.ts` schema
3. **New routes?** → Add to `router.ts` or create sub-routers
4. **Protected route?** → Apply `authenticate` middleware
5. **Validation?** → Use `zValidator` with Zod schemas
6. **Errors?** → Throw from `lib/errors.ts` hierarchy

## ⚠️ Common Gotchas

1. **Hono context types** are augmented in `lib/types/hono.d.ts` - add new `Variables` there for type-safe `c.get()`/`c.set()`
2. **Auth routes** are mounted separately at `/api/auth/*` and delegate directly to Better Auth
3. **Zod v4** is used - check documentation for breaking changes from v3
4. **Better Auth** uses session-based auth with cookie caching (5 min TTL)
