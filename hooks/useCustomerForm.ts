// hooks/useCustomerForm.ts
import { useState } from 'react';
import { PaymentMethod } from '@/lib/enum/product';
import { toast } from 'sonner';
import { ICartItem } from '@/lib/types/cart';

export const useCustomerForm = (
  initialCart: ICartItem[],
  initialMethod: PaymentMethod = 'COD'
) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(initialMethod);
  const [paymentImage, setPaymentImage] = useState<File | null>(null);
  const [placing, setPlacing] = useState(false);

  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone: string) => /^(?:\+977)?9\d{9}$/.test(phone);

  const isFormValid = (cartItems: ICartItem[]) => {
    if (!name.trim()) return (toast.error('Name is required'), false);
    if (!phone.trim()) return (toast.error('Phone is required'), false);
    if (!isPhoneValid(phone.trim()))
      return (toast.error('Invalid phone number'), false);
    if (email && !isEmailValid(email.trim()))
      return (toast.error('Invalid email'), false);
    if (!shippingAddress.trim())
      return (toast.error('Shipping address is required'), false);
    if (paymentMethod === 'ONLINE' && !paymentImage)
      return (toast.error('Payment slip is required'), false);
    if (cartItems.length === 0) return (toast.error('Cart is empty'), false);
    return true;
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setShippingAddress('');
    setNote('');
    setPaymentMethod(initialMethod);
    setPaymentImage(null);
  };

  return {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    shippingAddress,
    setShippingAddress,
    note,
    setNote,
    paymentMethod,
    setPaymentMethod,
    paymentImage,
    setPaymentImage,
    placing,
    setPlacing,
    isFormValid,
    resetForm
  };
};
