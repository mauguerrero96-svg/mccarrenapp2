# Manage Users

**Objective**: Create, verify, or inspect user accounts in the Supabase instance.

## Tools (Execution Layer)

The following scripts are available in `execution/`:

-   `create-admin-user.js`: Creates an admin user with specific credentials. Auto-confirms email if possible.
-   `create_manual_user.js`: Manually creates a user with arguments `email` `password` `fullname`. Bypasses email confirmation.
-   `check-user-status.js`: Verifies if a specific user exists and prints their metadata.
-   `create-test-players.js`: Batch creates 32 test players and registers them to a tournament.

## Workflow

### 1. Check User Status
Before creating a user, check if they exist.
```bash
node execution/check-user-status.js
```

### 2. Create Admin User
To create the standard admin user (`maoumx@gmail.com`):
```bash
node execution/create-admin-user.js
```
*Note: This script attempts to auto-confirm. If it fails, use the manual script.*

### 3. Manually Create Verified User
To create a specific user and force verification:
```bash
node execution/create_manual_user.js <email> <password> <fullname>
```
Example:
```bash
node execution/create_manual_user.js "test@example.com" "Password123!" "Test User"
```

### 4. Create Batch Test Players
To populate the database with test data for tournaments:
```bash
node execution/create-test-players.js
```
*This creates 32 players and registers them to a new tournament.*
