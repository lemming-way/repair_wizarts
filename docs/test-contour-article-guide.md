# Как создать и протестировать статью в тестовом контуре

**Для кого:** внешний ИИ-агент, который готовит и проверяет статьи Repair Wizards.  
**Версия контура:** Article Format 1.3.  
**Результат:** статья появляется в каталоге `/articles`, открывается по `/articles/<id>` и проходит проверки проекта.

---

## 1. Главное, что нужно понять

В текущем тестовом контуре **нет UI-редактора, нет создания статьи через API и нет доступной MySQL-базы**.

Создание статьи здесь — это **файловый импорт**:

```text
article.json + media/  →  ZIP  →  docs/**/*.zip  →  npm run articles:build  →  public/articles  →  /articles
```

Если внешний ИИ пытается «создать статью» через БД, админку или несуществующий API — он не сможет этого сделать. Это ограничение тестового контура, а не ошибка формата статьи.

Контур поддерживает:

- `Article Format 1.3`;
- блоки `heading`, `paragraph`, `image`, `gallery`, `video`, `list`, `quote`, `callout`, `steps`, `table`, `code`, `model_3d`;
- изображения, SVG, GLB/glTF, YouTube;
- необязательный `technical_knowledge` (хранится, но не выводится как содержимое статьи);
- единый `ArticleRenderer` для каталога и детальной страницы.

Контур **не поддерживает**:

- создание статьи через форму или REST-метод;
- загрузку ZIP через браузер;
- запись в `blog_post`/`blog_topic`;
- гостевые комментарии: гостевой режим выключен, комментирование доступно только авторизованным пользователям.

---

## 2. Быстрый путь

Из корня репозитория:

```bash
# 1. Создать папку статьи
mkdir -p docs/incoming/my-article/media

# 2. Положить article.json и файлы в media/
#    (шаблон ниже)

# 3. Собрать стандартный ZIP
cd docs/incoming/my-article
zip -r ../my-article.zip article.json media
cd -

# 4. Проверить ZIP
unzip -t docs/incoming/my-article.zip

# 5. Импортировать в каталог
npm run articles:build

# 6. Запустить сайт (если ещё не запущен)
npm start
```

Открыть:

```text
http://localhost:3000/articles
```

Найти карточку по заголовку и открыть её. ID статьи можно посмотреть в `public/articles/catalog.json`.

---

## 3. Структура ZIP

Архив должен иметь ровно такую структуру:

```text
my-article.zip
├── article.json
└── media/
    ├── cover.svg
    ├── image_001.png
    ├── step_01.jpg
    └── model.glb
```

Требования:

- `article.json` лежит **в корне** архива, не во вложенной папке;
- каталог `media/` обязателен;
- все файлы, на которые ссылаются `cover`, `assets` и блоки, должны физически лежать в `media/`;
- пути в JSON — относительные, вида `media/cover.svg`;
- нельзя использовать `../`, абсолютные пути и `file://`;
- имя ZIP — это `slug` статьи: лучше `[a-z0-9_-]`, без пробелов;
- ZIP должен быть обычным стандартным архивом, `unzip -t` должен проходить без ошибок.

Имя ZIP определяет папку в `public/articles/<slug>/` и сортировку в каталоге.

---

## 4. Минимальный `article.json`

```json
{
  "format_version": "1.3",
  "title": "Замена аккумулятора смартфона",
  "summary": "Пошаговая инструкция по безопасной замене аккумулятора.",
  "topic": {
    "name": "Ремонт смартфонов",
    "path": ["Электроника", "Смартфоны", "Ремонт"]
  },
  "cover": {
    "file": "media/cover.svg",
    "alt": "Смартфон с открытой задней крышкой"
  },
  "assets": [
    {
      "file": "media/cover.svg",
      "type": "image",
      "format": "svg",
      "size_bytes": 1234
    },
    {
      "file": "media/model.glb",
      "type": "model_3d",
      "format": "glb",
      "size_bytes": 5678
    }
  ],
  "blocks": [
    {
      "type": "heading",
      "level": 2,
      "text": "Подготовка"
    },
    {
      "type": "paragraph",
      "text": "Перед началом работы выключите устройство."
    },
    {
      "type": "image",
      "file": "media/cover.svg",
      "caption": "Схема устройства",
      "alt": "Схема устройства"
    },
    {
      "type": "model_3d",
      "file": "media/model.glb",
      "caption": "3D-модель корпуса",
      "alt": "3D-модель корпуса смартфона",
      "controls": {
        "rotate": true,
        "zoom": true,
        "pan": false
      },
      "camera": {
        "azimuth": 35,
        "elevation": 65
      },
      "scale": 1
    }
  ]
}
```

