'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Check,
  Clipboard,
  Earth,
  Facebook,
  Headphones,
  Instagram,
  Mail,
  Minus,
  Phone,
  Plus
} from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import {
  DESIGN_IMAGES,
  SOCIAL_LINKS,
  type ContactInfo
} from '@/lib/storefront-utils';
import type { Faq } from '@/lib/faqs';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
};

function SocialLinks({ light = false }: { light?: boolean }) {
  const tone = light
    ? 'text-[#E6F5DC] hover:text-[#F2C94C]'
    : 'text-[#56634F] hover:text-[#3A9712]';
  const links = [
    { href: SOCIAL_LINKS.instagram, label: 'Instagram', icon: Instagram },
    { href: SOCIAL_LINKS.facebook, label: 'Facebook', icon: Facebook }
  ];
  return (
    <nav aria-label='Social media' className='flex items-center gap-4'>
      {links.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          className={`${tone} transition-colors`}
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={label}
        >
          <Icon size={22} strokeWidth={1.7} />
        </a>
      ))}
      <a
        className={`${tone} transition-colors`}
        href={SOCIAL_LINKS.tiktok}
        target='_blank'
        rel='noopener noreferrer'
        aria-label='TikTok'
      >
        <SiTiktok size={20} />
      </a>
    </nav>
  );
}

function InfoCard({
  icon,
  title,
  email,
  phone,
  note
}: {
  icon: 'headset' | 'mail' | 'phone' | 'globe';
  title: string;
  email?: string;
  phone?: string;
  note: string;
}) {
  const [copied, setCopied] = useState(false);
  const Icon =
    icon === 'headset'
      ? Headphones
      : icon === 'mail'
        ? Mail
        : icon === 'phone'
          ? Phone
          : Earth;
  const value = email ?? phone;

  const copy = () => {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className='group rounded-2xl border border-[#DCE6D3] bg-white p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#44AB18]'>
      <Icon
        className='mb-5 text-[#3A9712]'
        size={28}
        strokeWidth={1.5}
        aria-hidden='true'
      />
      <h3 className='mb-2 font-sora text-base font-semibold text-[#17220F]'>
        {title}
      </h3>
      {value ? (
        <div className='mb-3 flex items-center gap-2'>
          <a
            className='break-all font-sora text-sm text-[#3A9712] underline-offset-4 hover:underline'
            href={email ? `mailto:${email}` : `tel:${value.replace(/\s+/g, '')}`}
          >
            {value}
          </a>
          <button
            className='relative min-h-11 min-w-11 shrink-0 rounded-full p-2 text-[#56634F] transition hover:text-[#3A9712] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A9712]'
            onClick={copy}
            aria-label={`Copy ${value}`}
            type='button'
          >
            <Clipboard size={19} strokeWidth={1.7} />
            {copied && (
              <span className='absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md bg-[#1E4E09] px-2 py-1 font-sora text-[11px] text-white'>
                ✓ Copied!
              </span>
            )}
          </button>
        </div>
      ) : (
        <>
          <p className='mb-3 font-sora text-sm text-[#56634F]'>
            Stay updated with new launches, tips and real customer stories.
          </p>
          <SocialLinks />
          <a
            className='mt-4 block font-sora text-[13px] font-semibold text-[#3A9712]'
            href={SOCIAL_LINKS.instagram}
            target='_blank'
            rel='noopener noreferrer'
          >
            {SOCIAL_LINKS.instagramHandle}
          </a>
        </>
      )}
      <p className='font-sora text-xs leading-relaxed text-[#56634F]'>{note}</p>
    </article>
  );
}

