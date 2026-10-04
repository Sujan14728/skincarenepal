'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/dashboard/form';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (process.env.NODE_ENV === 'production') return notFound();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      setLoading(false);

      if (res.ok) {
        toast.success('Admin account created');
        router.push('/dashboard/login');
      } else {
        const data = await res.json();
        const message = data.error || 'Registration failed';
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      setLoading(false);
      setError(
        'We could not reach the server. Check your connection and try again.'
      );
      toast.error('Server error');
      console.error(err);
    }
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <span className='w-fit rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground'>
          Development only
        </span>
        <h2 className='font-display text-[28px] font-semibold leading-tight tracking-tight text-foreground'>
          Create an admin account
        </h2>
        <p className='text-sm text-muted-foreground'>
          This page is disabled in production.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        {error && (
          <div
            role='alert'
            className='flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive'
          >
            <AlertCircle className='mt-0.5 size-4 shrink-0' aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <Field label='Name' htmlFor='name' optional>
          <Input
            id='name'
            type='text'
            autoComplete='name'
            placeholder='Admin name'
            value={name}
            onChange={e => setName(e.target.value)}
            className='h-10'
          />
        </Field>

        <Field label='Email' htmlFor='email'>
          <Input
            id='email'
            type='email'
            autoComplete='email'
            placeholder='admin@example.com'
            value={email}
            onChange={e => setEmail(e.target.value)}
            aria-invalid={!!error || undefined}
            className='h-10'
            required
          />
        </Field>

        <Field label='Password' htmlFor='password'>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='new-password'
              placeholder='••••••••'
              value={password}
              onChange={e => setPassword(e.target.value)}
              aria-invalid={!!error || undefined}
              className='h-10 pr-10'
              required
            />
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              className='absolute right-1 top-1 text-muted-foreground hover:text-foreground'
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        </Field>

        <Button
          type='submit'
          size='lg'
          className='mt-1 w-full'
          disabled={loading}
        >
          {loading && <Loader2 className='animate-spin' />}
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className='text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link
          href='/dashboard/login'
          className='font-medium text-primary underline-offset-4 hover:underline'
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
