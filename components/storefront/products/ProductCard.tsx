/* eslint-disable @next/next/no-img-element */
import {
  DESIGN_IMAGES,
  effectivePrice,
  formatPrice,
  stripHtml,
  type StorefrontProduct
} from '@/lib/storefront-utils';

export const STATUS_LABEL: Record<string, string> = {
  OUT_OF_STOCK: 'OUT OF STOCK',
  COMING_SOON: 'COMING SOON',
  DISCONTINUED: 'DISCONTINUED'
};

/** Buy button text: BUY NOW, or why the product can't be bought. */
export function buyLabel(product: StorefrontProduct) {
  return product.status === 'IN_STOCK'
    ? 'BUY NOW'
    : (STATUS_LABEL[product.status] ?? 'UNAVAILABLE');
}

export function productTagline(product: StorefrontProduct) {
  return product.excerpt || stripHtml(product.description);
}

export function Stars() {
  return (
    <span className='cc-stars' aria-hidden='true'>
      ★★★★★
    </span>
  );
}

export function Price({
  product,
  className
}: {
  product: StorefrontProduct;
  className: string;
}) {
  const price = effectivePrice(product);
  return (
    <p className={className}>
      {formatPrice(price)}
      {price < product.price && <s>{formatPrice(product.price)}</s>}
    </p>
  );
}

/** Image + copy shared by catalogue cards and "Complete Your Routine" cards. */
export function CardBody({ product }: { product: StorefrontProduct }) {
  return (
    <>
      <figure className='cc-catalogue-image'>
        {product.routineKey !== 'CARE' && (
          <span className='cc-category-badge'>{product.routineKey}</span>
        )}
        {STATUS_LABEL[product.status] && (
          <span className='cc-status-badge'>
            {STATUS_LABEL[product.status]}
          </span>
        )}
        <img
          src={product.images[0] || DESIGN_IMAGES.flatLay}
          alt={product.name}
          loading='lazy'
        />
      </figure>
      <div className='cc-catalogue-content'>
        <h3>{product.name}</h3>
        <p className='cc-product-tagline'>{productTagline(product)}</p>
        {product.reviewCount > 0 && (
          <div
            className='cc-rating-row'
            aria-label={`${product.rating} out of 5 stars from ${product.reviewCount} reviews`}
          >
            <Stars />
            <strong>{product.rating}</strong>
            <span>({product.reviewCount})</span>
          </div>
        )}
        <Price product={product} className='cc-price' />
      </div>
    </>
  );
}
