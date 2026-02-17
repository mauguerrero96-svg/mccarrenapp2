# Manage Database

**Objective**: Apply schema changes, run SQL migrations, and manage database state.

## Tools (Execution Layer)

-   `execution/run_sql_check.js`: Executes specific SQL files (currently hardcoded or modify).
-   `execution/sql/*.sql`: Collection of SQL scripts for setting up the app.
    -   `setup_mccarren_app.sql`: Main setup script.
    -   `setup_rls_and_functions.sql`: Applies RLS policies and functions.
    -   `update_rbac.sql`: Updates Role-Based Access Control if needed.

## Workflow

### 1. Execute SQL
To apply changes, you typically copy the content of the `.sql` file and run it in the Supabase SQL Editor manually, as direct SQL execution requires specific setup not available by default in the client library without RPC.

However, if `run_sql_check.js` is configured with a valid RPC function (`exec_sql`), you can run:
```bash
node execution/run_sql_check.js
```

### 2. Inspect Schema
Run `node execution/inspect_schema.js` to verify if columns exist.
