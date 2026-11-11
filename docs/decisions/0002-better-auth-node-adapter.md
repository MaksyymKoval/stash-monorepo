# Better Auth на NestJS 12 + `@nestjs/platform-node` (NodeAdapter): звіт експерименту

Дата: 2026-11-11. Проєкт: `nest-node-better-auth/` (окрема підпапка, бо робоча папка містила інші проєкти).

## 1. Вердикт

- **Варіант А (власна тонка інтеграція): працює.** Потрібен один явний крок: вимкнути стандартні парсери (`bodyParser: false`) і знову ввімкнути їх через `app.useBodyParser()` після монтування обробника Better Auth. Без патчів, без Express. Перевірки a–g пройшли.
- **Варіант Б (`@thallesp/nestjs-better-auth`): не робив.** За умовою Б потрібен, лише якщо А не вдався, а А вдався.

## 2. Версії

| Що | Версія |
|---|---|
| Node.js | 24.15.0 (LTS) |
| pnpm | 12.16.1 |
| TypeScript | 7.0.2 |
| @nestjs/core, @nestjs/common, @nestjs/platform-node | 12.4.2 |
| better-auth, @better-auth/expo, @better-auth/drizzle-adapter, auth (CLI) | 1.7.20 |
| better-call (транзитивна, від better-auth) | 1.4.5 |
| drizzle-orm | 0.45.4 |
| drizzle-kit | 0.31.11 |
| pg / @types/pg | 8.23.1 / 8.23.1 |
| reflect-metadata | 0.2.2 |
| rxjs | 7.8.2 |
| @types/node | 24.19.2 |
| PostgreSQL (docker `postgres:18.1-alpine`) | 18.1 |

Усі версії зафіксовані точно (`-E`) у `package.json`.

**Чому 1.7.20, а не 1.7.21.** 1.7.21 вийшла 2026-11-11 о 17:58 UTC. Політика pnpm `minimumReleaseAge` (1 доба) відхилила лок-файл з нею (`ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`). Політику я не обходив, а взяв найновішу версію, старшу за добу.

## 3. Перевірки a–g

Сервер: `pnpm build && pnpm start` на `:3000`, Postgres на `:54329`. Повні команди й вивід наведені нижче таблиці.

| # | Команда (скорочено) | Очікування | Фактичний результат |
|---|---|---|---|
| a | `POST /api/auth/sign-up/email` + `psql select … from "user"` | 200, рядок у БД | ✅ 200, `set-cookie`, у `user` 1 рядок `alice@example.com` |
| b | `POST /api/auth/sign-in/email` (`-c jar`) | 200 + `Set-Cookie` | ✅ 200, `set-cookie: better-auth.session_token=…; HttpOnly; SameSite=Lax`, тіло з `token` і `user` |
| c | `GET /api/auth/get-session` (`-b jar`) | користувач | ✅ 200, `{"session":{…},"user":{…"email":"alice@example.com"…}}` |
| d | `GET /v1/me` без cookie / з cookie | 401 / 200 + user | ✅ 401 `{"message":"Unauthorized","statusCode":401}` / 200 з даними Alice |
| e | `POST /v1/echo` з JSON (і з urlencoded) | те саме тіло | ✅ `{"hello":"world","n":[1,2,3],"nested":{"ok":true}}` → те саме; `a=1&b[c]=2` → `{"a":"1","b":{"c":"2"}}` |
| f | sign-in і `/v1/me` без `Origin`, з `expo-origin: myapp://`, `Cookie` передано вручну | 200 | ✅ sign-in 200 + cookie; `/v1/me` 200; `get-session` 200. Контроль без `expo-origin` дає 403 `MISSING_OR_NULL_ORIGIN`. Контроль з `expo-origin: evil://` дає 403 `INVALID_ORIGIN` |
| g | `POST /api/auth/sign-out`, потім `/v1/me` | 200, потім 401 | ✅ для обох сесій (браузерної та Expo): `{"success":true}`, cookie з `Max-Age=0`, потім 401 |

### Сирий вивід

