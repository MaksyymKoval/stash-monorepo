# MakeupStash

Косметичка, покрокові інструкції й спільнота, де видно, чим зроблено кожен образ. Монорепозиторій: `apps/api` (NestJS), `apps/mobile` (Expo), `packages/contracts` (zod).

## Запуск за 5 хвилин

Потрібні: Node 26.13.1 (`nvm`), pnpm 12.16.1, Docker. Для телефона — Xcode 27 і iPhone (деталі в [docs/setup.md](docs/setup.md)).

```sh
nvm use
pnpm install                                   # також збирає packages/contracts
docker compose up -d                           # Postgres :54320, SeaweedFS :8333

cp apps/api/.env.example apps/api/.env         # впишіть BETTER_AUTH_SECRET і LAN IP у BETTER_AUTH_URL
cp apps/mobile/.env.example apps/mobile/.env   # EXPO_PUBLIC_API_URL = той самий URL
pnpm -C apps/api db:migrate
pnpm -C apps/api dev                           # API на :3000

curl localhost:3000/v1/health                  # {"status":"ok"}
```

Застосунок на iPhone (development build, не Expo Go):

```sh
cd apps/mobile
npx expo prebuild -p ios      # перший раз
npx expo run:ios --device     # зібрати й поставити; проблеми з підписом — docs/setup.md
pnpm start                    # Metro
```

## Документація

[docs/README.md](docs/README.md) — зміст. Перед зміною коду — [docs/conventions.md](docs/conventions.md).