export default function ContactView({
  contact,
  faqs
}: {
  contact: ContactInfo;
  faqs: Faq[];
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const update = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setSent(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Something went wrong. Try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const sameEmail = contact.supportEmail === contact.generalEmail;

  return (
    <div className='cc-contact min-h-screen bg-[#F7FAF3] text-[#17220F]'>
      <main>
        <section
          className='grid min-h-[544px] lg:grid-cols-2'
          aria-labelledby='hero-title'
        >
          <div className='hero-image min-h-[480px] bg-[#ECF9E7] lg:min-h-0'>
            <img
              src={DESIGN_IMAGES.aloeModel}
              alt='Smiling woman holding Care & Clean Aloe Vera Gel'
              className='h-full w-full object-cover'
              fetchPriority='high'
            />
          </div>
          <div className='hero-copy flex items-center bg-[#F7FAF3] px-7 py-20 sm:px-14 lg:px-20'>
            <div className='max-w-xl'>
              <p className='mb-5 font-sora text-xs font-semibold uppercase tracking-[0.08em] text-[#3A9712]'>
                GET IN TOUCH
              </p>
              <h1
                id='hero-title'
                className='mb-6 font-fraunces text-[48px] leading-[1.1] text-[#17220F] sm:text-[56px]'
              >
                We&apos;d love to hear from you.
              </h1>
              <p className='mb-7 font-sora text-[17px] leading-8 text-[#56634F] sm:text-lg'>
                Whether it&apos;s a question about your order, a product query,
                or just a kind word — we&apos;re here for you.
              </p>
              <p className='font-sora text-xs text-[#3A9712]'>
                ⚡ Typically replies within 24 hours
              </p>
            </div>
          </div>
        </section>

        <section
          id='contact'
          className='mx-auto grid max-w-[1280px] gap-7 px-5 py-20 sm:px-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10 lg:py-28'
          aria-labelledby='contact-title'
        >
          <div className='form-card rounded-2xl border border-[#DCE6D3] bg-white p-6 sm:p-12'>
            <h2
              id='contact-title'
              className='mb-8 font-sora text-xl font-semibold'
            >
              Send Us a Message
            </h2>
            {sent ? (
              <div className='success-state flex min-h-[380px] flex-col items-center justify-center text-center'>
                <span className='mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ECF9E7] text-[#3A9712]'>
                  <Check size={32} strokeWidth={2} />
                </span>
                <p className='max-w-sm font-sora text-lg font-semibold text-[#3A9712]'>
                  Message sent! We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  type='button'
                  className='mt-6 font-sora text-xs font-semibold uppercase tracking-[0.08em] text-[#307D0F] underline underline-offset-4'
                  onClick={() => setSent(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className='space-y-5'>
                <label className='field-label'>
                  Full Name
                  <input
                    required
                    name='name'
                    autoComplete='name'
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder='Your name'
                  />
                </label>
                <label className='field-label'>
                  Email Address
                  <input
                    required
                    type='email'
                    name='email'
                    autoComplete='email'
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder='you@example.com'
                  />
                </label>
                <label className='field-label'>
                  <span>
                    Phone Number{' '}
                    <span className='font-normal text-[#56634F]'>
                      (optional)
                    </span>
                  </span>
                  <input
                    type='tel'
                    name='phone'
                    autoComplete='tel'
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder='+977 98XXXXXXXX'
                  />
                </label>
                <label className='field-label'>
                  Subject
                  <select
                    required
                    name='subject'
                    value={form.subject}
                    onChange={e => update('subject', e.target.value)}
                  >
                    <option value=''>Choose a subject</option>
                    <option>Order Inquiry</option>
                    <option>Product Query</option>
                    <option>General Enquiry</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className='field-label'>
                  Message
                  <textarea
                    required
                    rows={5}
                    name='message'
                    value={form.message}
                    onChange={e => update('message', e.target.value)}
                    placeholder='How can we help?'
                  />
                </label>
                <button
                  className='pill-button w-full bg-[#307D0F] text-white hover:bg-[#26630C]'
                  type='submit'
                  disabled={sending}
                >
                  {sending ? 'SENDING…' : 'SEND MESSAGE'}
                </button>
              </form>
            )}
          </div>
          <div className='space-y-5'>
            <InfoCard
              icon='headset'
              title='Customer Support'
              email={contact.supportEmail}
              note='For orders, returns and product queries.'
            />
            {sameEmail ? (
              <InfoCard
                icon='phone'
                title='Call or WhatsApp'
                phone={contact.phone}
                note='Sunday – Friday, 9:00 AM – 7:00 PM.'
              />
            ) : (
              <InfoCard
                icon='mail'
                title='General Enquiries'
                email={contact.generalEmail}
                note='For partnerships, press and everything else.'
              />
            )}
            <InfoCard icon='globe' title='Follow Us' note='' />
          </div>
        </section>

        <section
          className='bg-[#ECF9E7] px-5 py-20 sm:px-8 lg:py-28'
          aria-labelledby='faq-title'
        >
          <div className='mx-auto max-w-[760px]'>
            <h2
              id='faq-title'
              className='text-center font-fraunces text-[38px] leading-tight sm:text-[42px]'
            >
              Quick Answers
            </h2>
            <p className='mb-10 mt-3 text-center font-sora text-sm text-[#56634F] sm:text-base'>
              Have questions? We might already have the answer.
            </p>
            <div className='border-y border-[#DCE6D3]'>
              {faqs.map((faq, i) => {
                const open = i === openFaq;
                return (
                  <div
                    key={faq.id}
                    className='border-b border-[#DCE6D3] last:border-b-0'
                  >
                    <button
                      type='button'
                      className='flex min-h-[68px] w-full items-center justify-between gap-5 text-left font-sora text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A9712]'
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      aria-expanded={open}
                    >
                      <span>{faq.question}</span>
                      {open ? (
                        <Minus className='shrink-0 text-[#3A9712]' size={20} />
                      ) : (
                        <Plus className='shrink-0 text-[#3A9712]' size={20} />
                      )}
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <p className='min-h-0 overflow-hidden font-sora text-sm leading-7 text-[#56634F]'>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className='px-5 py-20 sm:px-8 lg:py-28'
          aria-label='Complete care'
        >
          <div className='relative mx-auto h-[400px] max-w-[820px] overflow-hidden rounded-[24px] bg-[#ECF9E7]'>
            <img
              src={DESIGN_IMAGES.moisturizerModel}
              alt='Smiling woman holding Care & Clean moisturizer'
              className='ken-burns h-full w-full object-cover'
              loading='lazy'
            />
            <div className='absolute inset-0 flex flex-col items-center justify-center bg-white/20 px-6 text-center'>
              <p className='max-w-xl font-fraunces text-[28px] italic leading-tight text-[#17220F] sm:text-[32px]'>
                Complete Care for Your Everyday Skincare Routine.
              </p>
              <Link
                href='/products'
                className='pill-button mt-7 bg-[#307D0F] text-white hover:bg-[#26630C]'
              >
                SHOP NOW
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
