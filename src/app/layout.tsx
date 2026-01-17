import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
    title: "Medlogy | Health Intelligence Platform",
    description: "Advanced public health data synthesis and analysis.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
            <body className="antialiased">
                <AppShell>
                    {children}
                </AppShell>
            </body>
        </html>
    );
}
