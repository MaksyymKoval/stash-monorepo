# Домовленості

Найважливіший файл: тримає фундамент рівним. Якщо правило заважає, змініть його тут, а не обходьте в коді.

## Загальне

- **TypeScript strict** (+ `noUncheckedIndexedAccess`) скрізь; `any` і `as` для приглушення помилок не використовуємо. Тестів і лінтера в MVP немає — `pnpm typecheck` єдина автоматична перевірка.
- **Точні версії** в `package.json`, без `^`/`~`. Політику pnpm `minimumReleaseAge` не обходимо (див. `decisions/0001-stack.md`).
- **Документація змінюється тим самим комітом,** що й код.
- **Без зайвого:** немає репозиторіїв, CQRS, черг, Redis, UI-кіта, DI-обгорток над `db`. Інтерфейс з'являється разом із другою реалізацією.

## Назви

- Фіча має однакову назву на бекенді (`apps/api/src/modules/<feature>/`) і на мобільному (`apps/mobile/src/features/<feature>/`). Профіль і `/v1/me` належать фічі `auth`.
- Файли API: `kebab-case` з суфіксом ролі: `<feature>.module.ts`, `.controller.ts`, `.service.ts`, `.schema.ts`; далі за потреби `.prompt.ts`, `.gateway.ts`, `.cron.ts`, `.listener.ts`. Підпапки в модулі — лише коли файлів більше восьми.
- Компоненти мобільного: `PascalCase.tsx`; хуки запитів фічі — у `features/<feature>/api.ts`.
- Схеми zod у `contracts`: `camelCase` (`meResponse`), тип — `PascalCase` через `z.infer` (`MeResponse`).
- Таблиці й колонки Postgres: `snake_case`, однина (`profile`, `user_id`).

## Склад фічі на API

- `*.module.ts` — збирає контролер і сервіс, експортує сервіс для інших модулів.
- `*.controller.ts` — лише HTTP: декоратори, `@CurrentUser()`, виклик сервісу.
- `*.service.ts` — логіка й запити Drizzle напряму через `db` з `infra/db`.
- `*.schema.ts` — таблиці фічі. `drizzle.config.ts` збирає `src/modules/**/*.schema.ts`; новий файл схеми також додається в `infra/db/schema.ts`.
- Модуль не читає чужі таблиці напряму — лише через експортований сервіс іншого модуля.
- `better-auth.schema.ts` генерує CLI (`pnpm auth:generate`); руками не редагувати.

## Авторизація

- Усі маршрути `/v1` закриті глобальним `AuthGuard`. Відкритий маршрут позначається `@Public()` з `common/public.decorator.ts`.
- Поточна користувачка: `@CurrentUser()` з `modules/auth/current-user.decorator.ts`.
- **У `main.ts` нічого, що читає тіло запиту, не реєструється перед `app.use('/api/auth', …)`.** Логування чи rate-limit для `/api/auth` додаються через `app.use` вище цього рядка.
- Код API не прив'язується до NodeAdapter: у фільтрах і guard-ах — `HttpAdapterHost`, `IncomingMessage`, а не `NodeRequest`/`NodeResponse`.

## Формат помилок

Будь-яка не-2xx відповідь `/v1` — `{ "code": "SCREAMING_SNAKE", "message": "..." }` (`contracts`: `apiError`). Свій код: `throw new NotFoundException({ code: 'PROFILE_NOT_FOUND', message: '...' })`; без коду береться назва HTTP-статусу (`UNAUTHORIZED`, `NOT_FOUND`). Better Auth на `/api/auth/*` має власний формат `{ message, code }` — мобільний показує текст за `code` зі `strings.ts`.

## Валідація

- Вхід і вихід `/v1` описуються zod-схемами в `packages/contracts`; DTO-класів немає, типи — `z.infer`.
- Pipe валідації в `common/` з'явиться з першим ендпоінтом, що приймає тіло (етап 1).
- Мобільний перевіряє кожну відповідь схемою в `src/lib/api.ts`.

## Мобільний

- Файли маршрутів у `app/` тонкі: лише збирають екран із `src/features/`.
- Серверний стан — TanStack Query; стан входу — `authClient.useSession()`. Глобального стору немає.
- Вигляд — `StyleSheet` і токени з `src/ui/theme.ts`; кольори й розміри поза `theme.ts` не пишемо.
- Усі тексти українською в `src/ui/strings.ts`.
- Нові пакети — через `npx expo install`, потім зафіксувати точну версію й прибрати з `pnpm-workspace.yaml` винятки `minimumReleaseAgeExclude`, якщо `expo install` їх додав.

## Заборонено

- Обходити `minimumReleaseAge`, ставити версії з `^`/`~`.
- Читати тіло запиту до обробника Better Auth.
- Імпортувати `modules/*` з `infra/` чи `common/` (крім реекспорту таблиць у `infra/db/schema.ts`).
- Лізти в чужі таблиці з іншого модуля.
- Писати кольори, шрифти чи рядки інтерфейсу поза `theme.ts` і `strings.ts`.