`size_bytes` — фактический размер файла. Его можно получить так:

```bash
find media -type f -printf '%P %s\n'
```

Для реальной статьи лучше ориентироваться на полные примеры:

- `docs/regression/v1.3/smartphone/article.json`
- `docs/regression/v1.3/electric_kettle/article.json`
- `docs/regression/v1.3/toilet_cistern/article.json`

Они покрывают все 12 типов блоков.

---

## 5. Обязательные и необязательные поля

### Корень статьи

| Поле                  | Обязательно | Примечание                             |
| --------------------- | ----------- | -------------------------------------- |
| `format_version`      | да          | строго `"1.3"`                         |
| `title`               | да          | заголовок статьи                       |
| `summary`             | да          | краткое описание для каталога          |
| `topic`               | да          | `{ "name": "...", "path": [...] }`     |
| `cover`               | нет         | если есть, файл должен быть в `assets` |
| `assets`              | да          | все используемые файлы                 |
| `blocks`              | да          | непустой массив                        |
| `technical_knowledge` | нет         | не отображается как статья             |

### assets

| Поле         | Обязательно                                   |
| ------------ | --------------------------------------------- |
| `file`       | да                                            |
| `type`       | да (`image`, `model_3d`, …)                   |
| `format`     | рекомендуется (`svg`, `png`, `jpg`, `glb`, …) |
| `size_bytes` | да — фактический размер файла                 |

Все ссылки из `blocks`, `cover` и `technical_knowledge.media_refs` должны указывать на файлы из `assets` и существовать в ZIP.

### Изображения

- `alt` — обязателен по смыслу для доступности;
- `caption` — подпись под изображением;
- галерея — от 2 изображений;
- изображения адаптируются, открываются в лайтбоксе;
- SVG допустим как демонстрационная схема.

### Видео

```json
{
  "type": "video",
  "url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
  "caption": "Демонстрация"
}
```

Поддерживаются YouTube-ссылки (watch, youtu.be, shorts, embed). Плеер вставляется через `iframe` с `youtube-nocookie`. Произвольный HTML плеера не допускается.

### 3D

```json
{
  "type": "model_3d",
  "file": "media/model.glb",
  "caption": "Модель узла",
  "alt": "3D-модель узла",
  "controls": { "rotate": true, "zoom": true, "pan": false },
  "camera": { "azimuth": 45, "elevation": 70 },
  "scale": 1
}
```

Используется `<model-viewer>` от Google. Поддерживаются GLB и glTF. Предпочтителен GLB.

Если CDN/сеть недоступны, вместо модели показывается fallback-ссылка на файл — это нормально для офлайн-контура, текст статьи при этом не ломается.

### Остальные блоки

| Тип         | Ключевые поля                                              |
| ----------- | ---------------------------------------------------------- |
| `heading`   | `level` (2–4), `text`                                      |
| `paragraph` | `text`                                                     |
| `image`     | `file`, `caption`, `alt`                                   |
| `gallery`   | `images[]` с `file`, `caption`, `alt`                      |
| `video`     | `url`, `caption`                                           |
| `list`      | `style` (`ordered`/`unordered`), `items[]`                 |
| `quote`     | `text`, `caption`                                          |
| `callout`   | `style` (`info`/`tip`/`warning`/`danger`), `title`, `text` |
| `steps`     | `items[]` с `title`, `text`, `image?`, `warning?`          |
| `table`     | `headers[]`, `rows[][]`                                    |
| `code`      | `language`, `text`                                         |
| `model_3d`  | `file`, `alt`, `caption`, `controls`, `camera`, `scale`    |

Подробные схемы полей и ограничения — в
[docs/repair-wizards-article-format-v1.3.md](repair-wizards-article-format-v1.3.md).

---

## 6. Проверка статьи

### 6.1. Проверка ZIP

```bash
unzip -t docs/incoming/my-article.zip
unzip -l docs/incoming/my-article.zip
```

Ожидается:

```text
No errors detected in compressed data
```

В списке должны быть `article.json` и все файлы из `media/`.

