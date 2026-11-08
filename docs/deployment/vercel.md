# Деплой ветки на Vercel

## Коротко

Vercel-логин нельзя «подключить» из кода: он привязан к аккаунту и проекту Vercel.
Код может только подготовить сборку и конфигурацию. Чтобы у ветки
`docs/repair-wizards-article-format-v1.3` появился preview, нужно одно из двух:

1. **Импортировать форк в Vercel** и включить для него Git-деплой (рекомендуется).
2. **Настроить CI-деплой по токену** (`VERCEL_TOKEN` и секреты GitHub Actions).

Оригинальный проект Vercel привязан к репозиторию
`lemming-way/repair_wizarts`. Форк `wettterrr/repair_wizarts` — это отдельный
репозиторий, поэтому он **не собирается автоматически** проектом оригинала.
Именно поэтому форк просит логин/доступ: его нужно подключить отдельно.

Не передавайте личный пароль Vercel. Для доступа используйте приглашение в
команду Vercel или отдельный токен.

---

## 1. Настройки сборки проекта

В репозитории уже есть [`vercel.json`](../../vercel.json):

| Параметр         | Значение                 |
| ---------------- | ------------------------ |
| Framework Preset | Create React App         |
| Root Directory   | `.`                      |
| Install Command  | `npm ci`                 |
| Build Command    | `CI=false npm run build` |
| Output Directory | `build`                  |

Почему `CI=false`:

- `react-scripts build` при `CI=true` превращает ESLint-warnings в ошибки;
- в проекте есть старые warnings в несвязанных файлах;
- без `CI=false` сборка падает с `Treating warnings as errors`.

`npm run build` автоматически запускает `prebuild` → `npm run articles:build`,
поэтому ZIP-статьи из `docs/**/*.zip` попадают в `build/articles` во время
сборки Vercel.

SPA-маршруты (`/articles/<id>`) обслуживаются через `routes`:
сначала отдаются реальные файлы, затем `index.html`. Поэтому
`/articles/catalog.json` и `/articles/<slug>/media/*` остаются статикой.

---

## 2. Вариант A: импорт форка в Vercel (рекомендуется)

Нужен аккаунт Vercel и доступ к GitHub-репозиторию форка.

1. Войти в Vercel: <https://vercel.com/login>.
2. Установить/разрешить Vercel GitHub App для репозитория
   `wettterrr/repair_wizarts` (или для организации, где он лежит).
3. `Add New…` → `Project` → `Import Git Repository` →
   выбрать `wettterrr/repair_wizarts`.
4. В настройках импорта:
   - Framework Preset: `Create React App`;
   - Root Directory: `./`;
   - Build Command: `CI=false npm run build`;
   - Output Directory: `build`;
   - Install Command: `npm ci`.
5. Environment Variables:
   - `REACT_APP_BLOG_SOURCE=local` — статьи из `public/articles` (по умолчанию);
   - `REACT_APP_API_URL` — только если нужен реальный backend.
6. Deploy.
7. Settings → Git → Production Branch:
   - если production должен быть именно эта ветка — указать
     `docs/repair-wizards-article-format-v1.3`;
   - если нужны только preview — оставить production-ветку прежней,
     а эту ветку использовать для Preview Deployments.

После импорта каждый push в ветку будет создавать Preview Deployment.
Vercel покажет URL в GitHub-деплойментах и в интерфейсе проекта.

### Почему оригинальный проект не собирает форк

Vercel-проект связан с конкретным Git-репозиторием. Форк — другой репозиторий.
Preview-деплойменты оригинала строятся для веток/PR внутри
`lemming-way/repair_wizarts`, а не для `wettterrr/repair_wizarts`.

Варианты:

- импортировать форк как отдельный Vercel-проект;
- открыть PR из форка в оригинал и разрешить preview-сборки для fork PR
  (если это настроено у владельца Vercel-проекта);
- добавить форк в тот же Vercel-проект нельзя: у проекта один Git-репозиторий.

---

## 3. Вариант B: Vercel CLI

CLI тоже требует логин, но позволяет привязать форк к проекту вручную.

```bash
npm install -g vercel

vercel login
vercel link
vercel --prod
```

Для preview-деплоя без production:

```bash
vercel
```

`vercel link` создаст/подключит проект. Если проект уже создан в команде,
CLI предложит выбрать его.

---

## 4. Вариант C: деплой из GitHub Actions по токену

Подходит, если не хочется, чтобы каждый разработчик логинился в Vercel.
Один раз создаётся токен и секреты, дальше push в ветку деплоит CI.

