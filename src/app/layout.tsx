import { Poppins } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CartModal from "@/components/cart-modal/cart-modal";
import Script from "next/script";
import { AppProviders } from "@/components/providers/session-provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import HelpModal from "@/components/help-modal";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AdminSidebarProvider } from "@/contexts/admin-sidebar-context";

const poppins = Poppins({
  weight: ["400", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Butik Busana - Jual Busana & Pakaian Fashion Pria & Wanita Harga Terjangkau",
    template: '%s - Butik Busana - Jual Busana & Pakaian Fashion Pria & Wanita Harga Terjangkau'
  },
  description: "Butik Busana menawarkan koleksi busana fashion pria dan wanita kualitas terbaik dengan harga terjangkau. Temukan produk pakaian original, modis, dan terjamin kualitasnya.",
  keywords: "ecommerce, fashion, baju, butik, celana, pakaian pria, pakaian wanita, baju modis, online shop, belanja online, busana fashion",
  twitter: {
    card: 'summary_large_image'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scrollbar">
      <head>
        <meta name="google-site-verification" content="6XOUWyXTI8z3zIJN79DBa2rIutzE018fkzxAstiGCjw" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${poppins.className} antialiased relative bg-slate-100 overflow-x-hidden`}
      >
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          draggablePercent={60} // Adjust the swipe threshold percentage
        />
        <AppProviders>
          <AdminSidebarProvider>
            <Navbar />
            <div className="relative">{children}</div>
            
          </AdminSidebarProvider>
        </AppProviders>
        <Script
          src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL as string}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT}
          strategy="afterInteractive"
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
