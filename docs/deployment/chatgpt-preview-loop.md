# Рабочий цикл ChatGPT → GitHub → Vercel Preview

Документ фиксирует фактическую схему для репозитория
`wettterrr/repair_wizarts` и ветки
`docs/repair-wizards-article-format-v1.3`, а также настройки, которые нужны,
чтобы ChatGPT мог самостоятельно получать публичный Preview по SHA коммита.

---

## 1. Что уже работает

Проверено по публичным данным GitHub и деплоям:

- GitHub Actions включены, workflow `Article v1.3 CI` активен.
- Для коммита `ba83f3b` CI завершился успешно:
  `https://github.com/wettterrr/repair_wizarts/actions/runs/42613640483`
- Vercel Git Integration подключён к форку: на коммит `ba83f3b`
  Vercel создал deployment со статусом `success`.
- Production-алиас `https://repair-wizarts-two.vercel.app/` доступен
  без авторизации (HTTP 200).
- Для ветки существует preview-алиас вида
  `https://repair-wizarts-git-docs-repair-wizar-...-wettterrrs-projects.vercel.app`,
  но он закрыт Vercel Authentication — снаружи виден `You need access`.

## 2. Чего не хватает

1. **Preview закрыт защитой Vercel.**
   Пока включён `Vercel Authentication`, ChatGPT и внешний ревьюер
   не смогут открыть preview без логина.
2. **Нет машинно-читаемого URL по SHA.**
   GitHub-статус Vercel ведёт на `vercel.com/...`, а не на публичный
   preview. Branch alias не привязан к конкретному коммиту.
3. **CI не запускается для рабочих веток `work/**`.**
Сейчас CI был настроен только на `docs/...`; это уже исправлено
в `.github/workflows/ci.yml`.
4. **Нет автоматической публикации URL в GitHub Deployments.**
   Добавлен workflow `.github/workflows/publish-vercel-preview.yml`,
   который находит Vercel deployment по SHA и создаёт GitHub Deployment
   с `environment_url`.

---

## 3. Настройки Vercel

Проект: `repair-wizarts` в команде `wettterrrs-projects`.
Создавать новый проект не нужно.

### 3.1. Git

```text
Project → Settings → Git
```

Проверить:

- Repository: `wettterrr/repair_wizarts`;
- Production Branch: `main` (production не трогаем);
- Preview Branches: `All branches` — иначе ветка `work/chatgpt/...`
  не получит preview.

### 3.2. Публичный Preview

```text
Project → Settings → Deployment Protection
```

Нужно:

- `Vercel Authentication`: `Disabled`;
- `Password Protection`: выключен;
- `Trusted IPs`: не ограничивают доступ.

Если отключить защиту для всех preview нельзя, второй вариант —
оставить защиту только на production, а preview сделать публичным.
Для требования «Preview доступен без авторизации» защита preview
должна быть выключена.

Важно: публичный preview не должен содержать секретов. Не добавляйте
в `REACT_APP_*` токены, пароли и приватные ключи.

### 3.3. Переменные окружения

```text
Project → Settings → Environment Variables
```

Для текущей ветки:

```text
REACT_APP_BLOG_SOURCE=api
REACT_APP_API_URL=<URL production API>
```

Если нужен автономный preview без backend:

```text
REACT_APP_BLOG_SOURCE=local
```

`local` использует `public/articles` и не требует PHP/MySQL.
`api` требует доступный backend и корректный CORS для preview-домена.

### 3.4. Секреты для workflow

Нужно создать в Vercel:

- `VERCEL_TOKEN` — Account Settings → Tokens;
- `VERCEL_PROJECT_ID` — Project Settings → General;
- `VERCEL_ORG_ID` — Team Settings.

Добавить их в GitHub:

```text
wettterrr/repair_wizarts → Settings → Secrets and variables → Actions
```

Имена:

```text
VERCEL_TOKEN
VERCEL_PROJECT_ID
VERCEL_ORG_ID
```