```text
### a
$ curl -s -i -X POST localhost:3000/api/auth/sign-up/email -H 'Content-Type: application/json' -H 'Origin: http://localhost:3000' -d '{"email":"alice@example.com","password":"password1234","name":"Alice"}'
HTTP/1.1 200 OK
content-type: application/json
set-cookie: better-auth.session_token=qVUhJdvxWpYLy4AfSU7JHmUQmZvEB6Uf.UBhbHaboCLVXW2vZvox1dwyYT1frklo1%2BIkrd5dbZhQ%3D; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax

{"token":"qVUhJdvxWpYLy4AfSU7JHmUQmZvEB6Uf","user":{"name":"Alice","email":"alice@example.com","emailVerified":false,"image":null,"createdAt":"2026-11-11T20:28:07.592Z","updatedAt":"2026-11-11T20:28:07.592Z","id":"Kjh7wUxOQQQsS43o2NfXgPbIR2TkFKj4"}}

$ docker compose exec -T postgres psql -U app -d app -c 'select id,email,name,created_at from "user";'
                id                |       email       | name  |       created_at
----------------------------------+-------------------+-------+-------------------------
 Kjh7wUxOQQQsS43o2NfXgPbIR2TkFKj4 | alice@example.com | Alice | 2026-11-11 20:28:07.592
(1 row)

### b
$ curl -s -i -c jar.txt -X POST localhost:3000/api/auth/sign-in/email -H 'Content-Type: application/json' -H 'Origin: http://localhost:3000' -d '{"email":"alice@example.com","password":"password1234"}'
HTTP/1.1 200 OK
content-type: application/json
set-cookie: better-auth.session_token=PBIUuDM3altrKFAomlepa6V59SicGwFU.v08eFqVIw9D6skLuo9R0vBh6s1r0%2BEhv%2Fy%2FCbmt%2BJD4%3D; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax

{"redirect":false,"token":"PBIUuDM3altrKFAomlepa6V59SicGwFU","user":{"name":"Alice","email":"alice@example.com",…,"id":"Kjh7wUxOQQQsS43o2NfXgPbIR2TkFKj4"}}

### c
$ curl -s -i -b jar.txt localhost:3000/api/auth/get-session
HTTP/1.1 200 OK
cache-control: no-store
content-type: application/json

{"session":{"expiresAt":"2026-11-18T20:28:07.934Z","token":"PBIUuDM3altrKFAomlepa6V59SicGwFU",…,"userAgent":"curl/8.7.1","userId":"Kjh7wUxOQQQsS43o2NfXgPbIR2TkFKj4","id":"84FOiCcOxdNfoRCBLT27aJD0lAbNb3BF"},"user":{"name":"Alice","email":"alice@example.com",…}}

### d
$ curl -s -i localhost:3000/v1/me
HTTP/1.1 401 Unauthorized
{"message":"Unauthorized","statusCode":401}

$ curl -s -i -b jar.txt localhost:3000/v1/me
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
{"name":"Alice","email":"alice@example.com","emailVerified":false,"image":null,"createdAt":"2026-11-11T20:28:07.592Z","updatedAt":"2026-11-11T20:28:07.592Z","id":"Kjh7wUxOQQQsS43o2NfXgPbIR2TkFKj4"}

### e
$ curl -s -i -b jar.txt -X POST localhost:3000/v1/echo -H 'Content-Type: application/json' -d '{"hello":"world","n":[1,2,3],"nested":{"ok":true}}'
HTTP/1.1 200 OK
{"hello":"world","n":[1,2,3],"nested":{"ok":true}}

$ curl -s -i -b jar.txt -X POST localhost:3000/v1/echo -H 'Content-Type: application/x-www-form-urlencoded' -d 'a=1&b[c]=2'
HTTP/1.1 200 OK
{"a":"1","b":{"c":"2"}}

$ curl -s -i -X POST localhost:3000/v1/echo -H 'Content-Type: application/json' -d '{"x":1}'      # без cookie
HTTP/1.1 401 Unauthorized
{"message":"Unauthorized","statusCode":401}

### f0 (контроль): без Origin і без expo-origin, але з cookie
$ curl -s -i -X POST localhost:3000/api/auth/sign-in/email -H 'Content-Type: application/json' -H 'Cookie: better-auth.session_token=stale' -d '{"email":"alice@example.com","password":"password1234"}'
HTTP/1.1 403 Forbidden
{"message":"Missing or null Origin","code":"MISSING_OR_NULL_ORIGIN"}

### f1: вхід як Expo-клієнт
$ curl -s -i -X POST localhost:3000/api/auth/sign-in/email -H 'Content-Type: application/json' -H 'expo-origin: myapp://' -H 'x-skip-oauth-proxy: true' -d '{"email":"alice@example.com","password":"password1234"}'
HTTP/1.1 200 OK
set-cookie: better-auth.session_token=dV3swa6JNPwWEuKHObwW07M0iDqF6PMM.Uu3P8rQ6PUV1PCR8g2F3CJLt3yZzFY6hNF3aTpbWrOY%3D; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax
{"redirect":false,"token":"dV3swa6JNPwWEuKHObwW07M0iDqF6PMM","user":{…"email":"alice@example.com"…}}

### f2 (контроль): expo-origin не з trustedOrigins
$ curl -s -i -X POST localhost:3000/api/auth/sign-in/email -H 'Content-Type: application/json' -H 'expo-origin: evil://' -H 'Cookie: better-auth.session_token=dV3s…' -d '{…}'
HTTP/1.1 403 Forbidden
{"message":"Invalid origin","code":"INVALID_ORIGIN"}

### f3: /v1/me з Cookie вручну, без Origin
$ curl -s -i localhost:3000/v1/me -H 'expo-origin: myapp://' -H 'x-skip-oauth-proxy: true' -H 'Cookie: better-auth.session_token=dV3swa6JNPwWEuKHObwW07M0iDqF6PMM.Uu3P8rQ6PUV1PCR8g2F3CJLt3yZzFY6hNF3aTpbWrOY%3D'
HTTP/1.1 200 OK
{"name":"Alice","email":"alice@example.com",…,"id":"Kjh7wUxOQQQsS43o2NfXgPbIR2TkFKj4"}

### f4: get-session з Cookie вручну
$ curl -s localhost:3000/api/auth/get-session -H 'expo-origin: myapp://' -H 'Cookie: better-auth.session_token=dV3s…'
{"session":{…"token":"dV3swa6JNPwWEuKHObwW07M0iDqF6PMM"…},"user":{…"email":"alice@example.com"…}}

### g1: браузерна сесія
$ curl -s -i -b jar.txt -c jar.txt -X POST localhost:3000/api/auth/sign-out -H 'Origin: http://localhost:3000'
HTTP/1.1 200 OK
set-cookie: better-auth.session_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax
set-cookie: better-auth.session_data=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax
set-cookie: better-auth.dont_remember=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax
{"success":true}
$ curl -s -i -b jar.txt localhost:3000/v1/me
HTTP/1.1 401 Unauthorized
{"message":"Unauthorized","statusCode":401}

### g2: Expo-сесія
$ curl -s -i -X POST localhost:3000/api/auth/sign-out -H 'expo-origin: myapp://' -H 'Cookie: better-auth.session_token=dV3s…'
HTTP/1.1 200 OK
{"success":true}
$ curl -s -i localhost:3000/v1/me -H 'expo-origin: myapp://' -H 'Cookie: better-auth.session_token=dV3s…'
HTTP/1.1 401 Unauthorized
{"message":"Unauthorized","statusCode":401}

$ docker compose exec -T postgres psql -U app -d app -c 'select id, token, user_id from session;'
 2HjZYJdLkVXjIcroAdCG6NctXrrGU31E | qVUhJdvxWpYLy4AfSU7JHmUQmZvEB6Uf | Kjh7wUxOQQQsS43o2NfXgPbIR2TkFKj4
(1 row)     ← лишилася тільки сесія з sign-up (a), з якої не виходили; обидві сесії b і f видалено
```

