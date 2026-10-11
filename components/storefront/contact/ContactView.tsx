'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Check,
  Clipboard,
  Clock,
  Earth,
  Facebook,
  Headphones,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
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
  icon: Icon,
  title,
  email,
  phone,
  text,
  note,
  children
}: {
  icon: typeof Mail;
  title: string;
  email?: string;
  phone?: string;
  text?: string;
  note?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const value = email ?? phone;

  const copy = () => {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className='flex gap-4 rounded-2xl border border-[#DCE6D3] bg-white p-5 transition duration-300 hover:border-[#44AB18] sm:p-6'>
      <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E3F1D6] text-[#307D0F]'>
        <Icon size={20} strokeWidth={1.7} aria-hidden='true' />
      </span>
      <div className='min-w-0 flex-1'>
        <h3 className='font-sora mb-1 text-[15px] font-semibold text-[#17220F]'>
          {title}
        </h3>
        {value && (
          <div className='flex items-center gap-1'>
            <a
              className='font-sora break-all text-sm font-medium text-[#307D0F] underline-offset-4 hover:underline'
              href={
                email ? `mailto:${email}` : `tel:${value.replace(/\s+/g, '')}`
              }
            >
              {value}
            </a>
            <button
              className='relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#56634F] transition hover:text-[#3A9712] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A9712]'
              onClick={copy}
              aria-label={`Copy ${value}`}
              type='button'
            >
              <Clipboard size={17} strokeWidth={1.7} />
              {copied && (
                <span className='font-sora absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md bg-[#1E4E09] px-2 py-1 text-[11px] text-white'>
                  ✓ Copied!
                </span>
              )}
            </button>
          </div>
        )}
        {text && (
          <p className='font-sora text-sm font-medium text-[#17220F]'>{text}</p>
        )}
        {children}
        {note && (
          <p className='font-sora mt-1 text-xs leading-relaxed text-[#56634F]'>
            {note}
          </p>
        )}
      </div>
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
          className='mx-auto grid max-w-[1280px] items-center gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-20 lg:pt-16'
          aria-labelledby='hero-title'
        >
          <div className='hero-copy order-2 lg:order-1'>
            <p className='font-sora mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#3A9712]'>
              GET IN TOUCH
            </p>
            <h1
              id='hero-title'
              className='font-fraunces mb-5 text-[40px] leading-[1.08] text-[#17220F] sm:text-[52px] lg:text-[58px]'
            >
              We&apos;d love to hear from you.
            </h1>
            <p className='font-sora mb-8 max-w-[520px] text-base leading-7 text-[#56634F] sm:text-[17px] sm:leading-8'>
              A question about your order, help choosing the right product, or
              just a kind word — reach us whichever way suits you.
            </p>
            <div className='flex flex-wrap gap-3'>
              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className='pill-button gap-2 bg-[#307D0F] text-white hover:bg-[#26630C]'
              >
                <Phone size={16} /> CALL US
              </a>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target='_blank'
                rel='noopener noreferrer'
                className='pill-button gap-2 border border-[#307D0F] text-[#307D0F] hover:bg-[#307D0F] hover:text-white'
              >
                <MessageCircle size={16} /> WHATSAPP
              </a>
              <a
                href={`mailto:${contact.supportEmail}`}
                className='pill-button gap-2 border border-[#DCE6D3] bg-white text-[#17220F] hover:border-[#307D0F]'
              >
                <Mail size={16} /> EMAIL
              </a>
            </div>
            <p className='font-sora mt-6 flex items-center gap-2 text-xs text-[#56634F]'>
              <Clock size={14} className='shrink-0 text-[#3A9712]' />
              Typically replies within 24 hours · Sunday – Friday, 9 AM – 7 PM
            </p>
          </div>
          <div className='hero-image order-1 h-[300px] overflow-hidden rounded-[28px] bg-[#ECF9E7] sm:h-[420px] lg:order-2 lg:h-[520px]'>
            <img
              src={DESIGN_IMAGES.aloeModel}
              alt='Smiling woman holding Care & Clean Aloe Vera Gel'
              className='h-full w-full object-cover object-[50%_30%]'
              fetchPriority='high'
            />
          </div>
        </section>

        <section
          id='contact'
          className='mx-auto grid max-w-[1280px] items-start gap-6 px-5 pb-20 sm:px-8 lg:grid-cols-[1.45fr_1fr] lg:gap-8 lg:pb-28'
          aria-labelledby='contact-title'
        >
          <div className='form-card rounded-2xl border border-[#DCE6D3] bg-white p-6 sm:p-10'>
            <h2
              id='contact-title'
              className='font-sora mb-8 text-xl font-semibold'
            >
              Send Us a Message
            </h2>
            {sent ? (
              <div className='success-state flex min-h-[380px] flex-col items-center justify-center text-center'>
                <span className='mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ECF9E7] text-[#3A9712]'>
                  <Check size={32} strokeWidth={2} />
                </span>
                <p className='font-sora max-w-sm text-lg font-semibold text-[#3A9712]'>
                  Message sent! We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  type='button'
                  className='font-sora mt-6 text-xs font-semibold uppercase tracking-[0.08em] text-[#307D0F] underline underline-offset-4'
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
          <div className='grid gap-4 sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2 lg:grid-cols-1 lg:[&>*:last-child:nth-child(odd)]:col-span-1'>
            <InfoCard
              icon={Phone}
              title='Call or WhatsApp'
              phone={contact.phone}
              note='Sunday – Friday, 9:00 AM – 7:00 PM.'
            />
            <InfoCard
              icon={Headphones}
              title='Customer Support'
              email={contact.supportEmail}
              note='Orders, returns and product questions.'
            />
            {!sameEmail && (
              <InfoCard
                icon={Mail}
                title='General Enquiries'
                email={contact.generalEmail}
                note='Partnerships, press and everything else.'
              />
            )}
            <InfoCard icon={MapPin} title='Find Us' text={contact.location} />
            <InfoCard
              icon={Earth}
              title='Follow Us'
              note='New launches, skincare tips and our “Ask Care & Clean” series.'
            >
              <div className='mt-2 flex flex-wrap items-center gap-4'>
                <SocialLinks />
                <a
                  className='font-sora text-[13px] font-semibold text-[#3A9712]'
                  href={SOCIAL_LINKS.instagram}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  @{SOCIAL_LINKS.instagramHandle}
                </a>
              </div>
            </InfoCard>
          </div>
        </section>

        <section
          className='bg-[#E3F1D6] px-5 py-16 sm:px-8 lg:py-24'
          aria-labelledby='faq-title'
        >
          <div className='mx-auto max-w-[760px]'>
            <h2
              id='faq-title'
              className='font-fraunces text-center text-[38px] leading-tight sm:text-[42px]'
            >
              Quick Answers
            </h2>
            <p className='font-sora mb-10 mt-3 text-center text-sm text-[#56634F] sm:text-base'>
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
                      className='font-sora flex min-h-[68px] w-full items-center justify-between gap-5 text-left text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A9712]'
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
                      <p className='font-sora min-h-0 overflow-hidden text-sm leading-7 text-[#56634F]'>
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
          className='px-5 py-16 sm:px-8 lg:py-24'
          aria-label='Complete care'
        >
          <div className='mx-auto grid max-w-[1080px] items-center overflow-hidden rounded-[28px] bg-[#ECF9E7] md:grid-cols-2'>
            <div className='h-[280px] overflow-hidden md:h-[380px]'>
              <img
                src={DESIGN_IMAGES.moisturizerModel}
                alt='Smiling woman holding Care & Clean moisturizer'
                className='ken-burns h-full w-full object-cover object-[50%_25%]'
                loading='lazy'
              />
            </div>
            <div className='px-7 py-10 text-center md:px-12 md:text-left'>
              <p className='font-sora mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#3A9712]'>
                The complete routine
              </p>
              <p className='font-fraunces text-[30px] leading-tight text-[#17220F] sm:text-[36px]'>
                Complete care for your everyday skincare routine.
              </p>
              <Link
                href='/routine'
                className='pill-button mt-7 bg-[#307D0F] text-white hover:bg-[#26630C]'
              >
                SHOP THE COMBO
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