Если `unzip` пишет `expected central file header signature not found` — архив собран неправильно. Пересоберите его обычным `zip` или Python:

```bash
cd docs/incoming/my-article
python3 -m zipfile -c ../my-article.zip article.json media
```

### 6.2. Проверка импортёром проекта

```bash
npm run articles:build
```

Ожидается:

```text
[articles] imported N article(s) from docs/: ...
[articles] output: public/articles
```

Импортёр проверяет:

- `article.json` в корне;
- каталог `media/`;
- `format_version = "1.3"`;
- допустимые типы блоков;
- наличие файлов из `assets`;
- наличие файла обложки, если указан `cover`.

Если нужно проверить только один архив:

```bash
node --input-type=module -e "
import { readArticleZip } from './scripts/article-importer.mjs';
const a = readArticleZip('docs/incoming/my-article.zip');
console.log(a.slug, a.article.title, a.article.blocks.length);
"
```

### 6.3. Проверка каталога

```bash
node -e "
const c = require('./public/articles/catalog.json');
console.log(c.articles.map(a => [a.id, a.slug, a.title]));
"
```

Статья должна появиться в списке. `id` — это номер, по которому открывается `/articles/<id>`.

### 6.4. Проверка в браузере

Если сервер уже запущен:

```bash
npm run articles:build
```

и обновить страницу. Если не запущен:

```bash
npm start
```

Открыть:

```text
http://localhost:3000/articles
http://localhost:3000/articles/<id>
```

`npm start` сам выполняет `articles:build` через `prestart`, поэтому отдельный запуск сборки не обязателен.

### 6.5. Автотесты

```bash
npm run test:articles:importer
npm test -- --watchAll=false --runInBand
npx tsc --noEmit
npm run lint
npm run build
```

`test:articles:importer` проверяет ZIP-импортёр, структуру, CRC32, Data Descriptor и сборку статического каталога.

---

## 7. Что проверить глазами

- [ ] карточка статьи есть в `/articles`;
- [ ] заголовок, краткое описание, тема и обложка отображаются;
- [ ] карточка ведёт на `/articles/<id>`;
- [ ] блоки идут в том же порядке, что в `blocks`;
- [ ] абзацы и заголовки читаемы;
- [ ] изображения с подписями, галерея листается;
- [ ] видео вставляется плеером YouTube;
- [ ] плашки `info/tip/warning/danger` цветные;
- [ ] шаги пронумерованы 1, 2, 3…;
- [ ] таблица не выходит за пределы страницы, на мобильном прокручивается внутри;
- [ ] код в рамке, с кнопкой копирования;
- [ ] 3D-модель загружается или показывает понятный fallback;
- [ ] `technical_knowledge` не выводится как текст статьи;
- [ ] на мобильной ширине нет горизонтальной прокрутки всей страницы;
- [ ] в статье нет сырого JSON.

---

## 8. Ограничения тестового контура

### Нет API/БД для создания

`CONFIG.BLOG.source` в [src/config/index.js](../src/config/index.js) по умолчанию равен `local`:
каталог читает `public/articles`, собранный из ZIP.

Переключение на API:

```bash
REACT_APP_BLOG_SOURCE=api npm start
```

Но в тестовом контуре нет PHP/MySQL, а импорт ZIP в `blog_post` не реализован.
Поэтому **не нужно** пытаться создать статью через `blog_post`, `blog_topic` или
`importBlogPost` — в этом контуре их нет.

Если заказчику нужен API-импорт, это отдельная задача: нужно поднять PHP+MySQL,
реализовать `validateBlogImport` / `previewBlogImport` / `importBlogPost`
по [спецификации хранения и импорта](repair-wizards-article-storage-import-rendering-v1.3.md)
и только затем переключать фронтенд на `api`.

### `public/articles` — генерируемый каталог

Не редактируйте `public/articles` вручную: при следующем `npm run articles:build`
каталог пересобирается из ZIP и ручные правки исчезнут.

Источник истины — ZIP в `docs/`.

### Повторный импорт

Если изменить ZIP и снова запустить `npm run articles:build`, каталог полностью
пересобирается. Удалённые статьи исчезают, изменённые — обновляются.

### Дубли slug

Два ZIP с одинаковым именем (в разных папках `docs/`) вызовут ошибку
`Duplicate article slug`. Имя ZIP должно быть уникальным.

---

## 9. Частые ошибки

