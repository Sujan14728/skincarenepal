import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AddToCartButton from '@/components/landing/shared/AddToCartButton';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug }
  });

  if (!product) return notFound();

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const isInStock = product.stock > 0;

  return (
    <div className='container mx-auto px-4 py-12'>
      <div className='grid gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Product Image */}
        <div className='relative'>
          {product.images.length > 0 ? (
            <div className='overflow-hidden rounded-2xl bg-gray-50'>
              <Image
                src={product.images[0]}
                alt={product.name}
                width={600}
                height={600}
                className='h-auto w-full object-cover transition-transform hover:scale-105'
                priority
              />
            </div>
          ) : (
            <div className='flex h-[500px] w-full items-center justify-center rounded-2xl bg-gray-100'>
              <p className='text-gray-400'>No image available</p>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className='flex flex-col'>
          {/* Header */}
          <div className='mb-6'>
            <h1 className='mb-3 text-4xl font-bold tracking-tight'>
              {product.name}
            </h1>
            {product.excerpt && (
              <p className='text-lg text-gray-600'>{product.excerpt}</p>
            )}
          </div>

          {/* Pricing */}
          <div className='mb-6 flex items-baseline gap-3'>
            {hasDiscount ? (
              <>
                <span className='text-3xl font-bold text-red-600'>
                  Rs. {product.salePrice?.toLocaleString()}
                </span>
                <span className='text-xl text-gray-400 line-through'>
                  Rs. {product.price.toLocaleString()}
                </span>
                <Badge variant='destructive' className='ml-2'>
                  {Math.round(
                    ((product.price - product.salePrice!) / product.price) * 100
                  )}
                  % OFF
                </Badge>
              </>
            ) : (
              <span className='text-3xl font-bold text-gray-900'>
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className='mb-8'>
            {isInStock ? (
              <Badge variant='secondary' className='text-sm'>
                In Stock ({product.stock} available)
              </Badge>
            ) : (
              <Badge variant='destructive' className='text-sm'>
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Add to Cart */}
          {/* <div className='mb-10'>
            <Button
              disabled={!isInStock}
              size='lg'
              className='w-full sm:w-auto'
            >
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div> */}
          <AddToCartButton product={{ ...product, image: product.images[0] }} />

          {/* Description */}
          {product.description && (
            <div className='mb-8 border-t pt-8'>
              <h2 className='mb-4 text-xl font-semibold'>Description</h2>
              <div
                className='prose prose-gray max-w-none text-gray-700'
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Key Benefits */}
          {product.keyBenefits.length > 0 && (
            <div className='border-t pt-8'>
              <h2 className='mb-4 text-xl font-semibold'>Key Benefits</h2>
              <ul className='space-y-3'>
                {product.keyBenefits.map((benefit, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <svg
                      className='mt-1 h-5 w-5 flex-shrink-0 text-green-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='text-gray-700'>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
