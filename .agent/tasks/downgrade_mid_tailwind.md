# Task: Downgrade to Tailwind CSS v3

## Issue
The project has `tailwindcss` v4 installed but the configuration (`postcss.config.js`, `globals.css`, `tailwind.config.ts`) is written for v3. This mismatch causes build errors.

## Objective
Downgrade `tailwindcss` to version 3 to align with the codebase configuration.

## Steps
1.  **Install Tailwind CSS v3**:
    - Run `npm install tailwindcss@3` to replace the v4 package.

2.  **Restart Server**:
    - Kill the current server process.
    - Start `npm run dev`.

3.  **Verify**:
    - Check if the build succeeds.
    - Confirm styles are applied.
