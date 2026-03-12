import { Plus_Jakarta_Sans } from "next/font/google";
import ContentLayoutClient from "./ContentLayoutClient";
import "./globalStyle.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={jakarta.className}>
        <ContentLayoutClient>{children}</ContentLayoutClient>
      </body>
    </html>
  );
}