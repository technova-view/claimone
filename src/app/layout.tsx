import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppModalsProvider } from "@/components/app-modals/app-modals-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { PresenceHeartbeat } from "@/components/stats/presence-heartbeat";
import { env } from "@/lib/config/env";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/config/site-metadata";

const SITE_DESCRIPTION = "Public product rankings, determined by your bid.";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  // Every page below sets its own full "X · claimone.lol" title string
  // rather than relying on a title.template — a template here would double
  // up that suffix on every one of them.
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  verification: {
    google: "bNTcfowhuEJ7W-a8KA9sGINPzu8iGdDeqQKnhrfKIh8",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppModalsProvider>
            <PresenceHeartbeat />
            {children}
            <SiteFooter />
          </AppModalsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
