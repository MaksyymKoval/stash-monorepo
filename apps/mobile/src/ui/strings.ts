// All user-facing strings, Ukrainian. No i18n library in the MVP.
export const strings = {
  tabs: { feed: 'Стрічка', stash: 'Косметичка', profile: 'Профіль' },
  auth: {
    signInTitle: 'Вхід',
    signUpTitle: 'Реєстрація',
    email: 'Email',
    password: 'Пароль',
    username: "Ім'я користувачки",
    usernameHint: '3–30 символів: малі латинські літери, цифри, «_» або «.»',
    signIn: 'Увійти',
    signUp: 'Зареєструватися',
    toSignUp: 'Немає акаунта? Зареєструватися',
    toSignIn: 'Вже є акаунт? Увійти',
    signOut: 'Вийти',
  },
  errors: {
    INVALID_USERNAME: "Ім'я: 3–30 символів, малі латинські літери, цифри, «_» або «.»",
    USERNAME_TAKEN: "Це ім'я вже зайняте",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Акаунт із цим email вже існує',
    INVALID_EMAIL_OR_PASSWORD: 'Неправильний email або пароль',
    PASSWORD_TOO_SHORT: 'Пароль закороткий (мінімум 8 символів)',
    INVALID_EMAIL: 'Неправильний email',
    unknown: 'Щось пішло не так. Спробуй ще раз',
  } as Record<string, string>,
  empty: 'Скоро тут щось буде',
} as const;

export function errorText(code: string | undefined): string {
  return (code && strings.errors[code]) || strings.errors.unknown!;
}
