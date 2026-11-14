# Серверный PHP-шаблон `repair_api_test_page`

Документ описывает поиск шаблона и его обновление через REST API тестового окружения. Значения секретов здесь не хранятся — указаны только их имена.

## Идентификатор и имя

| Назначение | Значение |
|---|---|
| Таблица API | `script_templates` |
| Имя шаблона (`var`) | `repair_api_test_page` |
| ID записи (`id_script_template`) в проверенном тестовом окружении | `2` |
| Исходный PHP-файл в репозитории | `script_templates/repair_api_test_page.php` |

ID `2` подтверждён чтением приватных данных API в GitHub Actions 14.11.2026. В другом tenant/окружении ID может отличаться. Перед изменением сначала найдите запись по `var`, не полагайтесь только на сохранённый ID.

## URL API

Workflow собирает адрес так:

```text
{REPAIR_API_BASE}/api/v1/data
```

Для тестового окружения ранее использовался адрес API:

```text
https://ibronevik.ru/taxi/c/tutor/api/v1/data
```

В GitHub Secret `REPAIR_API_BASE` должна лежать базовая часть без завершающего `/api/v1`, поскольку скрипт добавляет `/api/v1/data` самостоятельно. Ожидаемая базовая часть для указанного URL:

```text
https://ibronevik.ru/taxi/c/tutor
```

Фактическое значение секрета из GitHub не читается и здесь не проверяется. При смене tenant меняйте Secret, а не зашивайте URL в скрипты.

## GitHub Actions Secrets

В репозитории `lemming-way/repair_wizarts` используются три секрета:

| Secret | Назначение |
|---|---|
| `REPAIR_API_BASE` | Базовый URL backend без суффикса `/api/v1/data` |
| `REPAIR_API_TOKEN` | API-токен авторизации |
| `REPAIR_API_U_HASH` | Идентификатор/хэш пользователя для авторизации |

Настройка: GitHub → репозиторий → Settings → Secrets and variables → Actions. Значения секретов не выводить в логи, не добавлять в исходники и не передавать в коммиты.

## Как найти запись перед редактированием

Запрос выполняется методом POST на URL выше, с типом `application/x-www-form-urlencoded`.

Поля формы:

```text
private=1
token={REPAIR_API_TOKEN}
u_hash={REPAIR_API_U_HASH}
```

В ответе ищите:

```text
data.script_templates
```

Нужная запись определяется по точному значению:

```text
var = repair_api_test_page
```

Ключ записи в объекте `script_templates` — её ID. Если API вернул массив, используйте поле `id_script_template` записи, если оно присутствует. Не путайте индекс массива с ID БД.

В репозитории есть read-only workflow:
`.github/workflows/read-repair-template-id.yml`

Он выполняет только чтение и печатает найденный ID. Успешная проверка ID `2`:
https://github.com/lemming-way/repair_wizarts/actions/runs/43630728473

## Как редактировать шаблон через /data

Маршрут `/data` принимает POST-поле `data` с JSON. Для обновления существующей записи ID должен находиться **внутри объекта** массива `script_templates`.

Пример для проверенного тестового окружения:

```json
{
  "script_templates": [
    {
      "id": 2,
      "var": "repair_api_test_page",
      "file": "<?php\\n// Новая версия шаблона\\n",
      "active": 1,
      "only_admin": 1
    }
  ]
}
```

В реальном запросе вместо сокращённого примера передавайте полное содержимое файла `script_templates/repair_api_test_page.php`.

Форма POST:

```text
private=1
token={REPAIR_API_TOKEN}
u_hash={REPAIR_API_U_HASH}
data={JSON.stringify(payload)}
```

Важно:

- `id: 2` направляет операцию на существующую запись; без ID API может пойти по ветке INSERT и получить ошибку уникальности по `var`.
- Поле `var` должно остаться `repair_api_test_page`.
- Поле `file` содержит PHP-код. Backend сохраняет его в отдельный PHP-файл, а в `script_template.value` хранит имя созданного файла.
- Используйте только HTTPS и URL из `REPAIR_API_BASE`.
- Не отправляйте запрос на создание, пока не проверили наличие записи.
- Успешный HTTP-ответ сам по себе недостаточен: проверяйте JSON-ответ API (`status` и `code`).

## Обновление через GitHub Actions

Основной источник PHP-кода — файл:

`script_templates/repair_api_test_page.php`

Workflow:

`.github/workflows/create-repair-api-test-page.yml`

Скрипт:

`tests/backend/create-template.mjs`

Workflow запускается при изменении этих файлов в ветке `docs/repair-wizards-article-format-v1.3`. Он читает список шаблонов, ищет запись по `var`, сравнивает SHA-256 при наличии хэша сервера и затем создаёт или обновляет запись.

Перед использованием проверьте вывод workflow. Если запись уже существует, операция обновления обязана передавать её ID. Если ID не удалось определить — безопасное поведение: остановиться, а не выполнять INSERT.

## Права доступа и ограничения

Операция требует авторизованного пользователя. Право редактирования `script_templates` дополнительно зависит от серверной настройки прав `data_edit_users_roles_rights` и роли пользователя. Ошибка доступа не исправляется изменением JSON-полей.

Секреты GitHub Actions дают workflow доступ к backend от имени настроенной учётной записи. Не расширяйте их область применения и не печатайте значения в логах.

## Быстрая памятка

1. Изменить `script_templates/repair_api_test_page.php`.
2. Убедиться, что целевой backend задан через `REPAIR_API_BASE`.
3. Проверить наличие трёх Actions Secrets: `REPAIR_API_BASE`, `REPAIR_API_TOKEN`, `REPAIR_API_U_HASH`.
4. Найти запись по `var=repair_api_test_page`; в проверенном тестовом tenant её ID — `2`.
5. При ручном POST передать `id: 2` внутри объекта `script_templates[0]`.
6. Проверить результат workflow и затем проверить работу шаблона на тестовом API.

Связанные файлы:
- `script_templates/repair_api_test_page.php`
- `tests/backend/create-template.mjs`
- `.github/workflows/create-repair-api-test-page.yml`
- `.github/workflows/read-repair-template-id.yml`
