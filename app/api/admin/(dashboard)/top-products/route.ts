import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Aggregate sales grouped by product
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, price: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    // Enrich with product info
    const productIds = topProducts.map((p) => p.productId).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds as number[] } },
      select: { id: true, name: true, status: true, stock: true },
    });

    const merged = topProducts.map((p) => {
      const product = products.find((prod) => prod.id === p.productId);
      return {
        id: product?.id ?? 0,
        name: product?.name ?? "Unknown Product",
        status: product?.status ?? "DISCONTINUED",
        stock: product?.stock ?? 0,
        totalSold: p._sum.quantity ?? 0,
        totalRevenue: (p._sum.price ?? 0) * (p._sum.quantity ?? 1),
      };
    });

    return NextResponse.json(merged);
  } catch (error) {
    console.error("Error fetching top products:", error);
    return NextResponse.json({ error: "Failed to fetch top products" }, { status: 500 });
  }
}