| Симптом                                            | Причина                                            | Решение                                                      |
| -------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| `article.json not found in the archive root`       | JSON во вложенной папке                            | положить `article.json` в корень ZIP                         |
| `media/ directory not found`                       | нет каталога `media/`                              | добавить `media/` с файлами                                  |
| `asset file is missing`                            | файл указан в `assets`, но отсутствует в ZIP       | добавить файл или убрать ссылку                              |
| `unsupported block type`                           | опечатка или неподдерживаемый тип                  | использовать типы из таблицы                                 |
| `expected central file header signature not found` | ZIP собран без central directory                   | пересобрать `zip -r`/Python                                  |
| статья не появилась в каталоге                     | не запущен `articles:build` или сервер не обновлён | `npm run articles:build`, обновить страницу                  |
| карточка есть, детальная пустая                    | неверный `id`/slug или битый JSON                  | проверить `catalog.json`, запустить импорт снова             |
| 3D пустая/ошибка                                   | нет сети/CDN или битый GLB                         | проверить файл, использовать валидный GLB; fallback — норма  |
| видео не играет                                    | нет сети/YouTube недоступен                        | проверить `url`; в офлайн-контуре плеер может не загрузиться |
| `technical_knowledge` виден как текст              | он попал в `blocks`                                | хранить его только в корне `technical_knowledge`             |
| ручные правки в `public/articles` пропали          | каталог пересобран                                 | править ZIP, а не сгенерированные файлы                      |

---

## 10. Промпт для внешнего ИИ

Скопируйте этот блок в ИИ вместе с репозиторием:

```text
Ты работаешь в тестовом контуре Repair Wizards (Article Format 1.3).
Твоя задача — создать статью и проверить её.

Важно: в контуре нет UI-редактора, API создания статьи и доступной БД.
Создание выполняется только через ZIP:
article.json + media/ -> ZIP -> docs/**/*.zip -> npm run articles:build.

Сделай по шагам:
1. Создай docs/incoming/<slug>/article.json и docs/incoming/<slug>/media/.
2. Заполни format_version="1.3", title, summary, topic, cover, assets, blocks.
3. Все файлы из cover/assets/blocks положи в media/ и укажи относительные пути media/...
4. Собери стандартный ZIP: docs/incoming/<slug>.zip с article.json в корне и media/.
5. Проверь: unzip -t docs/incoming/<slug>.zip.
6. Запусти: npm run articles:build.
7. Проверь, что статья есть в public/articles/catalog.json и открывается на /articles/<id>.
8. Запусти: npm run test:articles:importer, npm test -- --watchAll=false --runInBand, npx tsc --noEmit.
9. Дай отчёт: slug, id, URL, список блоков, результаты команд, скриншоты/ошибки.

Не редактируй public/articles вручную.
Не пытайся писать в blog_post/blog_topic.
Не используй абсолютные пути и ../ в JSON.
Если чего-то не хватает в контуре — явно укажи ограничение, не имитируй успех.
```

---

## 11. Definition of Done

Статья считается созданной и протестированной, когда:

- [ ] ZIP лежит в `docs/` и проходит `unzip -t`;
- [ ] `npm run articles:build` завершился без ошибок;
- [ ] статья есть в `public/articles/catalog.json`;
- [ ] `/articles` показывает карточку;
- [ ] `/articles/<id>` рендерит все блоки;
- [ ] `technical_knowledge` не выводится как статья;
- [ ] мобильная ширина без горизонтальной прокрутки страницы;
- [ ] `npm run test:articles:importer` — passed;
- [ ] `npm test` — passed;
- [ ] `npx tsc --noEmit` — 0 ошибок;
- [ ] в отчёте указаны slug, id, URL и результаты проверок.

---

## 12. Ссылки

- [Формат статьи 1.3](repair-wizards-article-format-v1.3.md)
- [Хранение, импорт и рендеринг 1.3](repair-wizards-article-storage-import-rendering-v1.3.md)
- [Регрессионный набор 1.3](regression/v1.3/README.md)
- [Матрица проверок](regression/v1.3/COVERAGE_MATRIX.md)
- [Импортёр ZIP](../scripts/article-importer.mjs)
- [Сборка статического каталога](../scripts/build-articles.mjs)
- [ArticleRenderer](../src/app/components/Article/renderer/ArticleRenderer.jsx)
- [Конфигурация источника статей](../src/config/index.js)
