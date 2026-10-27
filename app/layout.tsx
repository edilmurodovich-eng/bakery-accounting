
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Bakery Accounting",
  description: "Расчёт себестоимости, продаж и прибыли кондитерской",
  applicationName: "Bakery Accounting",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff8ef",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          background: "#fff8ef",
          color: "#30211c",
        }}
      >
        {children}
      </body>
    </html>
  );
}