(У виводі прибрано заголовки `Date`, `Connection` і `Keep-Alive`, а довгі токени скорочено до `…`. Все інше наведено дослівно.)

## 4. Обхідні кроки та як улаштований парсинг тіла

Жодних issue не знадобилось, бо нічого не зламалося. Нижче описано, що я з'ясував у коді пакетів, а не в пам'яті.

**Як NodeAdapter парсить тіло** (`@nestjs/platform-node@12.4.2`):
- `NestApplication.init()` викликає `httpAdapter.registerParserMiddleware()` (якщо `bodyParser !== false`). Той додає власні парсери `json` і `urlencoded` (без пакета `body-parser`) як глобальні middleware у `NodeRouter`.
- Парсер пропускає запит, якщо `req.body !== undefined` або `req.readableEnded`. Отже, хто перший прочитав потік, той і володіє тілом.
- Парсери не експортуються з пакета. Публічний API для них один: `app.useBodyParser(type, options)`, він додає парсер у стек у порядку виклику.
- `app.use('/api/auth', handler)` працює як mount: обробник викликається для префікса й усіх підшляхів. Роутер виставляє `req.baseUrl` і `req.originalUrl` так само, як Express. `toNodeHandler` з better-call 1.4.5 будує з них повний URL (`constructRelativeUrl`), тому маршрути Better Auth зіставляються правильно.

