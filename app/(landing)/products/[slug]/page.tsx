import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductDetails } from '@/components/landing/product-page/ProductDetails';
import { ProductImageGallery } from '@/components/landing/product-page/ProductImageGallery';
import { ProductTabs } from '@/components/landing/product-page/ProductTabs';
import Link from 'next/link';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { slug } = await params;

  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product) return notFound();

  const hasDiscount = !!(
    product.salePrice && product.salePrice < product.price
  );
  const discountedPercent = hasDiscount
    ? Math.round(
        ((product.price - (product.salePrice || 0)) / product.price) * 100
      )
    : 0;

  return (
    <div className='container mx-auto px-4 py-12 mb-10'>
      <nav className='mb-6 text-sm text-gray-500'>
        <Link href='/' className='hover:text-green-600'>
          Home
        </Link>{' '}
        &gt;
        <Link href='/products' className='hover:text-green-600'>
          Products
        </Link>{' '}
        &gt;
        <span className='font-semibold text-gray-700'>{product.name}</span>
      </nav>

      <div className='grid gap-12 lg:grid-cols-2 lg:gap-20'>
        <ProductImageGallery
          images={product.images}
          productName={product.name}
          hasDiscount={hasDiscount}
          discountedPercent={discountedPercent}
        />

        <ProductDetails product={product} />
      </div>

      <ProductTabs product={product} />
    </div>
  );
};

export default ProductPage;
