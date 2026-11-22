# Реліз

Каркас. Заповнюється перед першим TestFlight.

- **iOS:** Bundle ID `com.unlockyourstash.app`, команда Apple `3R47XS2WDC`, схема `makeupstash`. Зараз — лише development build з Xcode (`setup.md`).
- **Ще не вирішено:** EAS Build чи локальна збірка, хостинг API та Postgres, продакшн `BETTER_AUTH_URL` (HTTPS).
- **Вимоги App Store до публічного запуску (етап 5):** видалення акаунта із застосунку, скарги й блокування для користувацького контенту, політика приватності, віковий рейтинг 16+, тексти дозволів камери й фото (вже в `app.json`).