**Обхідний крок, який використано:**
```ts
NestFactory.create(AppModule, new NodeAdapter(), { bodyParser: false });
app.use('/api/auth', toNodeHandler(auth));   // спершу Better Auth, він завершує відповідь
app.useBodyParser('json');                   // потім парсери для всього іншого
app.useBodyParser('urlencoded', { extended: true });
```

**Доказ, що Better Auth отримує сирий потік.** Я запускав тимчасовий скрипт-пробу (вже видалений), який логував стан `req` на вході в обробник:

```text
ours        (bodyParser:false → auth → useBodyParser)  : req.body= undefined  readableEnded= false   sign-in → 200
default     (bodyParser за замовч., app.use до listen) : req.body= undefined  readableEnded= false   sign-in → 200
parsedfirst (useBodyParser('json') → auth)             : req.body= {"email":…,"password":…}  readableEnded= true   sign-in → 200
```

Висновки:
1. **Навіть без обхідного кроку все працює**, бо `app.use()` у `main.ts` виконується до `init()`, а стандартні парсери реєструються саме в `init()`, тобто пізніше. Але це неявна залежність від порядку викликів, тому я обрав явний варіант: `bodyParser: false` + `useBodyParser`.
2. **Навіть коли парсер спрацьовує першим, JSON-вхід працює.** better-call 1.4.5 бачить `req.body`, серіалізує його назад у JSON і передає далі. Проте тоді Better Auth отримує не оригінальні байти, а повторно серіалізоване тіло (див. ризики).

## 5. Мінімальний код інтеграції

`src/auth.ts`
```ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { expo } from '@better-auth/expo';
import { db } from './db/index.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  plugins: [expo()],
  trustedOrigins: ['myapp://'],
});
```

`src/main.ts`
```ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NodeAdapter, type NestNodeApplication } from '@nestjs/platform-node';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module.js';
import { auth } from './auth.js';

const app = await NestFactory.create<NestNodeApplication>(AppModule, new NodeAdapter(), {
  // Default parsers are registered in app.init() and would consume the stream
  // before Better Auth sees it. Turn them off and register them below, after the
  // auth handler, so they apply to every route except /api/auth/*.
  bodyParser: false,
});

// Mount (prefix match): runs for /api/auth and every sub-path, ends the response.
app.use('/api/auth', toNodeHandler(auth));
app.useBodyParser('json');
app.useBodyParser('urlencoded', { extended: true });

app.setGlobalPrefix('v1');
await app.listen(process.env.PORT ?? 3000);
```

`src/auth/decorators.ts`
```ts
import { createParamDecorator, SetMetadata, type ExecutionContext } from '@nestjs/common';
import type { NodeRequest } from '@nestjs/platform-node';
import type { auth } from '../auth.js';

export type AuthSession = typeof auth.$Infer.Session;
export type AuthRequest = NodeRequest & { user?: AuthSession['user']; session?: AuthSession['session'] };

export const IS_PUBLIC = Symbol('isPublic');
export const Public = () => SetMetadata(IS_PUBLIC, true);

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<AuthRequest>().user,
);
```

