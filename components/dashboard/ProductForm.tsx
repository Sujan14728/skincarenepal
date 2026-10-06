'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ImagePlus, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css';
import { ProductStatus } from '@/lib/enum/product';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Field,
  FieldRow,
  FormBody,
  FormFooter,
  FormSection,
  ListField
} from './form';
const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
});

const MAX_IMAGES = 5;

const STATUS_LABELS: Record<ProductStatus, string> = {
  IN_STOCK: 'In stock',
  OUT_OF_STOCK: 'Out of stock',
  COMING_SOON: 'Coming soon',
  DISCONTINUED: 'Discontinued'
};

interface Product {
  id?: number;
  name: string;
  excerpt?: string;
  description?: string | null;
  keyBenefits: string[];
  keyIngredients: string[];
  howToUse: string[];
  suitableFor: string[];
  price: number;
  salePrice?: number | null;
  stock: number;
  images: string[];
  status: ProductStatus;
}

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel?: () => void;
}

type ListFieldName = 'keyBenefits' | 'keyIngredients' | 'howToUse' | 'suitableFor';

const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState<Product>({
    name: product?.name || '',
    excerpt: product?.excerpt || '',
    description: product?.description || '',
    keyBenefits: product?.keyBenefits || [],
    keyIngredients: product?.keyIngredients || [],
    howToUse: product?.howToUse || [],
    suitableFor: product?.suitableFor || [],
    price: product?.price || 0,
    salePrice: product?.salePrice || undefined,
    stock: product?.stock || 0,
    images: product?.images || [],
    status: product?.status || 'IN_STOCK'
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    field: keyof Product,
    value: string | number | string[] | null | undefined
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'name' || field === 'price') {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const setList = (fieldName: ListFieldName) => (items: string[]) =>
    setFormData(prev => ({ ...prev, [fieldName]: items }));

  // --- Image upload ---

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');
      formData.append('useUniqueFileName', 'true');
      formData.append('tags', 'product-image');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, data.url]
      }));

      toast.success('Image uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Image could not be uploaded. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so selecting the same file again still fires onChange
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file (JPG, PNG or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is larger than 5 MB. Choose a smaller file.');
      return;
    }

    handleImageUpload(file);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // --- Submit ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0) {
      setErrors({
        name: formData.name ? undefined : 'Enter a product name.',
        price: formData.price > 0 ? undefined : 'Enter a price above 0.'
      });
      toast.error('Add a product name and a price above 0.');
      return;
    }

    setLoading(true);
    try {
      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(product ? 'Product saved' : 'Product created');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Product could not be saved. Try again.');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Product could not be saved. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className='flex min-h-0 flex-1 flex-col'>
      <FormBody>
        <FormSection
          title='Basics'
          description='The name and copy customers see on the product page.'
        >
          <Field label='Name' htmlFor='name' required error={errors.name}>
            <Input
              id='name'
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder='e.g. Turmeric Glow Face Serum'
              aria-invalid={errors.name ? true : undefined}
            />
          </Field>

          <Field
            label='Excerpt'
            htmlFor='excerpt'
            optional
            hint='One line shown on product cards and in search results.'
          >
            <Input
              id='excerpt'
              value={formData.excerpt}
              onChange={e => handleInputChange('excerpt', e.target.value)}
              placeholder='Short description'
            />
          </Field>

          <Field label='Description' optional>
            <div className='overflow-hidden rounded-lg border [&_.sun-editor]:!border-0'>
              <SunEditor
                setContents={formData.description ?? ''}
                onChange={handleDescriptionChange}
                setOptions={{
                  height: '200px',
                  buttonList: [
                    ['undo', 'redo'],
                    ['font', 'fontSize'],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['align', 'list'],
                    ['fontColor', 'hiliteColor'],
                    ['link'],
                    ['removeFormat']
                  ]
                }}
              />
            </div>
          </Field>
        </FormSection>

        <FormSection
          title='Pricing & inventory'
          description='Prices are in Nepali rupees.'
        >
          <FieldRow cols={3}>
            <Field label='Price (Rs.)' htmlFor='price' required error={errors.price}>
              <Input
                id='price'
                type='number'
                inputMode='numeric'
                value={formData.price}
                onChange={e =>
                  handleInputChange('price', parseInt(e.target.value) || 0)
                }
                placeholder='0'
                min='0'
                className='tabular-nums'
                aria-invalid={errors.price ? true : undefined}
              />
            </Field>

            <Field
              label='Sale price (Rs.)'
              htmlFor='salePrice'
              optional
              hint='Leave empty if not on sale.'
            >
              <Input
                id='salePrice'
                type='number'
                inputMode='numeric'
                value={formData.salePrice || ''}
                onChange={e => {
                  const value = e.target.value;
                  handleInputChange(
                    'salePrice',
                    // null (not undefined) survives JSON, so clearing removes the sale
                    value ? parseInt(value) : null
                  );
                }}
                placeholder='0'
                min='0'
                className='tabular-nums'
              />
            </Field>

            <Field label='Stock' htmlFor='stock' required hint='Units on hand.'>
              <Input
                id='stock'
                type='number'
                inputMode='numeric'
                value={formData.stock}
                onChange={e =>
                  handleInputChange('stock', parseInt(e.target.value) || 0)
                }
                placeholder='0'
                min='0'
                className='tabular-nums'
              />
            </Field>
          </FieldRow>

          <Field
            label='Status'
            htmlFor='status'
            hint='Controls whether customers can order this product.'
          >
            <Select
              value={formData.status}
              onValueChange={value => handleInputChange('status', value)}
            >
              <SelectTrigger id='status' className='w-full sm:w-56'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.values(ProductStatus).map(status => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FormSection>

        <FormSection
          title='Media'
          description={`Up to ${MAX_IMAGES} images. The first image is the cover.`}
        >
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleFileSelect}
            className='hidden'
          />

          <div className='grid grid-cols-3 gap-3 sm:grid-cols-5'>
            {formData.images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'
              >
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes='(min-width: 640px) 140px, 30vw'
                  className='object-cover'
                />
                {index === 0 && (
                  <span className='absolute bottom-1.5 left-1.5 rounded bg-background/90 px-1.5 py-0.5 text-[11px] font-medium text-foreground shadow-xs'>
                    Cover
                  </span>
                )}
                <Button
                  type='button'
                  variant='secondary'
                  size='icon'
                  onClick={() => removeImage(index)}
                  className='absolute right-1.5 top-1.5 size-6 rounded-full bg-background/90 text-foreground shadow-xs hover:bg-background hover:text-destructive'
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className='size-3.5' />
                </Button>
              </div>
            ))}

            {formData.images.length < MAX_IMAGES && (
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className='flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-2 text-center text-muted-foreground outline-none transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-70'
              >
                {uploading ? (
                  <>
                    <Loader2 className='size-5 animate-spin' aria-hidden />
                    <span className='text-xs'>Uploading…</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className='size-5' aria-hidden />
                    <span className='text-xs font-medium text-foreground'>
                      Add image
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className='text-xs text-muted-foreground'>
            JPG, PNG or WebP, up to 5 MB each. {formData.images.length}/
            {MAX_IMAGES} used.
          </p>
        </FormSection>

        <FormSection
          title='Details'
          description='Shown in the product page tabs. Empty lists are hidden.'
        >
          <ListField
            label='Key benefits'
            items={formData.keyBenefits}
            onChange={setList('keyBenefits')}
            placeholder='e.g. Brightens dull skin'
            addLabel='Add benefit'
          />
          <ListField
            label='Key ingredients'
            items={formData.keyIngredients}
            onChange={setList('keyIngredients')}
            placeholder='e.g. Turmeric extract, Hyaluronic acid'
            addLabel='Add ingredient'
          />
          <ListField
            label='How to use'
            items={formData.howToUse}
            onChange={setList('howToUse')}
            placeholder='e.g. Apply 3–5 drops to clean skin'
            addLabel='Add step'
            numbered
          />
          <ListField
            label='Suitable for'
            hint='Skin types or concerns, e.g. Oily skin, All skin types.'
            items={formData.suitableFor}
            onChange={setList('suitableFor')}
            placeholder='e.g. All skin types'
            addLabel='Add skin type'
          />
        </FormSection>
      </FormBody>

      <FormFooter>
        {onCancel && (
          <Button variant='outline' type='button' onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type='submit' disabled={loading || uploading}>
          {loading && <Loader2 className='animate-spin' />}
          {product ? 'Save changes' : 'Create product'}
        </Button>
      </FormFooter>
    </form>
  );
};

export default ProductForm;
