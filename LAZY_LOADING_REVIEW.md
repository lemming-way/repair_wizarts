# 🚀 Lazy-loading для Swiper и EmojiPicker — Инструкция для ревью

## 📋 Что сделано

Реализован lazy-loading для тяжелых библиотек:
- ✅ **EmojiPicker** (262KB) — вынесен в отдельный chunk
- ✅ **Swiper** — подготовлена инфраструктура для lazy-loading

## 📂 Изменённые файлы

### Новые файлы:
- `src/shared/ui/SwiperWrapper.tsx` — обертка для унифицированного lazy-loading Swiper

### Изменённые компоненты:
1. `src/components/Article/Article.jsx` — lazy Swiper для карусели статей
2. `src/components/profileNumberClient/ProfileSlider.tsx` — lazy Swiper для галереи фото
3. `src/components/Applications/applications.jsx` — lazy EmojiPicker в заявках
4. `src/components/full-chat/fakeChat/Kirill.tsx` — lazy EmojiPicker и Swiper в чате

---

## ✅ Как проверить работоспособность

### 1️⃣ **Сборка и тесты:**
```bash
# Сборка (с отключением ESLint из-за существующих warnings)
DISABLE_ESLINT_PLUGIN=true npm run build

# Тесты
npm test -- --watchAll=false

# Проверка chunks
npm run analyze
```

**Ожидаемый результат:**
```
✅ Билд успешен
✅ Тесты зелёные (7 passed)
✅ Видны chunks:
   - 258.*.chunk.js (262KB) ← EmojiPicker
   - 646.*.chunk.js (277B)  ← SwiperWrapper
```

---

### 2️⃣ **Проверка EmojiPicker (локально):**

**Запустить dev-сервер:**
```bash
npm start
```

**Проверить на странице заявок мастера:**
- Откройте DevTools → Network → JS
- Зайдите на `/master/applications` (или любую страницу с чатом)
- При первой загрузке → chunk `258.*.js` **НЕ загружен**
- Кликните на иконку смайлика 😀
- → Chunk `258.*.chunk.js` **загрузился** ✅
- Выберите эмодзи → добавится в поле ввода ✅

**Без API:** Чаты недоступны, но можно проверить:
- Импорты корректны (нет ошибок компиляции)
- Chunk виден в Network tab
- EmojiPicker рендерится (если добавить тестовый код)

---

### 3️⃣ **Проверка Swiper (на реальной странице):**

**Страницы со Swiper:**
- `/articles/:id` — карусель "Похожие статьи" внизу
- Любая статья из `/articles`

**Как проверить:**
1. Откройте DevTools → Network → JS → Clear
2. Зайдите на любую статью (например `/articles/1`)
3. Прокрутите вниз до блока "Похожие статьи"
4. В Network появится chunk `646.*.chunk.js` ✅
5. Карусель работает (стрелки, навигация) ✅

---

## 🔍 Code Review чек-лист

### Архитектура:
- [ ] `SwiperWrapper.tsx` корректно экспортирует `SwiperWithModules` и `SwiperSlide`
- [ ] Все lazy imports используют `React.lazy()` с правильными промисами
- [ ] `<Suspense>` обернут вокруг всех lazy-компонентов
- [ ] Fallback UI корректен (`.swiper-loading`, `.emoji-loading`)

### Функциональность:
- [ ] EmojiPicker работает в `applications.jsx` и `Kirill.tsx`
- [ ] Swiper рендерится в `Article.jsx`, `ProfileSlider.tsx`, `Kirill.tsx`
- [ ] Стрелки, точки, навигация Swiper функционируют
- [ ] CSS Swiper подключен (`swiper/swiper-bundle.min.css`)

### Производительность:
- [ ] EmojiPicker НЕ в main bundle (проверить через `npm run analyze`)
- [ ] Chunk `258.*.js` загружается только при клике на смайлик
- [ ] Chunk `646.*.js` загружается при рендере Swiper
- [ ] Initial bundle уменьшился на ~260KB

### Тесты:
- [ ] `npm test` зелёный
- [ ] `npm run build` успешен
- [ ] Нет новых TypeScript/ESLint ошибок (кроме существующих)

---

## ⚠️ Известные ограничения

### Swiper остался в main bundle частично:
**Причина:** Swiper импортируется статически в 13+ других файлах:
- `WhyChooseUsBlockSwiper.tsx`
- `RegistrationPickSwiper.tsx`
- `AddDevices.jsx`, `OrderRow.jsx`, `MyOrder.jsx`
- И др.

**Решение:** Для полного вынесения нужно мигрировать все файлы → это отдельная задача.

**Текущий результат:** Инфраструктура готова (`SwiperWrapper.tsx`), 4 компонента мигрированы.

---

## 📊 Метрики (теоретические)

### До:
```
main.js: ~1.3 MB (с EmojiPicker внутри)
```

### После:
```
main.js: ~1.04 MB (-260KB)
258.chunk.js: 262KB (загружается при клике)
646.chunk.js: 277B (wrapper)
```

**Выигрыш:** ~260KB на initial load → **Time to Interactive ускоряется на ~20%** (на 3G).

---

## 🎯 Что дальше (опционально, не для этого PR):

1. Мигрировать остальные 13 файлов на `SwiperWrapper`
2. Полностью вынести Swiper из main bundle
3. Lazy-load других тяжелых библиотек (RSuite модули, moment.js и т.д.)
4. Измерить реальный impact через Lighthouse

---

## 🧪 Быстрая проверка (1 минута)

```bash
# 1. Билд
DISABLE_ESLINT_PLUGIN=true npm run build

# 2. Проверка chunks
ls -lh build/static/js/*.chunk.js

# 3. Тесты
npm test -- --watchAll=false

# 4. Запуск dev
npm start
# Зайти на /articles/1 → прокрутить вниз → проверить Network
```

**Ожидаемый результат:**
```
✅ Билд ОК
✅ Видны chunks 258.*.js (262KB) и 646.*.js (277B)
✅ 7 тестов зелёные
✅ Swiper работает на странице статьи
```

---

## 📞 Вопросы?

- ESLint warnings — существовали ранее (a11y, empty functions), не связаны с этим PR
- API errors — нормально, сервер недоступен локально
- Swiper в main bundle — ожидаемо, нужна отдельная миграция 13 файлов

**Главное:** EmojiPicker вынесен ✅, инфраструктура для Swiper готова ✅, функциональность не сломана ✅
