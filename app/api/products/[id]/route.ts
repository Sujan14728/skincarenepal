import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET /api/products/[id] - Get single product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(params.id),
      },
    });

    if (!product) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return Response.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return Response.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const productId = parseInt(params.id);
    const body = await req.json();

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const {
      name,
      description,
      price,
      salePrice,
      stock,
      images,
    } = body;

    // Generate new slug if name changed
    let slug = existingProduct.slug;
    if (name && name !== existingProduct.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // Check if new slug already exists (excluding current product)
      const slugExists = await prisma.product.findFirst({
        where: {
          slug,
          NOT: { id: productId },
        },
      });

      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name || existingProduct.name,
        slug,
        description: description !== undefined ? description : existingProduct.description,
        price: price !== undefined ? parseInt(price) : existingProduct.price,
        salePrice: salePrice !== undefined ? (salePrice ? parseInt(salePrice) : null) : existingProduct.salePrice,
        stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
        images: images !== undefined ? images : existingProduct.images,
      },
    });

    return Response.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return Response.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const productId = parseInt(params.id);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product is used in any orders
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId },
    });

    if (orderItems) {
      return Response.json(
        { error: "Cannot delete product that has been ordered. Consider marking it as inactive instead." },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return Response.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return Response.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}