### 4.1. Получить значения

В Vercel:

- Account Settings → Tokens → Create Token → `VERCEL_TOKEN`;
- Project Settings → General → `Project ID` → `VERCEL_PROJECT_ID`;
- Team Settings → `Team ID` (или `VERCEL_ORG_ID`).

В GitHub-репозитории форка:

- Settings → Secrets and variables → Actions → New repository secret:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

### 4.2. Workflow

Добавьте `.github/workflows/vercel-preview.yml`:

```yaml
name: Vercel Preview

on:
  push:
    branches:
      - docs/repair-wizards-article-format-v1.3
  workflow_dispatch:

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      - run: npx vercel build --token=${{ secrets.VERCEL_TOKEN }}
      - run: npx vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
```

Для production-деплоя замените `--environment=preview` на
`--environment=production` и добавьте `--prod` в `vercel deploy`.

Токен — это доступ к аккаунту/команде. Не публикуйте его в репозитории;
храните только в GitHub Secrets.

---

## 5. Доступ для человека, который просит логин

Правильные способы:

1. **Пригласить в Vercel Team**
   - Vercel → Team → Settings → Members → Invite;
   - выдать роль `Member` (или `Developer`, если нужно деплоить);
   - этот человек сможет видеть проект и preview-деплойменты.
2. **Дать доступ к GitHub-репозиторию**
   - если проект импортируется из форка, у человека должен быть доступ
     к `wettterrr/repair_wizarts`.
3. **CI-токен**
   - если человеку нужно только запускать сборку, создайте отдельный токен
     и положите его в GitHub Secrets;
   - не отправляйте токен в чат и не коммитьте.

Нельзя «выдать логин» ссылкой или настройкой репозитория: Vercel
аутентифицирует конкретного пользователя. Если человеку нужен доступ —
его нужно пригласить в команду или выдать токен.

---

## 6. Переменные окружения

| Переменная              | Когда нужна      | Значение                                               |
| ----------------------- | ---------------- | ------------------------------------------------------ |
| `REACT_APP_BLOG_SOURCE` | всегда           | `local` для статей из ZIP; `api` для реального backend |
| `REACT_APP_API_URL`     | только для `api` | URL backend API                                        |
| `CI`                    | настройка сборки | `false` для `react-scripts build`                      |

Для текущего тестового контура достаточно `local`: статьи лежат в
`public/articles`, backend не нужен.

---

## 7. Проверка после деплоя

```bash
BASE=https://<your-deployment>.vercel.app

curl -I "$BASE/"
curl -I "$BASE/articles/"
curl -I "$BASE/articles/catalog.json"
curl -I "$BASE/articles/1"
```

Ожидается:

- `/` — 200;
- `/articles/` — 200;
- `/articles/catalog.json` — 200 и `application/json`;
- `/articles/1` — 200 (SPA fallback);
- нет ответа `404: NOT_FOUND` на deep link.

В браузере:

- открыть `/articles/`;
- проверить карточки и переход на детальную статью;
- обновить страницу на `/articles/1` — она не должна давать 404.

---

## 8. Частые проблемы

| Симптом                              | Причина                                         | Решение                                                                           |
| ------------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------- |
| `Treating warnings as errors`        | Vercel выставляет `CI=true`                     | Build Command `CI=false npm run build` или env `CI=false`                         |
| `404: NOT_FOUND` на `/articles/1`    | нет SPA fallback                                | проверить `routes`/`rewrites` в `vercel.json`                                     |
| `/articles/catalog.json` отдаёт HTML | rewrite перехватил статику                      | `handle: filesystem` перед fallback                                               |
| Статьи не появились                  | `prebuild` не выполнился                        | Build Command должен запускать `npm run build`, не `react-scripts build` напрямую |
| Пустой каталог                       | `REACT_APP_BLOG_SOURCE=api`, backend недоступен | поставить `local`                                                                 |
| Сборка не стартует                   | проект Vercel не связан с форком                | импортировать форк или настроить CLI/токен                                        |
| Просят логин                         | нет аккаунта/приглашения в команду              | пригласить в Vercel Team или выдать токен                                         |

---

## 9. Что можно и нельзя сделать из репозитория

Можно:

- хранить `vercel.json`;
- задавать build/output/install команды;
- настраивать SPA fallback;
- документировать env;
- добавить GitHub Actions workflow для деплоя по токену.

Нельзя:

- создать Vercel-аккаунт;
- выдать доступ к чужой команде;
- обойти login Vercel;
- привязать форк к чужому Vercel-проекту без прав владельца.
