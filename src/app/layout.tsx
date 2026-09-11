import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { AuthProvider } from "@/components/providers/AuthProvider";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Peeny – AI Video for African Creators",
  description:
    "Create, share and earn from AI videos & animations. Built for African creators.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Peeny",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D0B10",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="h-full bg-background text-foreground font-sans">
        <AuthProvider>
          <div className="flex h-full min-h-[100dvh]">
            <DesktopSidebar />
            <div className="flex-1 min-w-0 relative flex flex-col">
              <main className="flex-1 relative">{children}</main>
              <BottomNav />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
