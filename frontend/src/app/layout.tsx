import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globalStyle.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Acley",
  description: "Acley is a study plataform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={jakarta.className}>
        {children}
      </body>
    </html>
  );
}
