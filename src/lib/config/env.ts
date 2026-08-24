function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get paddleApiKey() {
    return required("PADDLE_API_KEY");
  },
  get paddleWebhookSecret() {
    return required("PADDLE_WEBHOOK_SECRET");
  },
  get paddleEnv(): "sandbox" | "production" {
    return (process.env.PADDLE_ENV as "sandbox" | "production") ?? "sandbox";
  },
  get paddleClientToken() {
    return required("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");
  },
  get cronSecret() {
    return required("CRON_SECRET");
  },
  get siteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  },
  get adminUsername() {
    return process.env.ADMIN_USERNAME ?? "admin";
  },
  get adminPassword() {
    return process.env.ADMIN_PASSWORD ?? "Maruf789!";
  },
  get adminSessionSecret() {
    return process.env.ADMIN_SESSION_SECRET ?? "claimone-admin-session-default-secret";
  },
};
