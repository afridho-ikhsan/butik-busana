export type ButikBusanaProductSeed = {
  name: string;
  slug?: string;
  description: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  weight: number;
  brand?: string;
  collections: string[];
  imageUrls: string[];
  variants?: {
    name: string;
    price: number;
    weight: number;
    quantity: number;
    discountType?: "percent" | "amount";
    discountValue?: number;
  }[];
};

const pexels = (photoId: number) =>
  `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=800`;

export const butikBusanaCollections = [
  { name: "Semua Produk", slug: "all-products", imageUrl: "/default-collection.jpg" },
  { name: "Gamis", slug: "gamis", imageUrl: pexels(6311392) },
  { name: "Tunik & Atasan", slug: "tunik-atasan", imageUrl: pexels(7679720) },
  { name: "Rok & Celana", slug: "rok-celana", imageUrl: pexels(985635) },
  { name: "Dress", slug: "dress", imageUrl: pexels(1536619) },
  { name: "Outerwear", slug: "outerwear", imageUrl: pexels(1040945) },
  { name: "Hijab", slug: "hijab", imageUrl: pexels(6311656) },
  { name: "Aksesoris", slug: "aksesoris", imageUrl: pexels(298346) },
];

export const butikBusanaProductSeed: ButikBusanaProductSeed[] = [
  {
    name: "Gamis Syari Rayya Brokat",
    description:
      "<p>Gamis syari dengan detail brokat elegan, bahan premium adem dan tidak menerawang. Cocok untuk acara formal maupun harian.</p>",
    price: 289000,
    discountedPrice: 249000,
    quantity: 23,
    weight: 0.45,
    brand: "Butik Busana",
    collections: ["gamis"],
    imageUrls: [pexels(6311392), pexels(5060893)],
    variants: [
      { name: "S", price: 289000, weight: 0.42, quantity: 5, discountType: "amount", discountValue: 40000 },
      { name: "M", price: 289000, weight: 0.44, quantity: 8, discountType: "amount", discountValue: 40000 },
      { name: "L", price: 299000, weight: 0.46, quantity: 6, discountType: "amount", discountValue: 40000 },
      { name: "XL", price: 299000, weight: 0.48, quantity: 4, discountType: "amount", discountValue: 40000 },
    ],
  },
  {
    name: "Gamis Daily Amani Crinkle",
    description:
      "<p>Gamis daily bahan crinkle airflow, ringan, anti kusut, dan nyaman dipakai seharian.</p>",
    price: 195000,
    quantity: 30,
    weight: 0.35,
    brand: "Butik Busana",
    collections: ["gamis"],
    imageUrls: [pexels(7691083)],
    variants: [
      { name: "S", price: 195000, weight: 0.33, quantity: 8 },
      { name: "M", price: 195000, weight: 0.35, quantity: 10 },
      { name: "L", price: 205000, weight: 0.37, quantity: 7 },
      { name: "XL", price: 205000, weight: 0.38, quantity: 5 },
    ],
  },
  {
    name: "Tunik Crinkle Mariam",
    description:
      "<p>Tunik panjang model A-line dengan potongan longgar. Bahan crinkle lembut dan breathable.</p>",
    price: 165000,
    discountedPrice: 145000,
    quantity: 18,
    weight: 0.28,
    collections: ["tunik-atasan"],
    imageUrls: [pexels(7679720)],
  },
  {
    name: "Blouse Chiffon Elisa",
    description:
      "<p>Blouse chiffon dengan detail renda halus. Elegan untuk kantor maupun hangout.</p>",
    price: 149000,
    quantity: 22,
    weight: 0.2,
    collections: ["tunik-atasan"],
    imageUrls: [pexels(1183266)],
    variants: [
      { name: "S", price: 149000, weight: 0.18, quantity: 6 },
      { name: "M", price: 149000, weight: 0.2, quantity: 8 },
      { name: "L", price: 159000, weight: 0.22, quantity: 5 },
      { name: "XL", price: 159000, weight: 0.23, quantity: 3 },
    ],
  },
  {
    name: "Rok Plisket Premium",
    description:
      "<p>Rok plisket high waist dengan elastic waistband. Jatuh rapi dan mudah mix and match.</p>",
    price: 135000,
    quantity: 25,
    weight: 0.25,
    collections: ["rok-celana"],
    imageUrls: [pexels(985635)],
  },
  {
    name: "Celana Kulot Linen",
    description:
      "<p>Celana kulot bahan linen premium, cutting wide leg yang nyaman dan stylish.</p>",
    price: 175000,
    discountedPrice: 155000,
    quantity: 20,
    weight: 0.3,
    collections: ["rok-celana"],
    imageUrls: [pexels(1040945)],
    variants: [
      { name: "S", price: 175000, weight: 0.28, quantity: 5, discountType: "amount", discountValue: 20000 },
      { name: "M", price: 175000, weight: 0.3, quantity: 7, discountType: "amount", discountValue: 20000 },
      { name: "L", price: 185000, weight: 0.32, quantity: 5, discountType: "amount", discountValue: 20000 },
      { name: "XL", price: 185000, weight: 0.34, quantity: 3, discountType: "amount", discountValue: 20000 },
    ],
  },
  {
    name: "Hijab Voal Premium Motif",
    description:
      "<p>Hijab voal premium dengan motif eksklusif, tekstur halus dan mudah dibentuk.</p>",
    price: 89000,
    quantity: 40,
    weight: 0.08,
    collections: ["hijab"],
    imageUrls: [pexels(6311656), pexels(6311587)],
  },
  {
    name: "Pashmina Silk Medina",
    description:
      "<p>Pashmina silk lembut dengan finishing matte. Nyaman dipakai sepanjang hari.</p>",
    price: 125000,
    quantity: 35,
    weight: 0.1,
    collections: ["hijab"],
    imageUrls: [pexels(6311587)],
  },
  {
    name: "Cardigan Rajut Oversize",
    description:
      "<p>Cardigan rajut oversize dengan kancing depan. Hangat dan cocok untuk layering.</p>",
    price: 189000,
    discountedPrice: 169000,
    quantity: 15,
    weight: 0.4,
    collections: ["outerwear"],
    imageUrls: [pexels(1040945)],
  },
  {
    name: "Jaket Bomber Katun",
    description:
      "<p>Jaket bomber bahan katun twill, inner furing nyaman. Model casual modern.</p>",
    price: 219000,
    quantity: 12,
    weight: 0.45,
    collections: ["outerwear"],
    imageUrls: [pexels(3007929)],
    variants: [
      { name: "S", price: 219000, weight: 0.42, quantity: 3 },
      { name: "M", price: 219000, weight: 0.45, quantity: 4 },
      { name: "L", price: 229000, weight: 0.47, quantity: 3 },
      { name: "XL", price: 229000, weight: 0.48, quantity: 2 },
    ],
  },
  {
    name: "Dress Midi Floral",
    description:
      "<p>Dress midi dengan motif floral soft tone. Potongan feminin dengan belt detail.</p>",
    price: 245000,
    quantity: 14,
    weight: 0.32,
    collections: ["dress"],
    imageUrls: [pexels(1536619), pexels(1926769)],
  },
  {
    name: "Kaftan Brokat Elegan",
    description:
      "<p>Kaftan brokat untuk acara spesial. Cutting longgar dengan detail payet halus.</p>",
    price: 325000,
    discountedPrice: 289000,
    quantity: 10,
    weight: 0.5,
    collections: ["dress", "gamis"],
    imageUrls: [pexels(5060893)],
  },
  {
    name: "Set Gamis Couple Safa",
    description:
      "<p>Set gamis couple bahan wolfis premium. Tersedia ukuran wanita, pasangan serasi untuk keluarga.</p>",
    price: 275000,
    quantity: 16,
    weight: 0.55,
    collections: ["gamis"],
    imageUrls: [pexels(7691083), pexels(6311392)],
    variants: [
      { name: "S", price: 275000, weight: 0.5, quantity: 4 },
      { name: "M", price: 275000, weight: 0.55, quantity: 6 },
      { name: "L", price: 285000, weight: 0.58, quantity: 4 },
      { name: "XL", price: 285000, weight: 0.6, quantity: 2 },
    ],
  },
  {
    name: "Mukena Travel Zahra",
    description:
      "<p>Mukena travel dengan pouch praktis, bahan rayon halus dan ringan dibawa kemana saja.</p>",
    price: 159000,
    quantity: 28,
    weight: 0.35,
    collections: ["aksesoris"],
    imageUrls: [pexels(994523)],
  },
  {
    name: "Rompi Linen Office",
    description:
      "<p>Rompi linen tanpa lengan untuk look profesional. Mudah dipadukan dengan kemeja atau blouse.</p>",
    price: 155000,
    quantity: 18,
    weight: 0.22,
    collections: ["tunik-atasan", "outerwear"],
    imageUrls: [pexels(1183266)],
  },
  {
    name: "Kemeja Oversize Denim",
    description:
      "<p>Kemeja oversize bahan denim wash soft. Style casual chic untuk aktivitas outdoor.</p>",
    price: 199000,
    quantity: 20,
    weight: 0.38,
    collections: ["tunik-atasan"],
    imageUrls: [pexels(1040945)],
  },
  {
    name: "Rok Span Scuba",
    description:
      "<p>Rok span bahan scuba stretch, model pencil slim fit. Nyaman dan tidak mudah kusut.</p>",
    price: 129000,
    discountedPrice: 109000,
    quantity: 24,
    weight: 0.22,
    collections: ["rok-celana"],
    imageUrls: [pexels(985635)],
  },
  {
    name: "Inner Dress Manset",
    description:
      "<p>Inner dress manset bahan spandex premium. Wajib punya untuk layering gamis dan dress.</p>",
    price: 75000,
    quantity: 50,
    weight: 0.15,
    collections: ["aksesoris", "dress"],
    imageUrls: [pexels(298346)],
  },
  {
    name: "Hijab Instan PATTU",
    description:
      "<p>Hijab instan bahan PATTU dengan pita dan bros cantik. Praktis tanpa perlu peniti.</p>",
    price: 95000,
    quantity: 32,
    weight: 0.12,
    collections: ["hijab"],
    imageUrls: [pexels(6311656)],
  },
  {
    name: "Gamis Anak Little Aisha",
    description:
      "<p>Gamis anak perempuan bahan katun combed lembut. Motif cantik dan nyaman untuk sekolah.</p>",
    price: 145000,
    quantity: 20,
    weight: 0.25,
    collections: ["gamis"],
    imageUrls: [pexels(6311392)],
    variants: [
      { name: "Usia 5-6", price: 145000, weight: 0.22, quantity: 5 },
      { name: "Usia 7-8", price: 145000, weight: 0.24, quantity: 6 },
      { name: "Usia 9-10", price: 155000, weight: 0.26, quantity: 5 },
      { name: "Usia 11-12", price: 155000, weight: 0.28, quantity: 4 },
    ],
  },
];
