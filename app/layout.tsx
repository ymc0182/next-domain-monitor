import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "域名状态监控",
  description: "监控域名到期时间，即使发送邮件提醒",
  icons: {
    icon: "favicon.svg",
  },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
            lang="zh"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
		    <body suppressHydrationWarning className="min-h-full flex flex-col bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">{children}</body>
		</html>
	);
}
