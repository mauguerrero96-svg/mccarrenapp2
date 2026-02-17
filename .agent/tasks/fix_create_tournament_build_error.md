# Task: Fix Build Error and Refactor Create Tournament Page

## Issue
The application is failing to build due to a syntax error in `frontend/app/organizer/create-tournament/page.tsx`:
- `Parsing ecmascript source code failed`
- `Expected corresponding JSX closing tag for <div>`
- Dangling `</header>` and `</main>` tags without corresponding opening tags.

## Objective
1.  **Fix Syntax Errors**: Ensure proper HTML structure (Header/Main nesting).
2.  **Apply Design System**: Update the page to use the new "Premium Tennis" theme (Emerald/Slate palette) consistent with the rest of the app.

## Steps

1.  **Refactor `CreateTournamentPage` component**:
    - Replace `head` div with semantic `<header>`.
    - Wrap main content in semantic `<main>`.
    - Update CSS classes to usage `slate` and `emerald` instead of `gray` and `blue`.
    - Use common utility classes where possible.

2.  **Verify**:
    - Check if the build assumes successfully.
    - Verify the page loads in the browser.
