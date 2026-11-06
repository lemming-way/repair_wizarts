<?php
/*
 * Temporary, non-destructive migration runner for blog_comment.
 *
 * Actions:
 *   inspect — read-only preflight.
 *   create  — creates blog_comment once; requires confirm=CREATE_blog_comment.
 *
 * No DROP/ALTER/INSERT/UPDATE/DELETE actions are exposed.
 */

$out = call_user_func(function() {
  $fail = function($code, $message) {
    json_exit((string)$code, 'error', $message);
  };

  try {
    if (!defined('UID') || !isset($_SESSION[UID]) || !is_numeric($_SESSION[UID]) || (int)$_SESSION[UID] <= 0) {
      $fail(401, 'Authenticated administrator session required.');
    }
    $role = isset($_SESSION['id_role']) ? (int)$_SESSION['id_role'] : 0;
    if ($role !== 1) {
      $fail(403, 'Administrator role required.');
    }

    if (!isset($_REQUEST['s_t_data'])) $fail(400, 'No data.');
    $input = json_decode($_REQUEST['s_t_data'], true);
    if (!is_array($input) || json_last_error() !== JSON_ERROR_NONE) $fail(400, 'Bad JSON.');
    $action = isset($input['action']) ? (string)$input['action'] : '';
    if (!in_array($action, ['inspect', 'create'], true)) $fail(400, 'Unsupported action.');

    $one = function($sql) {
      $result = @query($sql);
      if (!$result || $result === true) {
        $message = function_exists('error_db') ? error_db() : 'MySQL query failed';
        throw new Exception($message ?: 'MySQL query failed', 500);
      }
      $row = fetch_assoc($result);
      return $row ?: null;
    };

    $all = function($sql) {
      $result = @query($sql);
      if (!$result || $result === true) {
        $message = function_exists('error_db') ? error_db() : 'MySQL query failed';
        throw new Exception($message ?: 'MySQL query failed', 500);
      }
      $rows = [];
      while ($row = fetch_assoc($result)) $rows[] = $row;
      return $rows;
    };

    $context = $one('SELECT DATABASE() AS database_name, @@hostname AS server_host, VERSION() AS mysql_version');
    if (!$context || empty($context['database_name'])) throw new Exception('Cannot determine current database.', 500);

    $table = function($name) use ($one) {
      return $one(
        'SELECT TABLE_NAME, ENGINE, TABLE_COLLATION ' .
        'FROM information_schema.TABLES ' .
        'WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=' . "'" . addslashes($name) . "'"
      );
    };

    $column = function($tableName, $columnName) use ($one) {
      return $one(
        'SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA ' .
        'FROM information_schema.COLUMNS ' .
        'WHERE TABLE_SCHEMA=DATABASE() ' .
        'AND TABLE_NAME=' . "'" . addslashes($tableName) . "' " .
        'AND COLUMN_NAME=' . "'" . addslashes($columnName) . "'"
      );
    };

    $fkRows = function() use ($all) {
      return $all(
        'SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME ' .
        'FROM information_schema.KEY_COLUMN_USAGE ' .
        'WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=\'blog_comment\' ' .
        'AND REFERENCED_TABLE_NAME IS NOT NULL ORDER BY CONSTRAINT_NAME'
      );
    };

    $blogPost = $table('blog_post');
    $users = $table('users');
    $comment = $table('blog_comment');

    $preflight = [
      'database' => $context['database_name'],
      'server' => $context['server_host'],
      'mysql_version' => $context['mysql_version'],
      'blog_post_exists' => (bool)$blogPost,
      'users_exists' => (bool)$users,
      'blog_comment_exists' => (bool)$comment,
      'ready' => false,
      'problems' => []
    ];

    if (!$blogPost) $preflight['problems'][] = 'Required table blog_post is missing.';
    if (!$users) $preflight['problems'][] = 'Required table users is missing.';
    if ($comment) $preflight['problems'][] = 'Table blog_comment already exists; refusing to adopt or overwrite it.';

    if ($blogPost) {
      $pk = $column('blog_post', 'id_blog_post');
      if (!$pk || strtolower($pk['COLUMN_TYPE']) !== 'int' || $pk['COLUMN_KEY'] !== 'PRI') {
        $preflight['problems'][] = 'blog_post.id_blog_post must be a signed INT primary key.';
      }
      if (strtolower((string)$blogPost['ENGINE']) !== 'innodb') {
        $preflight['problems'][] = 'blog_post must use InnoDB.';
      }
    }

    if ($users) {
      $pk = $column('users', 'id_user');
      if (!$pk || strtolower($pk['COLUMN_TYPE']) !== 'int' || $pk['COLUMN_KEY'] !== 'PRI') {
        $preflight['problems'][] = 'users.id_user must be a signed INT primary key.';
      }
      if (strtolower((string)$users['ENGINE']) !== 'innodb') {
        $preflight['problems'][] = 'users must use InnoDB.';
      }
    }

    $preflight['ready'] = count($preflight['problems']) === 0;

    if ($action === 'inspect') {
      return ['action' => 'inspect', 'preflight' => $preflight];
    }

    if (!isset($input['confirm']) || $input['confirm'] !== 'CREATE_blog_comment') {
      $fail(400, 'Explicit confirmation required: confirm=CREATE_blog_comment.');
    }
    if (!$preflight['ready']) {
      $fail(409, 'Preflight failed; no schema changes were made: ' . implode(' ', $preflight['problems']));
    }

    $ddl = "CREATE TABLE `blog_comment` (
  `id_blog_comment` int NOT NULL AUTO_INCREMENT,
  `id_blog_post` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `id_user` int NOT NULL,
  `value` text NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `create_datetime` datetime NOT NULL,
  `last_edit_datetime` datetime DEFAULT NULL,
  `last_edit_user` int DEFAULT NULL,
  PRIMARY KEY (`id_blog_comment`),
  KEY `idx_comment_post_parent` (`id_blog_post`,`parent_id`,`id_blog_comment`),
  KEY `idx_comment_parent` (`parent_id`,`id_blog_comment`),
  KEY `idx_comment_user` (`id_user`),
  CONSTRAINT `blog_comment_fk_1` FOREIGN KEY (`id_blog_post`) REFERENCES `blog_post` (`id_blog_post`),
  CONSTRAINT `blog_comment_fk_2` FOREIGN KEY (`parent_id`) REFERENCES `blog_comment` (`id_blog_comment`),
  CONSTRAINT `blog_comment_fk_3` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`),
  CONSTRAINT `blog_comment_fk_4` FOREIGN KEY (`last_edit_user`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $created = @query($ddl);
    if (!$created) {
      $message = function_exists('error_db') ? error_db() : 'CREATE TABLE failed';
      throw new Exception($message ?: 'CREATE TABLE failed', 500);
    }

    $createdTable = $table('blog_comment');
    if (!$createdTable || strtolower((string)$createdTable['ENGINE']) !== 'innodb') {
      throw new Exception('CREATE TABLE returned success, but blog_comment verification failed.', 500);
    }

    $expectedColumns = [
      'id_blog_comment' => 'int',
      'id_blog_post' => 'int',
      'parent_id' => 'int',
      'id_user' => 'int',
      'value' => 'text',
      'deleted' => 'tinyint(1)',
      'create_datetime' => 'datetime',
      'last_edit_datetime' => 'datetime',
      'last_edit_user' => 'int'
    ];
    $actualColumns = $all(
      'SELECT COLUMN_NAME, COLUMN_TYPE FROM information_schema.COLUMNS ' .
      'WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=\'blog_comment\''
    );
    $actualMap = [];
    foreach ($actualColumns as $item) $actualMap[$item['COLUMN_NAME']] = strtolower($item['COLUMN_TYPE']);
    foreach ($expectedColumns as $name => $type) {
      if (!isset($actualMap[$name]) || $actualMap[$name] !== $type) {
        throw new Exception('Post-create verification failed for column ' . $name . '.', 500);
      }
    }

    $foreignKeys = $fkRows();
    $expectedForeignKeys = [
      'blog_comment_fk_1' => ['id_blog_post', 'blog_post', 'id_blog_post'],
      'blog_comment_fk_2' => ['parent_id', 'blog_comment', 'id_blog_comment'],
      'blog_comment_fk_3' => ['id_user', 'users', 'id_user'],
      'blog_comment_fk_4' => ['last_edit_user', 'users', 'id_user']
    ];
    $actualForeignKeys = [];
    foreach ($foreignKeys as $fk) {
      $actualForeignKeys[$fk['CONSTRAINT_NAME']] = [
        $fk['COLUMN_NAME'], $fk['REFERENCED_TABLE_NAME'], $fk['REFERENCED_COLUMN_NAME']
      ];
    }
    foreach ($expectedForeignKeys as $name => $expected) {
      if (!isset($actualForeignKeys[$name]) || $actualForeignKeys[$name] !== $expected) {
        throw new Exception('Post-create verification failed for foreign key ' . $name . '.', 500);
      }
    }

    return [
      'action' => 'create',
      'status' => 'created_and_verified',
      'database' => $context['database_name'],
      'server' => $context['server_host'],
      'table' => 'blog_comment',
      'columns_verified' => count($expectedColumns),
      'foreign_keys_verified' => count($expectedForeignKeys),
      'engine' => 'InnoDB'
    ];
  }
  catch (Exception $e) {
    $code = (int)$e->getCode();
    if ($code < 400 || $code > 599) $code = 500;
    $fail($code, $e->getMessage());
  }
});
