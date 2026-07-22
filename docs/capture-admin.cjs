const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "screenshots");
const BASE = "http://localhost:3000";

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto(`${BASE}/login?callbackUrl=/admin`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1000);
  await page.locator('input[type="email"]').fill("admin@butik-busana.com");
  await page.locator('input[type="password"]').fill("password123");
  await page.getByRole("button", { name: /^Masuk$/ }).click();
  await page.waitForURL(/\/admin/, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2500);

  const pages = [
    ["admin", `${BASE}/admin`],
    ["admin-produk", `${BASE}/admin/products`],
    ["admin-koleksi", `${BASE}/admin/collections`],
    ["admin-pesanan", `${BASE}/admin/orders`],
    ["admin-rekening", `${BASE}/admin/rekening-bank`],
    ["admin-slider", `${BASE}/admin/slider`],
    ["admin-users", `${BASE}/admin/users`],
  ];

  for (const [name, url] of pages) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
    console.log("saved", name, page.url());
  }

  // beranda again with longer image wait
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, "beranda.png"), fullPage: false });
  console.log("saved beranda");

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
