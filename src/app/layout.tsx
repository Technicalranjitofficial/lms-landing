import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "CGS — CG School of Technology",
    template: "%s | CGS",
  },
  description:
    "CG School of Technology — Master software development, DSA, Full Stack, AI, and crack placements with India's most structured tech education platform.",
  keywords: [
    "CGS",
    "CG School of Technology",
    "online coding courses India",
    "DSA course",
    "full stack development course",
    "placement preparation",
    "learn programming online",
    "coding bootcamp India",
    "web development course",
    "Java DSA course",
    "MERN stack course",
  ],
  openGraph: {
    type: "website",
    siteName: "CGS — CG School of Technology",
    title: "CGS — CG School of Technology",
    description:
      "Master software development, DSA, Full Stack, and placement preparation with India's most structured tech education platform.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
