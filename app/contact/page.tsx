'use client';

import { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/hooks/useLocale';

import enDict from '@/dictionaries/en/contact.json';
import esDict from '@/dictionaries/es/contact.json';
import deDict from '@/dictionaries/de/contact.json';
import itDict from '@/dictionaries/it/contact.json';

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
};

export default function Contact() {
  const { locale } = useLocale();
  const t = dictionaries[locale] || enDict;
  const emailHref = `mailto:${t.cards.emailValue}`;
  const phoneHref = `tel:${t.cards.phoneValue.replace(/\s+/g, '')}`;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert(t.form.successAlert);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:py-16">
        <div className="text-center space-y-8">
          <h1 className="font-bold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontSize: '3rem' }}>
            {t.hero.titlePrefix} <span className="text-blue-600">{t.hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400" style={{ fontSize: '1.1rem' }}>
            {t.hero.description}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.cards.emailTitle}
              </h3>
              <a href={emailHref} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {t.cards.emailValue}
              </a>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:border-cyan-500 hover:shadow-lg"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-cyan-600 dark:text-cyan-400" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.cards.phoneTitle}
              </h3>
              <a href={phoneHref} className="text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                {t.cards.phoneValue}
              </a>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:border-green-500 hover:shadow-lg"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.cards.visitTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.cards.visitValue}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.form.title}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.form.nameLabel}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t.form.namePlaceholder}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.form.emailLabel}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t.form.emailPlaceholder}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.form.subjectLabel}
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={t.form.subjectPlaceholder}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.form.messageLabel}
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t.form.messagePlaceholder}
                    className="w-full min-h-[150px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {t.form.submit}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
