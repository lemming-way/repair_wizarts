# Backend smoke tests

## Read-only tutor API check

The first test verifies that GitHub Actions can reach the tutor backend and that
the supplied credentials can read the private `script_templates` field.

It uses Node.js built-in `fetch`; no npm dependencies are required.

### GitHub repository secrets

Add these three secrets in **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `REPAIR_API_BASE` | `https://ibronevik.itest24.com/taxi_dev2/c/tutor` |
| `REPAIR_API_TOKEN` | Current test-account API token |
| `REPAIR_API_U_HASH` | Matching user hash |

Do not commit credentials to the repository or put them in workflow inputs.

### Run

1. Add the three secrets above before merging.
2. Merge the PR into `docs/repair-wizards-article-format-v1.3`. The push to that
   branch automatically starts the read-only check.
3. To use **Run workflow** manually, the workflow file must also be present on
   the repository's default branch. Until then, use the automatic branch-push
   trigger.

The script sends a POST request to `{REPAIR_API_BASE}/api/v1/data` with the
form-urlencoded `data` field containing:

```json
{"private":1,"fields":"script_templates"}
```

The token and user hash are sent as separate form fields. The response body is
not printed because it may contain private template data.

### Safety boundary

This workflow is intentionally read-only. It does not:

- create or update rows in `script_templates`;
- execute a PHP script template;
- create, edit, or delete articles or comments;
- print tokens, hashes, or full API responses.

A successful run confirms outbound network access from the GitHub Actions
runner and successful retrieval of `script_templates` with the configured
credentials. It does not yet validate the PHP template's behavior.

### Next stage

After the read-only request is confirmed against the real backend, add separate
tests using an isolated test article and explicit cleanup. Template upload and
execution must remain disabled until the current server record, permissions,
and backup/restore procedure have been verified.