`src/auth/auth.guard.ts` (зареєстрований глобально: `providers: [{ provide: APP_GUARD, useClass: AuthGuard }]`)
```ts
import { Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.js';
import { IS_PUBLIC, type AuthRequest } from './decorators.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    const result = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!result) throw new UnauthorizedException();

    req.user = result.user;
    req.session = result.session;
    return true;
  }
}
```

Схема й міграції:
```sh
pnpm exec auth generate --config src/auth.ts --output src/db/auth-schema.ts --yes   # потрібен DATABASE_URL в env
pnpm exec drizzle-kit generate
pnpm exec drizzle-kit migrate
```

## 6. Ризики й обмеження

1. **Порядок middleware — єдина точка крихкості.** Якщо хтось додасть `app.useBodyParser(...)` або глобальний middleware, що читає тіло, *до* `app.use('/api/auth', …)`, автентифікація далі працюватиме (better-call повторно серіалізує `req.body`). Але тоді Better Auth отримає вже не оригінальні байти. Для email/пароля це не важливо. Для плагінів, які перевіряють підпис сирого тіла (вебхуки на кшталт Stripe), це вже поломка. Варто залишити коментар у `main.ts`.
2. **Nest-middleware (`consumer.apply().forRoutes()`) і глобальні interceptor/guard/filter на `/api/auth/*` не працюють.** Обробник змонтовано на рівні роутера, тож запит до контролерів Nest не доходить. Для логування, rate-limit чи CORS на `/api/auth` треба реєструвати `app.use(...)` *до* монтування або вмикати `app.enableCors()` (він теж додає `app.use`). Префікс `/v1` не зачіпає `/api/auth`: це очікувано, бо обробник не є маршрутом Nest.
3. **Guard читає сесію з БД на кожен захищений запит** (`getSession` → запит у Postgres). Для навантаження варто ввімкнути `session.cookieCache` у Better Auth.
4. **`ipAddress` у сесіях порожній (`""`).** Better Auth бере IP із заголовків (`x-forwarded-for` тощо), а curl їх не шле. За проксі потрібно налаштувати `advanced.ipAddress` у Better Auth. `trustProxy` у NodeAdapter на це не впливає.
5. **Expo:** без заголовка `expo-origin` запит із cookie, але без `Origin`, отримує 403 `MISSING_OR_NULL_ORIGIN`. Клієнт `@better-auth/expo/client` шле `expo-origin` сам, а власні `fetch` до `/api/auth/*` з мобільного мають додавати його вручну. Маршрути `/v1/*` origin не перевіряють, бо guard лише читає сесію. Плагін `expo()` у dev-режимі (`NODE_ENV=development`) автоматично довіряє `exp://`.
6. **Документація:** сторінка Installation імпортує `drizzleAdapter` з `better-auth/adapters/drizzle`, а сторінка Drizzle adapter — з `@better-auth/drizzle-adapter`. Я використав другий варіант (окремий пакет), і він працює. Офіційна сторінка NestJS описує лише `@thallesp/nestjs-better-auth` з `bodyParser: false`, а про NodeAdapter там нічого немає.
7. **Свіжість стеку.** NodeAdapter рекомендований лише з NestJS 12.3 (12.3.3 вийшла 2026-11-04), а дефолтним стане в 13. Внутрішня поведінка (порядок реєстрації парсерів у `init()`, mount-семантика `req.baseUrl`) перевірена лише на 12.4.2. При оновленнях варто перезапускати перевірки a–g.
8. **TypeScript 7.0.2** (нативний компілятор) з `experimentalDecorators` і `emitDecoratorMetadata` зібрав проєкт без помилок, і DI (`Reflector` у guard) працює. Ширше цю комбінацію я не перевіряв.
9. Варіант Б не перевірявся, тому сумісність `@thallesp/nestjs-better-auth@2.8.0` з NodeAdapter невідома.

## Як відтворити

```sh
docker compose up -d
# .env (не комітиться): DATABASE_URL=postgres://app:app@localhost:54329/app,
#   BETTER_AUTH_SECRET=$(openssl rand -base64 32), BETTER_AUTH_URL=http://localhost:3000, PORT=3000
pnpm install
set -a; . ./.env; set +a; pnpm db:migrate
pnpm build && pnpm start