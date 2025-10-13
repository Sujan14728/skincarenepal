'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
import ProductForm from '@/components/dashboard/ProductForm';
import Image from 'next/image';
import { Product } from '@/lib/types/product';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0,
    featured: 0
  });

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        calculateStats(data);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate statistics
  const calculateStats = (productList: Product[]) => {
    const stats = {
      total: productList.length,
      active: productList.length, // All products are considered active in your schema
      outOfStock: productList.filter(p => p.stock === 0).length,
      featured: 0 // No featured field in your schema
    };
    setStats(stats);
  };

  // Delete product
  const handleDelete = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        fetchProducts(); // Refresh the list
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    fetchProducts();
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Products</h1>
          <p className='text-muted-foreground'>
            Manage your product inventory and details
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className='max-h-[90vh] !max-w-[60vw] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Products
            </CardTitle>
            <Package className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Products
            </CardTitle>
            <TrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Out of Stock</CardTitle>
            <ShoppingCart className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className='pt-6'>
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
            <Input
              placeholder='Search products by name, category, or tags...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-8'
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex justify-center py-8'>
              <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className='flex items-center space-x-3'>
                        {product.images[0] && (
                          <Image
                            height={40}
                            width={40}
                            src={product.images[0]}
                            alt={product.name}
                            className='h-10 w-10 rounded object-cover'
                          />
                        )}
                        <div>
                          <div className='font-medium'>{product.name}</div>
                          {product.description && (
                            <div className='text-muted-foreground text-sm'>
                              {product.description.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className='font-medium'>
                          {formatPrice(product.price)}
                        </div>
                        {product.salePrice &&
                          product.salePrice < product.price && (
                            <div className='text-muted-foreground text-sm line-through'>
                              {formatPrice(product.salePrice)}
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          product.stock <= 10
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end space-x-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Product
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;
                                {product.name}&quot;? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id)}
                                className='bg-red-600 hover:bg-red-700'
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className='py-8 text-center'>
              <Package className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-medium text-gray-900'>
                No products
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                {searchTerm
                  ? 'No products match your search.'
                  : 'Get started by creating a new product.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className='max-h-[90vh] !max-w-[60vw] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
