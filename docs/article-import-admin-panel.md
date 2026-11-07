# Temporary Article ZIP Import Panel

The temporary administrator page is available at /admin/article-import after the frontend and API changes are deployed.

## Workflow

1. Sign in with an account whose backend id_role is exactly 4.
2. Select a local folder containing one or more article ZIP archives.
3. Choose one of the import modes:
   - upsert — insert a new article or replace the content of an article with the same topic and title;
   - insert_only — skip an article when the same topic/title already exists;
   - update_only — skip an article when no same topic/title exists.
4. Run validation. Every archive is checked independently and a preview is shown with the existing ArticleRenderer.
5. Confirm import. Imported records are published immediately.

The browser stores only the selected import mode in localStorage. ZIP contents and preview URLs are not persisted there.

## API deployment requirements

Deploy both files into the same directory on the PHP API server:

- script_templates/repair_api.php
- script_templates/blog_import_actions.php

The second file is loaded by repair_api.php using require_once __DIR__. Deploying only the main API template will make the API fail at startup.

The API server must have:

- PHP ZipArchive enabled;
- upload_max_filesize and post_max_size configured above 100 MB (allow additional multipart overhead);
- a writable temporary directory;
- an article media directory writable by the PHP process.

Recommended environment variables:

- BLOG_UPLOAD_ROOT — absolute filesystem path for article media, e.g. /var/www/site/uploads/blog;
- BLOG_UPLOAD_BASE_URL — public root-relative URL for that directory, e.g. /uploads/blog.

If BLOG_UPLOAD_ROOT is omitted, the helper falls back to DOCUMENT_ROOT/uploads/blog. The default public URL is /uploads/blog.

## Database prerequisite

The importer refuses to write unless blog_post has a supported publication-status column that can represent a draft. It supports:

- status or blog_status with a string/enum value draft;
- is_published or published with an integer/boolean value 0.

The repository contains sql/blog_article_publication.sql, but the migration is not run by this feature. Apply and verify the migration in the intended database separately before enabling import. The importer never assumes a numeric status ID.

The selected article topic must already exist in blog_topic with an exact name match. The idempotency key is (id_blog_topic, blog_post.name).

## Temporary storage and cleanup

Validated archives are extracted into a private temporary directory with a random 192-bit token, bound to the authenticated user and expiring after 30 minutes. Expired temporary sessions are removed opportunistically when another archive is validated. Media files are copied to a unique per-article version directory. Re-importing an article creates a new media version so the previous content remains intact if an import fails.

The temporary panel does not publish articles, alter publication workflow settings, or run SQL supplied by the browser.

## Current validation boundary

The server validates ZIP paths, size limits, archive entry count, registered assets, byte sizes, all twelve display-block types, supported YouTube URLs, GLB v2 headers, unsafe SVG content, and media references in technical_knowledge. The present temporary helper checks the top-level shape of the technical-knowledge collections; a complete cross-entity graph validator and deep glTF dependency validator remain separate hardening work. Do not treat a successful import validation as an independent technical review of diagnostic correctness.
