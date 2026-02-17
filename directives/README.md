# Directives

This directory contains Standard Operating Procedures (SOPs) for the agent to follow.
The agent operates in a 3-layer architecture:

1.  **Directive (This layer)**: Markdown files defining "What to do".
2.  **Orchestration (The Agent)**: The AI agent reads these directives and executes the necessary tools.
3.  **Execution (`../execution/`)**: Deterministic scripts (JS/SQL) that perform the actual work.

## Available Directives

-   `setup_local_env.md`: How to configure the local environment.
-   `manage_users.md`: How to create and manage users (Admin, Players).
-   `manage_database.md`: How to apply schema changes and run SQL.
-   `manage_tournaments.md`: How to create test tournaments and generate draws.
