'use client';
import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

type CompanyInfo = {
  companyEmails?: string[]; // array from backend
  companyPhones?: string[]; // array from backend
  companyLocation?: string | null;
  updatedAt?: string;
};

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  // Fetch dynamic company info from API
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const res = await fetch('/api/companyinfo', { cache: 'force-cache' });
        const data = await res.json();
        console.log(data);

        if (res.ok && data.success && data.companyInfo) {
          setCompanyInfo(data.companyInfo);
        } else {
          console.error('Failed to fetch company info:', data.error || data);
        }
      } catch (err) {
        console.error('Error fetching company info:', err);
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Message sent successfully!');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        alert(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-start bg-gray-50 px-4 py-16'>
      <h1 className='mb-2 text-center text-4xl font-bold text-gray-800'>
        Get In Touch
      </h1>
      <p className='mb-8 max-w-lg text-center text-gray-600'>
        Have a question or feedback? We'd love to hear from you. Send us a
        message and we’ll respond as soon as possible.
      </p>

      <div className='mt-10 grid w-full max-w-6xl gap-8 md:grid-cols-3'>
        {/* Contact Form */}
        <div className='rounded-2xl bg-white p-6 shadow-md md:col-span-2'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <input
                type='text'
                name='name'
                value={form.name}
                onChange={handleChange}
                placeholder='Your Name'
                required
                className='w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-emerald-500'
              />
              <input
                type='email'
                name='email'
                value={form.email}
                onChange={handleChange}
                placeholder='Email Address'
                required
                className='w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-emerald-500'
              />
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <input
                type='tel'
                name='phone'
                value={form.phone}
                onChange={handleChange}
                placeholder='+977 98XXXXXXXX'
                className='w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-emerald-500'
              />
              <input
                type='text'
                name='subject'
                value={form.subject}
                onChange={handleChange}
                placeholder='How can we help?'
                className='w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-emerald-500'
              />
            </div>

            <textarea
              name='message'
              value={form.message}
              onChange={handleChange}
              rows={4}
              placeholder='Tell us more about your inquiry...'
              className='w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-emerald-500'
            />

            <button
              type='submit'
              className='flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-white transition-all hover:bg-emerald-700 sm:w-auto'
            >
              <Send size={16} /> Send Message
            </button>
          </form>
        </div>

        {/* Dynamic Contact Info */}
        <div className='space-y-4'>
          {/* Location */}
          <div className='rounded-2xl bg-white p-5 shadow-md'>
            <MapPin className='mb-2 text-[var(--primary)]' />
            <h3 className='font-semibold text-gray-800'>Visit Us</h3>
            <p className='text-sm text-gray-600'>
              {loadingInfo
                ? 'Loading...'
                : companyInfo?.companyLocation || 'Not available'}
            </p>
          </div>

          {/* Phones */}
          <div className='rounded-2xl bg-white p-5 shadow-md'>
            <Phone className='mb-2 text-[var(--primary)]' />
            <h3 className='font-semibold text-gray-800'>Call Us</h3>
            {loadingInfo ? (
              <p className='text-sm text-gray-600'>Loading...</p>
            ) : companyInfo?.companyPhones?.length ? (
              companyInfo.companyPhones.map((phone, idx) => (
                <p key={idx} className='text-sm text-gray-600'>
                  {phone}
                </p>
              ))
            ) : (
              <p className='text-sm text-gray-600'>Not available</p>
            )}
          </div>

          {/* Emails */}
          <div className='rounded-2xl bg-white p-5 shadow-md'>
            <Mail className='mb-2 text-[var(--primary)]' />
            <h3 className='font-semibold text-gray-800'>Email Us</h3>
            {loadingInfo ? (
              <p className='text-sm text-gray-600'>Loading...</p>
            ) : companyInfo?.companyEmails?.length ? (
              companyInfo.companyEmails.map((email, idx) => (
                <p key={idx} className='text-sm text-gray-600'>
                  {email}
                </p>
              ))
            ) : (
              <p className='text-sm text-gray-600'>Not available</p>
            )}
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className='mt-12 w-full max-w-4xl rounded-2xl bg-[var(--primary)] p-8 text-center text-white'>
        <Clock className='mx-auto mb-3' size={32} />
        <h2 className='mb-2 text-xl font-semibold'>Business Hours</h2>
        <p>Sunday - Friday: 9:00 AM - 7:00 PM</p>
        <p>Saturday: Closed</p>
      </div>
    </div>
  );
}
