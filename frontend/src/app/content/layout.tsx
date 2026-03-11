import { Plus_Jakarta_Sans } from "next/font/google";
import SideBar from "../Components/SideBarGlass/sideBarGlass";
import "./globalStyle.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"]
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={jakarta.className}>
        <div className="theBody">
          <div>
            <SideBar />
          </div>
          <div className="mainContent">
              {children}
          </div>
        </div>
      </body>
    </html>
  );
}
