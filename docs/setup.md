# Локальне середовище

## Вимоги

- macOS, Node 26.13.1 (`nvm use` читає `.nvmrc`), pnpm 12.16.1 (`corepack enable` або глобально).
- Docker Desktop (Postgres і SeaweedFS).
- Для iPhone: Xcode 27, Apple-акаунт команди **3R47XS2WDC** в Xcode → Settings → Accounts, iPhone у режимі розробника, підключений кабелем або в тій самій Wi‑Fi.

## Сервіси

`docker compose up -d` у корені:

| Сервіс | Порт | Доступ |
| --- | --- | --- |
| Postgres 18.6 | `localhost:54320` | `app` / `app`, база `makeupstash` |
| SeaweedFS 4.53, S3 API | `localhost:8333` | ключ `makeupstash` / `makeupstash-secret` (використовується з етапу 1) |

Дані живуть у томах `makeupstash_postgres` і `makeupstash_seaweedfs`; `docker compose down -v` їх видаляє.

## Змінні оточення

**`apps/api/.env`** (шаблон `.env.example`; `config/env.ts` читає файл сам і перевіряє zod — з невалідними змінними API не стартує):

| Змінна | Приклад | Навіщо |
| --- | --- | --- |
| `NODE_ENV` | `development` | у development `expo()` довіряє ще й `exp://` |
| `PORT` | `3000` | |
| `DATABASE_URL` | `postgres://app:app@localhost:54320/makeupstash` | Drizzle і Better Auth |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` | підпис cookie сесії, ≥ 32 символи |
| `BETTER_AUTH_URL` | `http://192.168.1.183:3000` | адреса, за якою телефон бачить API (LAN IP Mac) |

**`apps/mobile/.env`** (шаблон `.env.example`):

| Змінна | Приклад |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | `http://192.168.1.183:3000` — той самий, що `BETTER_AUTH_URL` |

LAN IP Mac: `ipconfig getifaddr en0` (або `en1`). Якщо IP змінився — оновіть обидва файли й перезапустіть API та Metro.

## Команди

| Команда | Що робить |
| --- | --- |
| `pnpm install` | залежності всіх пакетів; збирає `packages/contracts` (`prepare`) |
| `pnpm typecheck` | `tsc --noEmit` у всіх пакетах |
| `pnpm -C apps/api dev` | збірка + `tsc --watch` + `node --watch` |
| `pnpm -C apps/api build && pnpm -C apps/api start` | продакшн-запуск з `dist/` |
| `pnpm -C apps/api db:migrate` | застосувати міграції |
| `pnpm -C apps/api db:generate --name <що>` | нова міграція зі змін у `*.schema.ts` |
| `pnpm -C apps/api auth:generate` | перегенерувати `better-auth.schema.ts` після зміни конфігу Better Auth |
| `pnpm -C apps/api db:studio` | Drizzle Studio |
| `pnpm -C packages/contracts dev` | перезбирати contracts при змінах |
| `pnpm -C apps/mobile start` | Metro для development build |
| `pnpm -C apps/mobile ios -- --device` | зібрати й поставити development build на iPhone |

## Development build на iPhone

1. Перший раз: `cd apps/mobile && npx expo prebuild -p ios` (папка `ios/` не комітиться, генерується з `app.json`).
2. Зібрати й поставити: `npx expo run:ios --device` і вибрати телефон. Якщо Xcode пише «No profiles for 'com.unlockyourstash.app'», зберіть із дозволом створити профіль:
   ```sh
   cd apps/mobile/ios && xcodebuild -workspace MakeupStash.xcworkspace -scheme MakeupStash \
     -configuration Debug -destination id=<UDID> -derivedDataPath build \
     -allowProvisioningUpdates DEVELOPMENT_TEAM=3R47XS2WDC build
   xcrun devicectl device install app --device <UDID> build/Build/Products/Debug-iphoneos/MakeupStash.app
   ```
   UDID: `xcrun devicectl list devices`.
3. `pnpm -C apps/mobile start` — Metro; застосунок на телефоні під'єднується до нього (iOS спитає дозвіл на локальну мережу).
4. Нативну частину треба перезбирати лише після зміни нативних пакетів чи `app.json`; зміни JS підхоплює Metro.

## Перевірки a–g

Після оновлення NestJS чи Better Auth повторіть перевірки a–g з `decisions/0002-better-auth-node-adapter.md` (sign-up, sign-in, get-session, `/v1/me`, тіло запиту, `expo-origin`, sign-out).

## MCP для AI-асистентів

`.mcp.json` у корені під'єднує Figma MCP (`https://mcp.figma.com/mcp`, віддалений сервер Figma). Claude Code при першому запуску в репо спитає, чи довіряти серверу; далі `/mcp` → `figma` → вхід у Figma через браузер. Токени зберігаються локально, у репо нічого секретного немає.
