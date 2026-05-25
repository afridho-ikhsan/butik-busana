import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { metodePembayaranMap } from "@/constants/general";

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin" && role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const lineItems = (order.lineItems as { productName?: string; price?: number; quantity?: number }[]) || [];
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 20;
    let y = 20;

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(80);
    doc.setFont("helvetica", "bold");
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    doc.text("LUNAS", pageW / 2, pageH / 2, { align: "center", angle: -45 });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");

    doc.setFontSize(18);
    doc.text("INVOICE", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`No. Order: #${order.orderNumber}`, margin, y);
    y += 6;
    doc.text(`Tanggal: ${order.createdAt.toLocaleDateString("id-ID")}`, margin, y);
    y += 10;

    doc.text("Pembeli:", margin, y);
    y += 5;
    doc.text(order.recipientName || order.user?.nickname || "-", margin + 5, y);
    y += 5;
    if (order.recipientPhone) {
      doc.text(order.recipientPhone, margin + 5, y);
      y += 5;
    }
    doc.text(order.user?.email || "", margin + 5, y);
    y += 8;

    doc.text("Alamat Pengiriman:", margin, y);
    y += 5;
    const addrLines = doc.splitTextToSize(order.address, 170);
    addrLines.forEach((line: string) => {
      doc.text(line, margin + 5, y);
      y += 5;
    });
    y += 5;

    doc.setDrawColor(200);
    doc.line(margin, y, 190, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Detail Produk", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    doc.text("Produk", margin, y);
    doc.text("Qty", margin + 120, y);
    doc.text("Harga", margin + 140, y);
    doc.text("Subtotal", margin + 165, y);
    y += 6;

    doc.setDrawColor(200);
    doc.line(margin, y, 190, y);
    y += 6;

    for (const item of lineItems) {
      const name = (item.productName || "").slice(0, 45);
      const qty = item.quantity || 0;
      const price = item.price || 0;
      const subtotal = price * qty;
      doc.text(name, margin, y);
      doc.text(String(qty), margin + 120, y);
      doc.text(formatRupiah(price), margin + 140, y);
      doc.text(formatRupiah(subtotal), margin + 165, y);
      y += 6;
    }

    y += 8;
    doc.setDrawColor(200);
    doc.line(margin, y, 190, y);
    y += 8;

    doc.text("Subtotal:", margin + 120, y);
    doc.text(formatRupiah(order.subtotal), margin + 165, y);
    y += 6;
    doc.text("Ongkos Kirim:", margin + 120, y);
    doc.text(formatRupiah(order.shippingCost), margin + 165, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Total:", margin + 120, y);
    doc.text(formatRupiah(order.total), margin + 165, y);
    doc.setFont("helvetica", "normal");
    y += 10;

    doc.text(`Metode Pembayaran: ${metodePembayaranMap.get(order.metodePembayaran || null) || "-"}`, margin, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text(`Status: ${order.paymentStatus === "PAID" ? "Sudah Bayar" : "Belum Bayar"}`, margin, y);

    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json(
      { error: "Gagal generate invoice" },
      { status: 500 }
    );
  }
}