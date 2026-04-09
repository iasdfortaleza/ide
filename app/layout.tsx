import type { Metadata } from "next";
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
  title: "Ide - Mural Missionário",
  description: "Painel de gestão e mural de acompanhamento para duplas missionárias.",
  icons: {
    icon: "/icon/favicon.png", // Caminho direto para a pasta public
    shortcut: "/icon/favicon.png",
    apple: "/icon/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      // REMOVIDO: A classe 'dark' que estava forçando o tema escuro
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* ADICIONADO: bg-background e text-foreground para puxar o fundo branco e texto escuro do globals.css */}
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}