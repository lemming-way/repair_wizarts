# Серверный PHP-шаблон `repair_api_test_page`

Документ описывает поиск шаблона и его обновление через REST API тестового окружения. Значения секретов здесь не хранятся — указаны только их имена.

## Идентификатор и имя

| Назначение | Значение |
|---|---|
| Таблица API | `script_templates` |
| Имя шаблона (`var`) | `repair_api_test_page` |
| ID записи (`id_script_template`) | Искать по `var` перед каждым изменением |
| Исходный PHP-файл в репозитории | `script_templates/repair_api_test_page.php` |

ID записи не является стабильным: после удаления и повторного INSERT он меняется. Перед изменением всегда находите запись по `var`, не полагайтесь на сохранённый ID.

## URL API

Workflow собирает адрес так:

```text
{REPAIR_API_BASE}/api/v1/data
```

Основное (production) окружение:

```text
https://ibronevik.ru/taxi/c/tutor/api/v1/data
```

Тестовый tenant:

```text
https://ibronevik.itest24.com/taxi_dev2/c/tutor/api/v1/data
```

В GitHub Secret `REPAIR_API_BASE` должна лежать базовая часть без завершающего `/api/v1`, поскольку скрипт добавляет `/api/v1/data` самостоятельно. Ожидаемые базовые части:

```text
production: https://ibronevik.ru/taxi/c/tutor
test:       https://ibronevik.itest24.com/taxi_dev2/c/tutor
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

Он выполняется вручную (`workflow_dispatch`), ничего не изменяет и печатает найденный ID.

## Как редактировать шаблон через /data

Маршрут `/data` принимает POST-поле `data` с JSON. Для обновления существующей записи ID должен находиться **внутри объекта** массива `script_templates`.

Пример для тестового окружения (ID берётся из поиска по `var`):

```json
{
  "script_templates": [
    {
      "id": 123,
      "var": "repair_api_test_page",
      "file": "<?php\\n// Новая версия шаблона\\n",
      "active": 1,
      "only_admin": 0
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

- `id` из поиска по `var` направляет операцию на существующую запись; без ID API может пойти по ветке INSERT и получить ошибку уникальности по `var`.
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

Workflow запускается вручную (`workflow_dispatch`). Он читает список шаблонов, ищет запись по `var`, сравнивает SHA-256 при наличии хэша сервера и затем создаёт или обновляет запись.

Все workflow, которые пишут в БД, шаблоны, Vercel env или выполняют deploy, запускаются только вручную. Push-триггеры остаются у read-only проверок (`ci`, inspect/probe, smoke).

Перед использованием проверьте вывод workflow. Если запись уже существует, операция обновления обязана передавать её ID. Если ID не удалось определить — безопасное поведение: остановиться, а не выполнять INSERT.

## Права доступа и ограничения

Операция требует авторизованного пользователя. Право редактирования `script_templates` дополнительно зависит от серверной настройки прав `data_edit_users_roles_rights` и роли пользователя. Ошибка доступа не исправляется изменением JSON-полей.

Для доступа клиентов и мастеров к тестовому шаблону поле `only_admin` должно быть `0`. Значение `1` оставляет шаблон только для администратора и даёт `not enough rights` даже авторизованным пользователям.

Тестовый шаблон `repair_api_test_page` не является дефолтным для фронтенда: по умолчанию используется production-шаблон `script/template/repair_api`. Тестовый путь включается только через `REACT_APP_BLOG_API_PATH`.

Секреты GitHub Actions дают workflow доступ к backend от имени настроенной учётной записи. Не расширяйте их область применения и не печатайте значения в логах.

## Быстрая памятка

1. Изменить `script_templates/repair_api_test_page.php`.
2. Убедиться, что целевой backend задан через `REPAIR_API_BASE`.
3. Проверить наличие трёх Actions Secrets: `REPAIR_API_BASE`, `REPAIR_API_TOKEN`, `REPAIR_API_U_HASH`.
4. Найти запись по `var=repair_api_test_page` и взять её ID из ответа.
5. При ручном POST передать этот ID внутри объекта `script_templates[0]`.
6. Проверить результат workflow и затем проверить работу шаблона на тестовом API.

Связанные файлы:
- `script_templates/repair_api_test_page.php`
- `tests/backend/create-template.mjs`
- `.github/workflows/create-repair-api-test-page.yml`
- `.github/workflows/read-repair-template-id.yml` (ручной запуск)
