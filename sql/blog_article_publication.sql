-- Публикация статей: статус, дата публикации и JSON-контент.
-- Скрипт идемпотентен: повторный запуск не добавляет поля/индексы повторно.
-- Применять к БД, в которой используется таблица `blog_post`.
--
-- Если в blog_post уже есть числовой статус (id_blog_status/status_id/id_status),
-- без этой миграции публичные запросы возвращают 500 (fail closed), чтобы не
-- отдавать черновики. После миграции используется строковый status='published'.
-- Альтернатива: задать $blog_published_status_id в script_templates/repair_api.php.

SET @schema_name = DATABASE();

-- status
SET @has_status = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'blog_post'
    AND COLUMN_NAME = 'status'
);
SET @sql = IF(
  @has_status = 0,
  'ALTER TABLE `blog_post` ADD COLUMN `status` ENUM(''draft'',''pending'',''published'',''revision'',''rejected'',''archived'') NOT NULL DEFAULT ''published''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- published_at
SET @has_published_at = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'blog_post'
    AND COLUMN_NAME = 'published_at'
);
SET @sql = IF(
  @has_published_at = 0,
  'ALTER TABLE `blog_post` ADD COLUMN `published_at` DATETIME NULL DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- content_json / content_format / content_version
SET @has_content_json = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'blog_post'
    AND COLUMN_NAME = 'content_json'
);
SET @sql = IF(
  @has_content_json = 0,
  'ALTER TABLE `blog_post` ADD COLUMN `content_json` LONGTEXT NULL DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_content_format = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'blog_post'
    AND COLUMN_NAME = 'content_format'
);
SET @sql = IF(
  @has_content_format = 0,
  'ALTER TABLE `blog_post` ADD COLUMN `content_format` VARCHAR(32) NULL DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_content_version = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'blog_post'
    AND COLUMN_NAME = 'content_version'
);
SET @sql = IF(
  @has_content_version = 0,
  'ALTER TABLE `blog_post` ADD COLUMN `content_version` VARCHAR(16) NULL DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Индекс для публичного каталога.
SET @has_publication_index = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'blog_post'
    AND INDEX_NAME = 'idx_blog_post_publication'
);
SET @sql = IF(
  @has_publication_index = 0,
  'ALTER TABLE `blog_post` ADD INDEX `idx_blog_post_publication` (`status`, `published_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Существующие статьи считаем опубликованными, датой публикации — дату создания.
UPDATE `blog_post`
SET `published_at` = `create_datetime`
WHERE `status` = 'published'
  AND `published_at` IS NULL
  AND `create_datetime` IS NOT NULL;

-- JSON-контент, перенесённый из старого поля value, помечаем форматом 1.3.
UPDATE `blog_post`
SET `content_format` = 'json',
    `content_version` = COALESCE(`content_version`, '1.3')
WHERE `content_json` IS NOT NULL
  AND `content_format` IS NULL;
