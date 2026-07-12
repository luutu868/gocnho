import type { Metadata } from "next";
import { CartProvider } from '@/context/CartContext';
import "./globals.css";

export const metadata: Metadata = {
  title: "Tiện Cafe Góc Nhỏ - Menu đặt món online",
  description: "Đặt món online tại Tiện Cafe Góc Nhỏ - Menu cafe, trà, sinh tố, đá xay. Không cần đăng ký, thanh toán VietQR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-gray-50" suppressHydrationWarning>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
