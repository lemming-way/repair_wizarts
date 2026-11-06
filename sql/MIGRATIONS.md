# Test database migrations

The repository provides a manually dispatched GitHub Actions workflow:
`.github/workflows/apply-test-db-migration.yml`.

## One-time GitHub configuration

Create a GitHub Actions environment named **test** and configure these environment secrets:

- `REPAIR_DB_HOST` — hostname of the isolated test MySQL server
- `REPAIR_DB_PORT` — MySQL port (normally 3306)
- `REPAIR_DB_NAME` — test database name
- `REPAIR_DB_USER` — dedicated migration account
- `REPAIR_DB_PASSWORD` — migration account password

Create this environment variable:

- `REPAIR_DB_ENVIRONMENT=test`

Use a dedicated account with only the privileges required for the approved migrations (for this migration: SELECT on metadata, CREATE, ALTER/REFERENCES as required by the server, and INSERT/SELECT on `schema_migrations`). Do not use production credentials. Configure environment protection/reviewers if available.

## Run

1. Open **Actions → Apply test database migration → Run workflow**.
2. Select `blog_comment`.
3. Check `confirm_test_database` only after verifying the environment points to the isolated test database.

The workflow has no push trigger and accepts no arbitrary SQL or file path. Migration names are allowlisted in `tests/backend/apply-migration.mjs`. The runner verifies the selected database identity, required parent tables and integer primary keys, and records a SHA-256 checksum in `schema_migrations`. Re-running an already applied migration with the same checksum is a no-op; a changed checksum is rejected.

## Safety notes

MySQL DDL is not generally transactional. The runner therefore applies one reviewed migration per run and verifies the resulting table. If a table exists without a matching ledger entry, the runner stops for manual schema reconciliation rather than silently adopting it.

The current allowlist contains only `blog_comment`. The unrelated `blog_article_publication.sql` migration is deliberately not included.

## Current status

The workflow and runner are committed, but no database migration has been run yet. The GitHub environment secrets and `REPAIR_DB_ENVIRONMENT=test` variable must be configured before the workflow can connect. The runner does not read or expose credentials in logs.
