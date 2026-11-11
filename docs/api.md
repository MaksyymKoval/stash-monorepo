# API

База: `http://<хост>:3000`. Ендпоінти фіч мають префікс `/v1`; Better Auth живе на `/api/auth/*` поза Nest. Помилки `/v1`: `{ code, message }`. Схеми відповідей — у `packages/contracts`.

## common

| Метод і шлях | Доступ | Відповідь |
| --- | --- | --- |
| `GET /v1/health` | `@Public()` | `{ "status": "ok" }` |

## auth

### Better Auth (`/api/auth/*`)

Обробляє `better-auth` 1.7.20; повний перелік — документація Better Auth. Потрібен заголовок `Origin` з `trustedOrigins` або `expo-origin: makeupstash://` (мобільний клієнт додає сам), інакше 403 `MISSING_OR_NULL_ORIGIN` / `INVALID_ORIGIN`.

| Метод і шлях | Тіло | Відповідь |
| --- | --- | --- |
| `POST /api/auth/sign-up/email` | `{ email, password, name, username }` | 200 `{ token, user }` + `Set-Cookie`; 400 `INVALID_USERNAME`, `USERNAME_TAKEN`; 422 `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` |
| `POST /api/auth/sign-in/email` | `{ email, password }` | 200 `{ redirect, token, user }` + `Set-Cookie`; 401 `INVALID_EMAIL_OR_PASSWORD` |
| `GET /api/auth/get-session` | — | `{ session, user }` або `null` |
| `POST /api/auth/sign-out` | — | `{ success: true }`, cookie з `Max-Age=0` |

`username` — не поле Better Auth: його читають хуки й створюють `profile` (див. `data-model.md`). Пароль — щонайменше 8 символів (типове значення Better Auth).

### `GET /v1/me`

Потрібна сесія (cookie `better-auth.session_token`). Схема: `meResponse`.

```json
{
  "id": "24SHEw5pATkFkDR7lDaYLXewiTEYURBG",
  "email": "a@example.com",
  "username": "alina",
  "bio": null,
  "avatarKey": null,
  "stashPublic": true,
  "createdAt": "2026-11-11T21:08:03.797Z"
}
```

Помилки: 401 `UNAUTHORIZED` — немає сесії; 404 `PROFILE_NOT_FOUND` — у `user` немає профілю.
