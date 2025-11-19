// components/product/ProductTabs.tsx
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/lib/types/product';
import { LuCheck, LuLeaf } from 'react-icons/lu';

// Note: Replace 'any' with your actual Product type from Prisma
interface ProductTabsProps {
  product: Product;
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  return (
    <div className='mt-12 rounded-lg p-4 shadow-lg'>
      <Tabs defaultValue='description' className='w-full'>
        <TabsList className='h-12 w-full justify-start rounded-none bg-transparent p-0'>
          <TabsTrigger
            value='description'
            className='data-[state=active]:border-primary data-[state=active]:text-primary h-full w-fit rounded-none border-0 border-b-2 border-transparent text-sm font-medium text-black !shadow-none transition-none data-[state=active]:bg-transparent md:text-lg'
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value='benefits'
            className='data-[state=active]:border-primary data-[state=active]:text-primary h-full w-fit rounded-none border-0 border-b-2 border-transparent text-sm font-medium text-black !shadow-none transition-none data-[state=active]:bg-transparent md:text-lg'
          >
            Benefits & Ingredients
          </TabsTrigger>
          <TabsTrigger
            value='how-to-use'
            className='data-[state=active]:border-primary data-[state=active]:text-primary h-full w-fit rounded-none border-0 border-b-2 border-transparent text-sm font-medium text-black !shadow-none transition-none data-[state=active]:bg-transparent md:text-lg'
          >
            How to Use
          </TabsTrigger>
        </TabsList>

        <TabsContent value='description' className='pt-6'>
          {product.description ? (
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          ) : (
            <p className='text-gray-500'>No description available.</p>
          )}
        </TabsContent>
        <TabsContent value='benefits' className='pt-6'>
          <div className='grid gap-8 md:grid-cols-2'>
            {/* Key Ingredients Column */}
            <div>
              <h3 className='mb-4 text-xl font-bold text-gray-900'>
                Key Ingredients
              </h3>
              <ul className='text-muted-foreground space-y-5'>
                {/* Dynamically render ingredients */}
                {product.keyIngredients?.length > 0 ? (
                  product.keyIngredients?.map((ingredient, index) => (
                    <li
                      key={index}
                      className='text-muted-foreground flex items-center gap-3'
                    >
                      <LuLeaf className='inline-block h-6 w-6 flex-shrink-0 text-green-600' />
                      {ingredient}
                    </li>
                  ))
                ) : (
                  <p className='text-gray-500 italic'>No ingredients listed.</p>
                )}
              </ul>
            </div>

            {/* Key Benefits Column */}
            <div>
              <h3 className='mb-4 text-xl font-bold text-gray-900'>
                Key Benefits
              </h3>
              <ul className='text-muted-foreground space-y-5'>
                {/* Dynamically render benefits */}
                {product.keyBenefits?.length > 0 ? (
                  product.keyBenefits?.map((benefit, index) => (
                    <li
                      key={index}
                      className='text-muted-foreground flex items-center gap-3'
                    >
                      <Badge variant='default' className='rounded-full p-2'>
                        <LuCheck className='text-primary h-8 w-8' />
                      </Badge>
                      <span>{benefit}</span>
                    </li>
                  ))
                ) : (
                  <p className='text-gray-500 italic'>No benefits listed.</p>
                )}
              </ul>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='how-to-use' className='pt-6'>
          {product.howToUse?.length > 0 ? (
            <div>
              <h3 className='mb-4 text-xl font-bold text-gray-900'>
                How to Use
              </h3>
              <ul className='text-muted-foreground space-y-5'>
                {product.howToUse?.map((step, index) => (
                  <li
                    key={index}
                    className='text-md ml-4 flex items-center gap-2'
                  >
                    <Badge variant='green' className='h-6 w-6 rounded-full p-2'>
                      <span className='text-md font-bold'>{index + 1}</span>
                    </Badge>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className='text-gray-500'>No instructions available.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductTabs;
