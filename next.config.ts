import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    importScripts: ["/sw-push.js"],
    navigateFallback: "/offline",
    navigateFallbackDenylist: [/^\/api\//, /^\/admin/, /^\/order\//],
    runtimeCaching: [
      {
        urlPattern: ({ request, url }) =>
          request.mode === "navigate" && url.pathname.startsWith("/products"),
        handler: "NetworkFirst",
        options: {
          cacheName: "catalog-page-document",
          networkTimeoutSeconds: 4,
          expiration: {
            maxEntries: 40,
            maxAgeSeconds: 60 * 60 * 24,
          },
        },
      },
      {
        urlPattern: ({ request, url }) =>
          request.method === "GET" && url.pathname.startsWith("/api/products"),
        handler: "NetworkFirst",
        options: {
          cacheName: "catalog-products-api",
          networkTimeoutSeconds: 8,
          expiration: {
            maxEntries: 80,
            maxAgeSeconds: 60 * 60 * 24,
          },
        },
      },
      {
        urlPattern: ({ url }) =>
          url.hostname === "res.cloudinary.com" ||
          url.hostname === "lh3.googleusercontent.com" ||
          url.hostname === "images.pexels.com" ||
          url.hostname === "static.wixstatic.com" ||
          url.hostname === "blogger.googleusercontent.com",
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "catalog-product-images",
          expiration: {
            maxEntries: 120,
            maxAgeSeconds: 60 * 60 * 24 * 7,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
      {
        protocol: "https",
        hostname: "blogger.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withPWA(nextConfig);
