import { useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomerFormSchema, type CustomerFormValues} from '@/lib/types/checkout';
import { ICartItem } from '@/lib/types/cart';

export function useCustomerForm(cartItems: ICartItem[]) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(CustomerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      shippingAddress: '',
      note: '',
      paymentMethod: 'COD'
    }
  });

  const [placing, setPlacing] = useState(false);
  const [paymentImage, setPaymentImage] = useState<File | null>(null);

  async function isFormValid() {
    const valid = await form.trigger();
    if (!valid) return false;
    if (!cartItems || cartItems.length === 0) return false;
    return true;
  }

  function resetForm() {
    form.reset();
    setPaymentImage(null);
  }

  return {
    form,
    placing,
    setPlacing,
    paymentImage,
    setPaymentImage,
    isFormValid,
    resetForm
  } as {
    form: UseFormReturn<CustomerFormValues>;
    placing: boolean;
    setPlacing: (_v: boolean) => void;
    paymentImage: File | null;
    setPaymentImage: (_f: File | null) => void;
    isFormValid: () => Promise<boolean>;
    resetForm: () => void;
  };
}