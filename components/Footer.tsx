'use client';

import Link from 'next/link';
import { ImageDown, Twitter, Github, Linkedin, Mail, Zap, Maximize2, RotateCw, Crop as CropIcon, Image as ImageIcon } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';

export default function Footer() {
  const { t, localePath } = useLocale();
  const f = t.footer;

  return (
    <footer className="w-full bg-[#0F172B]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          <div className="space-y-5">
            <Link href={localePath('/')} className="flex items-center space-x-2.5">
              <div className="w-10 h-10 grid place-items-center text-white bg-blue-600 [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]">
                <ImageDown className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white leading-none">
                  PixBatch
                </span>
                <span className="text-xs text-gray-400 leading-none mt-1">
                  {f.bulkImageProcessing}
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              {f.description}
            </p>
            <div className="flex space-x-3">
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-gray-400 hover:bg-blue-500 hover:text-white transition-all duration-300">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-300">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="mailto:contact@pixbatch.com" className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-gray-400 hover:bg-cyan-500 hover:text-white transition-all duration-300">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-5">{f.tools}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={localePath('/optimize-image')} className="group flex items-center space-x-3 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  <div className="flex items-center justify-center rounded-lg bg-white/10 group-hover:bg-blue-500/20 transition-colors" style={{ width: '1.5rem', height: '1.5rem' }}>
                    <Zap className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span>{f.optimizeImage}</span>
                </Link>
              </li>
              <li>
                <Link href={localePath('/compress-image')} className="group flex items-center space-x-3 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  <div className="flex items-center justify-center rounded-lg bg-white/10 group-hover:bg-blue-500/20 transition-colors" style={{ width: '1.5rem', height: '1.5rem' }}>
                    <ImageIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span>{f.compressImage}</span>
                </Link>
              </li>
              <li>
                <Link href={localePath('/image-resizer')} className="group flex items-center space-x-3 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  <div className="flex items-center justify-center rounded-lg bg-white/10 group-hover:bg-blue-500/20 transition-colors" style={{ width: '1.5rem', height: '1.5rem' }}>
                    <Maximize2 className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span>{f.resizeImage}</span>
                </Link>
              </li>
              <li>
                <Link href={localePath('/image-converter')} className="group flex items-center space-x-3 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  <div className="flex items-center justify-center rounded-lg bg-white/10 group-hover:bg-blue-500/20 transition-colors" style={{ width: '1.5rem', height: '1.5rem' }}>
                    <RotateCw className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span>{f.convertImage}</span>
                </Link>
              </li>
              <li>
                <Link href={localePath('/crop-image')} className="group flex items-center space-x-3 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  <div className="flex items-center justify-center rounded-lg bg-white/10 group-hover:bg-blue-500/20 transition-colors" style={{ width: '1.5rem', height: '1.5rem' }}>
                    <CropIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span>{f.cropImage}</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-5">{f.company}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={localePath('/about')} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  {f.about}
                </Link>
              </li>
              <li>
                <Link href={localePath('/contact')} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  {f.contact}
                </Link>
              </li>
              <li>
                <Link href={localePath('/privacy-policy')} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  {f.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href={localePath('/terms')} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  {f.terms}
                </Link>
              </li>
              <li>
                <Link href={localePath('/disclaimer')} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  {f.disclaimer}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-5">{f.newsletter}</h3>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              {f.newsletterDesc}
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder={f.emailPlaceholder}
                className="w-full px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg transition-all duration-300"
              >
                {f.subscribe}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {f.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
