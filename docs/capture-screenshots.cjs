const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "screenshots");
const BASE = "http://localhost:3000";

async function shot(page, name, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1200);
  const closeBtn = page.getByRole("button", { name: /Tutup modal|Tutup menu/i });
  if (await closeBtn.count()) {
    try { await closeBtn.first().click({ timeout: 1500 }); } catch {}
  }
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  console.log("saved", name);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await shot(page, "beranda", `${BASE}/`);
  await shot(page, "produk", `${BASE}/products`);
  await shot(page, "login", `${BASE}/login`);
  await shot(page, "register", `${BASE}/register`);
  await shot(page, "about", `${BASE}/about`);
  await shot(page, "kontak", `${BASE}/kontak`);
  await shot(page, "cari-pesanan", `${BASE}/cari-pesanan`);

  await page.goto(`${BASE}/products`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1000);
  const productLink = page.locator('a[href*="/products/"]').first();
  if (await productLink.count()) {
    await productLink.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, "detail-produk.png"), fullPage: false });
    console.log("saved detail-produk");
  }

  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(800);
  const email = page.locator('input[type="email"], input[name="email"]').first();
  const password = page.locator('input[type="password"]').first();
  if (await email.count()) {
    await email.fill("admin@butik-busana.com");
    await password.fill("password123");
    const submit = page.getByRole("button", { name: /Masuk|Login|Sign in/i }).first();
    await submit.click();
    await page.waitForTimeout(3000);
  }

  await shot(page, "admin", `${BASE}/admin`);
  await shot(page, "admin-produk", `${BASE}/admin/products`);
  await shot(page, "admin-koleksi", `${BASE}/admin/collections`);
  await shot(page, "admin-pesanan", `${BASE}/admin/orders`);
  await shot(page, "admin-rekening", `${BASE}/admin/rekening-bank`);

  try {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(800);
    const menuBtn = page.getByRole("button", { name: /Buka menu navigasi/i });
    if (await menuBtn.count()) await menuBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, "menu-navigasi.png"), fullPage: false });
    console.log("saved menu-navigasi");
  } catch (e) {
    console.log("menu-nav skip", e.message);
  }

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
