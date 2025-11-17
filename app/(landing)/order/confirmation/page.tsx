// Server component: parse query parameters via searchParams prop.
type QueryMap = Record<string, string | string[] | undefined>;

export default async function OrderConfirmation({
  searchParams
}: {
  searchParams?: Promise<QueryMap>;
}) {
  const resolved: QueryMap = searchParams ? await searchParams : {};
  const status =
    typeof resolved.status === 'string'
      ? resolved.status
      : Array.isArray(resolved.status)
        ? resolved.status[0]
        : undefined;
  const orderNumber =
    typeof resolved.orderNumber === 'string'
      ? resolved.orderNumber
      : Array.isArray(resolved.orderNumber)
        ? resolved.orderNumber[0]
        : undefined;
  const message =
    typeof resolved.message === 'string'
      ? resolved.message
      : Array.isArray(resolved.message)
        ? resolved.message[0]
        : undefined;

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <div className='mx-auto mt-20 max-w-xl rounded-md border p-6 text-center shadow'>
        {status === 'success' ? (
          <>
            <h1 className='mb-2 text-2xl font-bold'>Order Confirmed!</h1>
            <p className='mb-4'>
              Your order {orderNumber} has been successfully confirmed.
            </p>
            <p>Thank you for shopping with us!</p>
          </>
        ) : (
          <>
            <h1 className='mb-2 text-2xl font-bold text-red-600'>Oops!</h1>
            <p className='mb-4'>
              {message || 'Something went wrong while confirming your order.'}
            </p>
            <a href='/checkout' className='text-blue-600 underline'>
              Go back to checkout
            </a>
          </>
        )}
      </div>
    </div>
  );
}
