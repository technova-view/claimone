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
  get cryptoWalletAddress() {
    return required("CRYPTO_WALLET_ADDRESS");
  },
  // TronGrid works unauthenticated at low volume; set this to raise the rate
  // limit once real traffic shows up.
  get tronGridApiKey() {
    return process.env.TRONGRID_API_KEY;
  },
  // Optional: unset means NOWPayments is skipped and checkout falls straight
  // to the self-hosted TRC20 flow above.
  get nowPaymentsApiKey() {
    return process.env.NOWPAYMENTS_API_KEY;
  },
  get nowPaymentsIpnSecret() {
    return process.env.NOWPAYMENTS_IPN_SECRET;
  },
  // Sandbox and production are entirely separate NOWPayments accounts with
  // their own API key/IPN secret — swap NOWPAYMENTS_API_KEY/IPN_SECRET to
  // match whichever this is set to.
  get nowPaymentsEnv(): "sandbox" | "production" {
    return (process.env.NOWPAYMENTS_ENV as "sandbox" | "production") ?? "sandbox";
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