Токен хранится только в GitHub Secrets. ChatGPT не должен получать
`VERCEL_TOKEN`.

---

## 4. Как работает цикл

### 4.1. ChatGPT создаёт рабочую ветку

```bash
git checkout docs/repair-wizards-article-format-v1.3
git pull --ff-only
git checkout -b work/chatgpt/<task-name>
```

Меняет код, коммитит и пушит:

```bash
git push origin work/chatgpt/<task-name>
```

`main` и production не изменяются.

### 4.2. Запускается CI

`.github/workflows/ci.yml` теперь слушает:

- `docs/repair-wizards-article-format-v1.3`;
- `work/**`.

Проверка статуса:

```bash
gh run list --repo wettterrr/repair_wizarts --branch work/chatgpt/<task-name>
gh run watch <run-id> --repo wettterrr/repair_wizarts
```

### 4.3. Vercel собирает Preview

Vercel Git Integration автоматически создаёт deployment для ветки.
После сборки запускается `Publish Vercel preview URL`.

Workflow находит deployment по `GITHUB_SHA` через Vercel API и создаёт
GitHub Deployment с `environment_url`.

### 4.4. ChatGPT получает URL по SHA

Через GitHub API:

```bash
SHA=<commit-sha>

DEPLOYMENT_ID=$(gh api \
  "repos/wettterrr/repair_wizarts/deployments?ref=$SHA&environment=preview" \
  --jq '.[0].id')

PREVIEW_URL=$(gh api \
  "repos/wettterrr/repair_wizarts/deployments/$DEPLOYMENT_ID/statuses" \
  --jq '[.[] | select(.environment_url != null)][0].environment_url')

echo "$PREVIEW_URL"
```

Проверка доступности:

```bash
curl -I "$PREVIEW_URL"
curl -I "$PREVIEW_URL/articles/"
curl -I "$PREVIEW_URL/articles/1"
```

Ожидается `200` без `You need access`.

### 4.5. Проверка приложения

- открыть preview в браузере/headless;
- проверить базовую страницу — она не должна висеть на `Loading...`;
- проверить `/articles/`;
- проверить детальную статью и блоки;
- проверить ошибки в консоли;
- при ошибке — исправить, закоммитить, повторить.

---

## 5. Права ChatGPT

ChatGPT нужен GitHub-токен, а не Vercel-логин.

Минимально достаточно fine-grained PAT:

- `Contents: Read and write` — создавать ветку и пушить;
- `Actions: Read` — смотреть CI;
- `Deployments: Read` — получать `environment_url`.

Для создания PR (если нужно):

- `Pull requests: Read and write`.

Рекомендуется:

- отдельный machine user или отдельный fine-grained PAT;
- branch protection на `main`;
- запрет push в `main` для токена;
- срок жизни токена.

ChatGPT не нужен доступ к Vercel Dashboard, если workflow публикует
`environment_url` в GitHub Deployments.

---

## 6. Ограничения безопасности

- Preview публичный — не кладите в него секреты.
- `VERCEL_TOKEN` не передаётся ChatGPT и не коммитится.
- Production и `main` не изменяются без отдельного согласования.
- Запись в боевую БД не выполняется.
- Ветка `work/**` — только для экспериментов.

---

## 7. Что нужно сделать вручную

1. Отключить Vercel Authentication для preview.
2. Проверить `Preview Branches: All branches`.
3. Добавить `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`
   в GitHub Secrets.
4. Сделать тестовый push в `work/chatgpt/...`.
5. Убедиться, что:
   - CI завершился успешно;
   - Vercel deployment имеет статус `Ready`;
   - в GitHub Deployments появился `environment_url`;
   - URL открывается без логина.
6. Выдать ChatGPT GitHub-токен с правами из раздела 5.

После этого цикл «коммит → CI → Preview → URL → проверка → фикс»
не требует ручного доступа к Vercel Dashboard.
