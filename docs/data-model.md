# Модель даних

Postgres 18, схеми Drizzle поруч із фічею, міграції в `apps/api/drizzle/`. Повний перелік майбутніх таблиць — у `plan.md` («Модель даних»); тут лише те, що існує.

## Таблиці етапу 0

**`user`, `session`, `account`, `verification`** — генерує Better Auth CLI (`modules/auth/better-auth.schema.ts`, міграція `0000_auth`). Ідентифікатори — `text`, генерує Better Auth. Пароль зберігається в `account.password` (хеш). `session.user_id` і `account.user_id` → `user.id`, `on delete cascade`.

**`profile`** (`modules/auth/auth.schema.ts`, міграція `0001_profile`) — профіль застосунку, рівно один на `user`.

| Колонка | Тип | Примітка |
| --- | --- | --- |
| `id` | `uuid` PK | `default uuidv7()` (Postgres 18) — впорядкований за часом, зручно для курсорної пагінації |
| `user_id` | `text` NOT NULL UNIQUE | → `user.id`, `on delete cascade` |
| `username` | `text` NOT NULL UNIQUE | `^[a-z0-9_.]{3,30}$`, обов'язковий при реєстрації |
| `bio` | `text` | |
| `avatar_key` | `text` | ключ об'єкта в S3, з'явиться з етапу 1 |
| `stash_public` | `boolean` NOT NULL | `default true` — косметичка публічна за замовчуванням |
| `created_at` | `timestamptz` NOT NULL | `default now()` |

## Як створюється профіль

Тіло `POST /api/auth/sign-up/email` містить `username` поруч із полями Better Auth. Хук `databaseHooks.user.create.before` перевіряє формат і унікальність і відхиляє реєстрацію до створення `user` (`INVALID_USERNAME`, `USERNAME_TAKEN`). Хук `after` вставляє рядок `profile`. Хуки `after` у Better Auth виконуються вже після запису `user`, тож при одночасній реєстрації з тим самим username (гонка) `user` може лишитися без профілю — `/v1/me` тоді повертає 404 `PROFILE_NOT_FOUND`. Для MVP це прийнятно.

## Правила

- Кожна наша таблиця має `id` (`uuid`, `uuidv7()`) і `created_at` (`timestamptz`).
- Enum-и — Postgres enum-и (`category`, `color_family` з етапу 1).
- Міграції: змінити `*.schema.ts` → `pnpm -C apps/api db:generate --name <що>` → переглянути SQL → `pnpm -C apps/api db:migrate`. Згенеровані міграції комітяться.
