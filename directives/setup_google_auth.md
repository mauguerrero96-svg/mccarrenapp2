# Setup Google Authentication (Supabase)

This project uses **Supabase Auth**. To enable Google Login, you need to configure Google Cloud Platform and your Supabase instance.

## 1. Google Cloud Platform Setup

1.  Go to **[Google Cloud Console](https://console.cloud.google.com/apis/dashboard)**.
2.  Create a new project (e.g., "Mccarren Tournament").
3.  Go to **APIs & Services > OAuth consent screen**.
    *   Select **External**.
    *   Fill in App Name, User Support Email, and Developer Email.
    *   Click Save & Continue (skip scopes for now).
4.  Go to **Credentials**.
    *   Click **+ Create Credentials > OAuth client ID**.
    *   Application type: **Web application**.
    *   **Name**: Supabase Auth
5.  **Authorized JavaScript Origins**:
    *   `http://localhost:3000`
    *   `http://86.48.22.47:9000` (Your Supabase URL)
6.  **Authorized Redirect URIs**:
    *   `http://86.48.22.47:9000/auth/v1/callback`
    *   *Note: Since you are using an IP address, Google might warn you or require a domain name for creating production credentials. For testing, localhost works.*
7.  Click **Create**.
8.  **Copy** the `Client ID` and `Client Secret`.

## 2. Supabase Setup

1.  Go to your Supabase Dashboard (or config file if self-hosted).
2.  Navigate to **Authentication > Providers > Google**.
3.  **Enable** Google Provider.
4.  Paste the **Client ID** and **Client Secret**.
5.  Click **Save**.

## 3. Code Implementation

The frontend code uses `supabase.auth.signInWithOAuth`.

```typescript
const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};
```

*Note: Ensure you have an `/auth/callback` route in your Next.js app to handle the redirect session exchange.*
