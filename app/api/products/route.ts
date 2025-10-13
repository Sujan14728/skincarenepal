import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/products - Get all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (
      !payload ||
      typeof payload !== 'object' ||
      !('id' in payload) ||
      !('isAdmin' in payload)
    ) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    if (!payload.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      excerpt,
      description,
      keyBenefits,
      keyIngredients,
      howToUse,
      suitableFor,
      price,
      salePrice,
      stock,
      images
    } = body;

    // Validate required fields
    if (!name || price <= 0) {
      return NextResponse.json(
        { error: 'Please provide name and valid price' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this name already exists' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        excerpt: excerpt || null,
        description: description || null,
        keyBenefits: keyBenefits || [],
        keyIngredients: keyIngredients || [],
        howToUse: howToUse || [],
        suitableFor: suitableFor || [],
        price: parseInt(price),
        salePrice: salePrice ? parseInt(salePrice) : null,
        stock: parseInt(stock) || 0,
        images: images || []
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
