# Regression Pack — Article Format 1.3

Три статьи для проверки импорта ZIP, валидации, Preview, сохранения JSON и ArticleRenderer.

## Состав

| Статья | Домен | Блоки | Медиа |
|---|---|---:|---:|
| smartphone | смартфоны | 11 | 2 SVG + 1 GLB |
| electric_kettle | бытовая техника | 11 | 2 SVG |
| toilet_cistern | сантехника | 10 | 2 SVG |

SVG-файлы — авторские схематические иллюстрации, не фотографии реальных изделий. GLB — упрощённая демонстрационная геометрия корпуса смартфона, не модель конкретного устройства.

## Покрытие блоков

| Тип | Smartphone | Kettle | Cistern |
|---|:---:|:---:|:---:|
| heading | ✓ | ✓ | ✓ |
| paragraph | ✓ | ✓ | ✓ |
| image | ✓ | ✓ | ✓ |
| gallery | — | ✓ | ✓ |
| video | ✓* | ✓* | — |
| list | ✓ | ✓ | ✓ |
| quote | ✓ | ✓ | ✓ |
| callout | ✓ | ✓ | ✓ |
| steps | ✓ | ✓ | ✓ |
| table | ✓ | ✓ | ✓ |
| code | ✓ | ✓ | ✓ |
| model_3d | ✓ | — | — |

*Видео — тестовая ссылка Big Buck Bunny для проверки самого блока video, не обучающий материал по ремонту.

## Покрытие technical_knowledge

Во всех статьях присутствуют objects, symptoms, causes, diagnostics, operations, tools, materials, safety. Проверяются parent_object_id, object_ids, symptom_ids, diagnostic_refs, переходы между шагами, terminal, safety_refs и media_refs.

## Проверки

1. ZIP имеет article.json в корне и каталог media/.
2. Проверить все пути cover, blocks и technical_knowledge.media_refs по assets.
3. Проверить фактические размеры файлов.
4. Проверить JSON round-trip: технические данные не теряются при сохранении и выдаче API.
5. Preview и опубликованная статья должны использовать один ArticleRenderer.
6. technical_knowledge не должен выводиться как обычное содержимое.
7. Ошибка загрузки GLB не должна блокировать текст статьи.
8. Проверить gallery, steps, table и code на мобильной ширине.

## Ограничения

Содержание технических сущностей обобщённое и не является диагнозом конкретной модели. Иллюстрации схематические. Тестовые материалы не следует публиковать как проверенные ремонтные инструкции.
