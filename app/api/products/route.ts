import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET /api/products - Get all products
export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || typeof payload !== 'object' || !('id' in payload) || !('isAdmin' in payload)) {
      return Response.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    if (!payload.isAdmin) {
      return Response.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      salePrice,
      stock,
      images,
    } = body;

    // Validate required fields
    if (!name || price <= 0) {
      return Response.json(
        { error: "Please provide name and valid price" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return Response.json(
        { error: "A product with this name already exists" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price: parseInt(price),
        salePrice: salePrice ? parseInt(salePrice) : null,
        stock: parseInt(stock) || 0,
        images: images || [],
      },
    });

    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}