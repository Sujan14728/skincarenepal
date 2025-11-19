'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css';
import { ProductStatus } from '@/lib/enum/product';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
});

interface Product {
  id?: number;
  name: string;
  excerpt?: string;
  description?: string | null;
  keyBenefits: string[];
  keyIngredients: string[]; // Added
  howToUse: string[]; // Added
  suitableFor: string[]; // Added
  price: number;
  salePrice?: number | null;
  stock: number;
  images: string[];
  status: ProductStatus;
}

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
}

const ProductForm = ({ product, onSuccess }: ProductFormProps) => {
  const [formData, setFormData] = useState<Product>({
    name: product?.name || '',
    excerpt: product?.excerpt || '',
    description: product?.description || '',
    keyBenefits: product?.keyBenefits || [],
    keyIngredients: product?.keyIngredients || [], // Initialize
    howToUse: product?.howToUse || [], // Initialize
    suitableFor: product?.suitableFor || [], // Initialize
    price: product?.price || 0,
    salePrice: product?.salePrice || undefined,
    stock: product?.stock || 0,
    images: product?.images || [],
    status: product?.status || 'IN_STOCK'
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    field: keyof Product,
    value: string | number | string[] | undefined
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  // --- Dynamic List Handlers ---

  const createListHandlers = (
    fieldName: 'keyBenefits' | 'keyIngredients' | 'howToUse' | 'suitableFor'
  ) => {
    const handleChange = (index: number, value: string) => {
      const updated = [...formData[fieldName]];
      updated[index] = value;
      setFormData(prev => ({ ...prev, [fieldName]: updated }));
    };

    const addItem = () => {
      setFormData(prev => ({ ...prev, [fieldName]: [...prev[fieldName], ''] }));
    };

    const removeItem = (index: number) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    };
    return { handleChange, addItem, removeItem };
  };

  const benefitsHandlers = createListHandlers('keyBenefits');
  const ingredientsHandlers = createListHandlers('keyIngredients');
  const howToUseHandlers = createListHandlers('howToUse');
  const suitableForHandlers = createListHandlers('suitableFor');

  // --- Image Handlers (Unchanged) ---

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

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
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

  // --- Submission Handler (Unchanged) ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0) {
      toast.error('Please provide product name and valid price');
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
        toast.success(
          `Product ${product ? 'updated' : 'created'} successfully`
        );
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Basic Information */}
      <div className='space-y-4'>
        {/* Name Input */}
        <div>
          <Label htmlFor='name'>Product Name *</Label>
          <Input
            id='name'
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            placeholder='Enter product name'
            required
          />
        </div>

        {/* Excerpt Input */}
        <div>
          <Label htmlFor='excerpt'>Excerpt</Label>
          <Input
            id='excerpt'
            value={formData.excerpt}
            onChange={e => handleInputChange('excerpt', e.target.value)}
            placeholder='Short description'
          />
        </div>

        {/* Description Rich Editor */}
        <div>
          <Label htmlFor='description'>Description</Label>
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
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Key Benefits (Original) */}
        <div className='space-y-2'>
          <Label>Key Benefits</Label>
          {formData.keyBenefits.map((benefit, idx) => (
            <div key={idx} className='flex items-center space-x-2'>
              <Input
                value={benefit}
                onChange={e =>
                  benefitsHandlers.handleChange(idx, e.target.value)
                }
                placeholder='Enter benefit'
              />
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={() => benefitsHandlers.removeItem(idx)}
              >
                <X className='h-3 w-3' />
              </Button>
            </div>
          ))}
          <Button
            type='button'
            onClick={benefitsHandlers.addItem}
            variant='outline'
            className='mt-2'
          >
            Add Benefit
          </Button>
        </div>

        {/* Key Ingredients (ADDED) */}
        <div className='space-y-2'>
          <Label>Key Ingredients</Label>
          {formData.keyIngredients.map((ingredient, idx) => (
            <div key={idx} className='flex items-center space-x-2'>
              <Input
                value={ingredient}
                onChange={e =>
                  ingredientsHandlers.handleChange(idx, e.target.value)
                }
                placeholder='e.g., Turmeric Extract, Hyaluronic Acid'
              />
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={() => ingredientsHandlers.removeItem(idx)}
              >
                <X className='h-3 w-3' />
              </Button>
            </div>
          ))}
          <Button
            type='button'
            onClick={ingredientsHandlers.addItem}
            variant='outline'
            className='mt-2'
          >
            Add Ingredient
          </Button>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* How To Use (ADDED) */}
        <div className='space-y-2'>
          <Label>How To Use Steps</Label>
          {formData.howToUse.map((step, idx) => (
            <div key={idx} className='flex items-center space-x-2'>
              <span className='text-sm font-medium text-gray-500'>
                {idx + 1}.
              </span>
              <Input
                value={step}
                onChange={e =>
                  howToUseHandlers.handleChange(idx, e.target.value)
                }
                placeholder='e.g., Apply 3-5 drops to face...'
              />
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={() => howToUseHandlers.removeItem(idx)}
              >
                <X className='h-3 w-3' />
              </Button>
            </div>
          ))}
          <Button
            type='button'
            onClick={howToUseHandlers.addItem}
            variant='outline'
            className='mt-2'
          >
            Add Step
          </Button>
        </div>

        {/* Suitable For (ADDED) */}
        <div className='space-y-2'>
          <Label>Suitable For (Skin Types/Concerns)</Label>
          {formData.suitableFor.map((tag, idx) => (
            <div key={idx} className='flex items-center space-x-2'>
              <Input
                value={tag}
                onChange={e =>
                  suitableForHandlers.handleChange(idx, e.target.value)
                }
                placeholder='e.g., Dull Skin, All Skin Types'
              />
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={() => suitableForHandlers.removeItem(idx)}
              >
                <X className='h-3 w-3' />
              </Button>
            </div>
          ))}
          <Button
            type='button'
            onClick={suitableForHandlers.addItem}
            variant='outline'
            className='mt-2'
          >
            Add Tag
          </Button>
        </div>
      </div>

      {/* --- Pricing and Stock (Unchanged) --- */}
      <div className='space-y-4'>
        <div className='grid grid-cols-3 gap-4'>
          <div>
            <Label htmlFor='price'>Price (Rs) *</Label>
            <Input
              id='price'
              type='number'
              value={formData.price}
              onChange={e =>
                handleInputChange('price', parseInt(e.target.value) || 0)
              }
              placeholder='0'
              min='0'
              required
            />
          </div>

          <div>
            <Label htmlFor='salePrice'>Sale Price (Rs)</Label>
            <Input
              id='salePrice'
              type='number'
              value={formData.salePrice || ''}
              onChange={e => {
                const value = e.target.value;
                handleInputChange(
                  'salePrice',
                  value ? parseInt(value) : undefined
                );
              }}
              placeholder='0'
              min='0'
            />
            <p className='text-muted-foreground mt-1 text-xs'>
              Leave empty if no sale price
            </p>
          </div>

          <div>
            <Label htmlFor='stock'>Stock Quantity *</Label>
            <Input
              id='stock'
              type='number'
              value={formData.stock}
              onChange={e =>
                handleInputChange('stock', parseInt(e.target.value) || 0)
              }
              placeholder='0'
              min='0'
              required
            />
          </div>
        </div>
      </div>

      {/* --- Images (Unchanged) --- */}
      <div className='space-y-4'>
        <Label>Product Images</Label>

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileSelect}
          className='hidden'
        />

        <div className='grid grid-cols-3 gap-4'>
          {formData.images.map((image, index) => (
            <div key={index} className='relative'>
              <Image
                height={96}
                width={96}
                src={image}
                alt={`Product ${index + 1}`}
                className='h-24 w-full rounded border object-cover'
              />
              <Button
                type='button'
                onClick={() => removeImage(index)}
                size='sm'
                variant='destructive'
                className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0'
              >
                <X className='h-3 w-3' />
              </Button>
            </div>
          ))}

          {formData.images.length < 5 && (
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className='flex h-24 w-full items-center justify-center rounded border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400'
            >
              {uploading ? (
                <div className='h-6 w-6 animate-spin rounded-full border-b-2 border-gray-600'></div>
              ) : (
                <Upload className='h-6 w-6 text-gray-400' />
              )}
            </button>
          )}
        </div>
        <p className='text-muted-foreground text-xs'>
          Upload up to 5 images. Supported formats: JPG, PNG (max 5MB each)
        </p>
      </div>

      <div className='flex items-center gap-4'>
        <Label htmlFor='status'>Product Status:</Label>
        <Select
          value={formData.status}
          onValueChange={value => handleInputChange('status', value)}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select status' />
          </SelectTrigger>

          <SelectContent>
            {Object.values(ProductStatus).map(status => (
              <SelectItem key={status} value={status}>
                {status.replaceAll('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <div className='flex justify-end space-x-2'>
        <Button type='submit' disabled={loading || uploading}>
          {loading
            ? 'Saving...'
            : product
              ? 'Update Product'
              : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
