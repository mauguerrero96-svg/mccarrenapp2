# Manage Environment

**Objective**: Ensure the local environment is correctly configured for development.

## Directives

1.  **Check `.env.local`**: Ensure `/frontend/.env.local` exists and contains valid Supabase keys.
2.  **Verify Supabase Connection**: Run `node execution/test-supabase-connection.js` to confirm connectivity.
3.  **Inspect Schema**: Use `node execution/inspect_schema.js` if you suspect schema drift.
4.  **Install Dependencies**: Run `npm install` in root and `frontend/` as needed.

## Tools (Execution Layer)

-   `execution/test-supabase-connection.js`: Tests basic connection to Supabase.
-   `execution/inspect_schema.js`: Probes specific tables for columns.
-   `execution/probe.js`: General probe script.
