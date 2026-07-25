import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
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
    default: "CodePath — Learn to Code. Get Hired.",
    template: "%s | CodePath",
  },
  description:
    "Master DSA, Full Stack Development, and placement preparation with India's most structured coding curriculum. Live classes, recorded lectures, 1-on-1 doubt support.",
  keywords: [
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
    siteName: "CodePath",
    title: "CodePath — Learn to Code. Get Hired.",
    description:
      "Master DSA, Full Stack Development, and placement preparation with India's most structured coding curriculum.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
