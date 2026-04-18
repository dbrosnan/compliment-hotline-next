import type { Metadata, Viewport } from "next";
import { Monoton, Space_Grotesk, Fraunces, JetBrains_Mono } from "next/font/google";

import "@workspace/ui/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@workspace/ui/lib/utils";

const fontDisplay = Monoton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fontSans = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontSerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Compliment Hotline — Pick up. Say something nice.",
  description:
    "An interactive art piece. A wooden cart carries eight landline phones to disco festivals. Pick up a phone, hear a compliment from a stranger, then leave one for the next person.",
  metadataBase: new URL("https://complimenthotline.org"),
  openGraph: {
    title: "Compliment Hotline",
    description: "Pick up. Say something nice. A disco-era art piece for strangers who pass each other kindness.",
    images: ["/hero-poster.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compliment Hotline",
    description: "Pick up. Say something nice.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0820",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontDisplay.variable,
        fontSans.variable,
        fontSerif.variable,
        fontMono.variable,
      )}
    >
      <body>
        <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
      </body>
    </html>
  );
}
