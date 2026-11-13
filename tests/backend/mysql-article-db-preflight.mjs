#!/usr/bin/env node
// Re-run production read-only schema inspection for the article importer.
import mysql from 'mysql2/promise';

const required = ['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD'];
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  throw new Error('Missing required GitHub Actions secrets: ' + missing.join(', '));
}

const config = {
  host: process.env.MYSQL_HOST.trim(),
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectTimeout: 12000,
  multipleStatements: false,
  enableKeepAlive: true,
  ...(process.env.MYSQL_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}),
};

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error('MYSQL_PORT must be a valid TCP port.');
}

let connection;
try {
  connection = await mysql.createConnection(config);
  const [[identity]] = await connection.query(
    'SELECT DATABASE() AS database_name, CURRENT_USER() AS authenticated_as, VERSION() AS server_version'
  );
  console.log('MYSQL_CONNECT_OK ' + JSON.stringify({
    database: identity.database_name,
    authenticated_as: identity.authenticated_as,
    server_version: identity.server_version,
  }));

  const [tables] = await connection.execute(
    'SELECT TABLE_NAME AS table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (?, ?) ORDER BY TABLE_NAME',
    ['blog_post', 'blog_comment']
  );
  console.log('BLOG_TABLES ' + JSON.stringify(tables));

  for (const table of ['blog_post', 'blog_comment']) {
    const [exists] = await connection.execute(
      'SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
      [table]
    );
    if (Number(exists[0].n) === 0) {
      console.log('TABLE_MISSING ' + table);
      continue;
    }
    const [columns] = await connection.execute(
      'SELECT COLUMN_NAME AS name, COLUMN_TYPE AS type, IS_NULLABLE AS nullable, COLUMN_DEFAULT AS default_value, EXTRA AS extra FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION',
      [table]
    );
    console.log('TABLE_COLUMNS ' + table + ' ' + JSON.stringify(columns));
    if (table === 'blog_post') {
      const [statusColumns] = await connection.execute(
        'SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME IN (?, ?, ?, ?)',
        [table, 'status', 'blog_status', 'is_published', 'published']
      );
      const candidates = statusColumns.map((row) => row.name);
      for (const column of candidates) {
        const quoted = '`' + column.replace(/`/g, '``') + '`';
        const [values] = await connection.query(
          'SELECT ' + quoted + ' AS status_value, COUNT(*) AS row_count FROM blog_post GROUP BY ' + quoted + ' ORDER BY row_count DESC LIMIT 20'
        );
        console.log('PUBLISH_VALUES ' + column + ' ' + JSON.stringify(values));
      }
      const [[count]] = await connection.query('SELECT COUNT(*) AS total_rows FROM blog_post');
      console.log('BLOG_POST_COUNT ' + count.total_rows);
    }
  }


  const [relatedTables] = await connection.execute(
    "SELECT TABLE_NAME AS table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND (TABLE_NAME LIKE '%topic%' OR TABLE_NAME LIKE '%user%') ORDER BY TABLE_NAME"
  );
  console.log('RELATED_TABLES ' + JSON.stringify(relatedTables));
  for (const { table_name } of relatedTables) {
    const [columns] = await connection.execute(
      'SELECT COLUMN_NAME AS name, COLUMN_TYPE AS type, IS_NULLABLE AS nullable, COLUMN_DEFAULT AS default_value, EXTRA AS extra FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION',
      [table_name]
    );
    console.log('RELATED_COLUMNS ' + table_name + ' ' + JSON.stringify(columns));
    if (/topic/i.test(table_name)) {
      const safeTable = '`' + table_name.replace(/`/g, '``') + '`';
      const [rows] = await connection.query('SELECT * FROM ' + safeTable + ' LIMIT 100');
      console.log('TOPIC_SAMPLE ' + table_name + ' ' + JSON.stringify(rows));
    }
  }
  if (identity.database_name !== 'aristotel_tutor') {
    throw new Error('Refusing article-7 inspection: expected aristotel_tutor test database.');
  }
  const [articleColumns] = await connection.execute(
    'SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
    ['blog_post']
  );
  const columnNames = new Set(articleColumns.map((row) => row.name));
  for (const requiredColumn of ['id_blog_post', 'name', 'value']) {
    if (!columnNames.has(requiredColumn)) throw new Error('Expected blog_post column missing: ' + requiredColumn);
  }
  const [articleRows] = await connection.execute(
    'SELECT id_blog_post, name, value FROM blog_post WHERE id_blog_post = ? LIMIT 1',
    [7]
  );
  if (articleRows.length !== 1) throw new Error('Expected exactly one blog_post row with id_blog_post=7.');
  console.log('ARTICLE_7_SOURCE ' + JSON.stringify({
    id_blog_post: articleRows[0].id_blog_post,
    name: articleRows[0].name,
    value: articleRows[0].value,
  }));
  console.log('PREFLIGHT_READ_ONLY_COMPLETE; no rows were inserted, updated, or deleted.');
} catch (error) {
  const safeMessage = error?.code || (error?.message || error?.name || 'MYSQL_ERROR').replace(/[\r\n]+/g, ' ').slice(0, 240);
  console.error('MYSQL_PREFLIGHT_FAILED ' + safeMessage);
  if (error?.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('Check MYSQL_USER/MYSQL_PASSWORD and grants for the runner host.');
  } else if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
    console.error('Check MYSQL_HOST/MYSQL_PORT, network ingress, and whether a runner-accessible route or SSH tunnel is required.');
  } else if (error?.code === 'ER_BAD_DB_ERROR') {
    console.error('Check MYSQL_DATABASE.');
  }
  process.exitCode = 1;
} finally {
  if (connection) await connection.end().catch(() => {});
}
