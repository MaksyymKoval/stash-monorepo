# Архітектура

Стан на кінець етапу 0. Що буде далі — у `plan.md`.

## Схема

```
iPhone (Expo, development build)
  ├─ /api/auth/*  ──►  Better Auth (toNodeHandler, поза конвеєром Nest)
  └─ /v1/*        ──►  NestJS 12 на NodeAdapter ──► Postgres 18 (Drizzle)
                                                  └► SeaweedFS (S3, з етапу 1)
```

Застосунок звертається лише до API. Виняток (з етапу 1): фото вантажиться прямо в сховище за presigned URL.

## Репозиторій

| Шлях | Що там |
| --- | --- |
| `apps/api` | NestJS API, ESM, збирається `tsc` у `dist/` |
| `apps/mobile` | Expo-застосунок, маршрути в `app/`, код у `src/` |
| `packages/contracts` | zod-схеми запитів і відповідей, спільні для API й мобільного; збирається в `dist/` на `pnpm install` |

## API: три зони

```
apps/api/src/
├─ main.ts              порядок: bodyParser:false → /api/auth → useBodyParser → /v1
├─ app.module.ts
├─ config/env.ts        змінні оточення, перевірені zod; читає apps/api/.env, якщо він є
├─ common/              фільтр помилок {code,message}, @Public(), /v1/health
├─ infra/db/            клієнт Drizzle (db.ts), збірний schema.ts
└─ modules/auth/        Better Auth, guard, @CurrentUser, профіль, /v1/me
```

- `modules` імпортують `infra` і `common`; `infra` і `common` не імпортують `modules`. Єдиний виняток — `infra/db/schema.ts`, який лише реекспортує таблиці фіч для клієнта Drizzle.
- `infra/storage` і `infra/ai` з'являться на етапі 1.

## Шлях запиту

**`/api/auth/*`** (sign-up, sign-in, get-session, sign-out): роутер NodeAdapter → `toNodeHandler(auth)` читає сирий потік тіла й завершує відповідь. Guard, фільтр, префікс `/v1` сюди не діють. Мобільний клієнт `@better-auth/expo` сам додає заголовок `expo-origin: stash://`, який Better Auth звіряє з `trustedOrigins`.

**`/v1/*`**: парсер JSON/urlencoded → глобальний `AuthGuard` (пропускає `@Public()`, інакше `auth.api.getSession()` з Postgres і кладе `user`/`session` у запит) → контролер → сервіс (Drizzle напряму) → відповідь. Будь-яка помилка проходить через `HttpExceptionFilter` і стає `{ code, message }`.

## Мобільний

```
apps/mobile/
├─ app/_layout.tsx       QueryClientProvider; Stack.Protected за useSession()
├─ app/(auth)/           sign-in, sign-up
├─ app/(tabs)/           index (Стрічка), stash (Косметичка), profile
└─ src/
   ├─ features/auth/     форми входу й реєстрації, useMe/useSignOut, ProfileCard
   ├─ lib/               env, auth-client, api (обгортка fetch), query-client
   └─ ui/                theme.ts, strings.ts, Screen, Text, Button, Input, Card
```

Сесія: `authClient` (`expoClient` + `expo-secure-store`) зберігає cookie в Keychain, тому сесія переживає перезапуск. Запити до `/v1` ідуть лише через `src/lib/api.ts`, який додає `Cookie` з `authClient.getCookie()` і перевіряє відповідь схемою з `contracts`.
