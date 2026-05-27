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
    default: "butik-busana.com jual aneka jam tangan branded, kacamata import, fashion, obat herbal murah harga terjangkau",
    template: '%s - Butik Busana - Jual aneka jam tangan branded, kacamata import, fashion, obat herbal murah harga terjangkau'
  },
  description: "Butik Busana menawarkan aneka jam tangan import, fashion, hingga kacamata kwalitas terbaik dengan harga terjangkau, segera temukan produk original dan terjamin kualitasnya.",
  keywords: "ecommerce, jam tangan, arloji, kacamata, rayban, tag heuer, gucci, fashion, baju, ponsel, butik, celana, elektronik, online shop, belanja online",
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
    <html lang="en" className="scrollbar">
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
