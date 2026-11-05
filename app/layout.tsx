
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modigul Accounting",
  description: "Расчёт себестоимости, продаж и прибыли кондитерской",
  applicationName: "Modigul Accounting",
  icons: {
    icon: "/modigul-icon.png",
  apple: "/modigul-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#450914",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          fontFamily: "Manrope, sans-serif",
          background: "#f5eef1",
          color: "#30211c",
        }}
      >
        {children}
      </body>
    </html>
  );
}
