# 0001. Стек і версії

Дата: 11.11.2026. Статус: прийнято.

**Контекст.** Тестів і лінтера в MVP немає, тож стек має бути передбачуваним: точні версії, мінімум залежностей, TypeScript strict як єдина автоматична перевірка. Інтеграцію Better Auth з NestJS на NodeAdapter перевірено спайком (0002).

**Рішення.** Усі версії фіксуються точно (без `^`/`~`) у `package.json`; оновлення — свідома дія з повтором перевірок a–g.

| Частина | Версія |
| --- | --- |
| Node.js | 26.13.1 LTS (`.nvmrc`, `engines`) |
| pnpm | 12.16.1 (`packageManager`), workspaces без Turborepo/Nx |
| TypeScript | 7.0.2, `strict` + `noUncheckedIndexedAccess` (`tsconfig.base.json`) |
| NestJS (`core`, `common`, `platform-node`) | 12.4.2, ESM, NodeAdapter |
| Better Auth (`better-auth`, `@better-auth/expo`, `@better-auth/drizzle-adapter`, CLI `auth`) | 1.7.20 |
| Drizzle ORM / drizzle-kit | 0.45.4 / 0.31.11, драйвер `pg` 8.23.1 |
| zod | 4.6.7 |
| Postgres | 18.6 (`postgres:18.6-alpine`) |
| SeaweedFS (локальне S3) | 4.53 |
| Expo SDK | 58 (`expo` 58.0.23), React Native 0.88.1, React 19.3.0, Expo Router 58.0.30 |
| TanStack Query | 5.107.1 |

**Наслідки.**
- pnpm `minimumReleaseAge` (1 доба) не обходимо: `expo install` дописує винятки в `pnpm-workspace.yaml` для свіжих релізів — їх видаляємо й беремо найновіші версії, старші за добу. Тому Better Auth 1.7.20 (а не 1.7.21), а Expo-пакети на патч позаду; `expo-doctor` про це попереджає, оновлюємо через `npx expo install --check` наступного дня.
- Expo SDK 58 очікує TypeScript ~6.0; ми свідомо на 7.0.2 (Babel компілює код, `tsc` лише перевіряє типи), тому `typescript` у `expo.install.exclude`.
- Спайк проходив на Node 24.15; на Node 26.13.1 перевірки a–g повторено в етапі 0 — результат той самий.
