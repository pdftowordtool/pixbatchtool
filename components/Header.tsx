'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ImageDown, Menu, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale } from '@/hooks/useLocale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { locale, t, localePath } = useLocale();
  const h = t.header;

  // Helper to check if path is active (works with locale prefix)
  const isActive = (path: string) => {
    const stripped = pathname.replace(/^\/(en|es|de|it)/, '');
    return stripped.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href={localePath('/')} className="flex items-center space-x-2.5">
            <div className="w-9 h-9 grid place-items-center text-white bg-blue-600 [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]">
              <ImageDown className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                PixBatch
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 leading-none mt-0.5">
                {h.bulkImageProcessing}
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-1">
            <Link
              href={localePath('/optimize-image')}
              className={`group relative px-4 py-2 text-sm font-medium transition-all uppercase tracking-wide overflow-hidden ${
                isActive('/optimize') ? 'text-white' : 'text-gray-700 dark:text-gray-300 hover:text-white'
              }`}
            >
              <span className={`absolute inset-0 transition-all ${
                isActive('/optimize') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`} style={{
                clipPath: 'polygon(6px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 3px 100%, 0 calc(100% - 3px), 0 6px)',
                backgroundColor: '#0E5E89'
              }} />
              <svg className={`absolute top-0 left-0 w-1.5 h-1.5 transition-opacity ${
                isActive('/optimize') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`} style={{ pointerEvents: 'none' }}>
                <path d="M 0 6 L 6 0 L 0 0 Z" className="fill-white dark:fill-gray-900" />
              </svg>
              <svg className={`absolute bottom-0 right-0 w-1.5 h-1.5 transition-opacity ${
                isActive('/optimize') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`} style={{ pointerEvents: 'none' }}>
                <path d="M 6 0 L 6 6 L 0 6 Z" className="fill-white dark:fill-gray-900" />
              </svg>
              <span className="relative z-10">{h.optimize}</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className={`group relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all uppercase tracking-wide overflow-hidden ${
                isActive('/compress') ? 'text-white' : 'text-gray-700 dark:text-gray-300 hover:text-white'
              }`}>
                <span className={`absolute inset-0 transition-all ${
                  isActive('/compress') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{
                  clipPath: 'polygon(6px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 3px 100%, 0 calc(100% - 3px), 0 6px)',
                  backgroundColor: '#0E5E89'
                }} />
                <svg className={`absolute top-0 left-0 w-1.5 h-1.5 transition-opacity ${
                  isActive('/compress') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{ pointerEvents: 'none' }}>
                  <path d="M 0 6 L 6 0 L 0 0 Z" className="fill-white dark:fill-gray-900" />
                </svg>
                <svg className={`absolute bottom-0 right-0 w-1.5 h-1.5 transition-opacity ${
                  isActive('/compress') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{ pointerEvents: 'none' }}>
                  <path d="M 6 0 L 6 6 L 0 6 Z" className="fill-white dark:fill-gray-900" />
                </svg>
                <span className="relative z-10">{h.compress}</span>
                <ChevronDown className="h-3.5 w-3.5 relative z-10" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={localePath('/compress-image')}>{h.imageCompressor}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/compress-png')}>{h.compressPng}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/compress-jpg')}>{h.compressJpg}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/compress-webp')}>{h.compressWebp}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className={`group relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all uppercase tracking-wide overflow-hidden ${
                isActive('/image-resizer') || isActive('/resize') ? 'text-white' : 'text-gray-700 dark:text-gray-300 hover:text-white'
              }`}>
                <span className={`absolute inset-0 transition-all ${
                  isActive('/image-resizer') || isActive('/resize') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{
                  clipPath: 'polygon(6px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 3px 100%, 0 calc(100% - 3px), 0 6px)',
                  backgroundColor: '#0E5E89'
                }} />
                <svg className={`absolute top-0 left-0 w-1.5 h-1.5 transition-opacity ${
                  isActive('/image-resizer') || isActive('/resize') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{ pointerEvents: 'none' }}>
                  <path d="M 0 6 L 6 0 L 0 0 Z" className="fill-white dark:fill-gray-900" />
                </svg>
                <svg className={`absolute bottom-0 right-0 w-1.5 h-1.5 transition-opacity ${
                  isActive('/image-resizer') || isActive('/resize') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{ pointerEvents: 'none' }}>
                  <path d="M 6 0 L 6 6 L 0 6 Z" className="fill-white dark:fill-gray-900" />
                </svg>
                <span className="relative z-10">{h.resize}</span>
                <ChevronDown className="h-3.5 w-3.5 relative z-10" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={localePath('/image-resizer')}>{h.imagesResizer}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/resize-png')}>{h.resizePng}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/resize-jpg')}>{h.resizeJpg}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/resize-webp')}>{h.resizeWebp}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className={`group relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all uppercase tracking-wide overflow-hidden ${
                isActive('/image-converter') || isActive('/png-converter') || isActive('/jpg-converter') || isActive('/webp-converter') ? 'text-white' : 'text-gray-700 dark:text-gray-300 hover:text-white'
              }`}>
                <span className={`absolute inset-0 transition-all ${
                  isActive('/image-converter') || isActive('/png-converter') || isActive('/jpg-converter') || isActive('/webp-converter') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{
                  clipPath: 'polygon(6px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 3px 100%, 0 calc(100% - 3px), 0 6px)',
                  backgroundColor: '#0E5E89'
                }} />
                <svg className={`absolute top-0 left-0 w-1.5 h-1.5 transition-opacity ${
                  isActive('/image-converter') || isActive('/png-converter') || isActive('/jpg-converter') || isActive('/webp-converter') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{ pointerEvents: 'none' }}>
                  <path d="M 0 6 L 6 0 L 0 0 Z" className="fill-white dark:fill-gray-900" />
                </svg>
                <svg className={`absolute bottom-0 right-0 w-1.5 h-1.5 transition-opacity ${
                  isActive('/image-converter') || isActive('/png-converter') || isActive('/jpg-converter') || isActive('/webp-converter') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{ pointerEvents: 'none' }}>
                  <path d="M 6 0 L 6 6 L 0 6 Z" className="fill-white dark:fill-gray-900" />
                </svg>
                <span className="relative z-10">{h.convert}</span>
                <ChevronDown className="h-3.5 w-3.5 relative z-10" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={localePath('/image-converter')}>{h.imageConverter}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/png-converter')}>{h.pngConverter}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/jpg-converter')}>{h.jpgConverter}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/webp-converter')}>{h.webpConverter}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className={`group relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all uppercase tracking-wide overflow-hidden ${
                isActive('/crop') ? 'text-white' : 'text-gray-700 dark:text-gray-300 hover:text-white'
              }`}>
                <span className={`absolute inset-0 transition-all ${
                  isActive('/crop') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{
                  clipPath: 'polygon(6px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 3px 100%, 0 calc(100% - 3px), 0 6px)',
                  backgroundColor: '#0E5E89'
                }} />
                <svg className={`absolute top-0 left-0 w-1.5 h-1.5 transition-opacity ${
                  isActive('/crop') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{ pointerEvents: 'none' }}>
                  <path d="M 0 6 L 6 0 L 0 0 Z" className="fill-white dark:fill-gray-900" />
                </svg>
                <svg className={`absolute bottom-0 right-0 w-1.5 h-1.5 transition-opacity ${
                  isActive('/crop') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{ pointerEvents: 'none' }}>
                  <path d="M 6 0 L 6 6 L 0 6 Z" className="fill-white dark:fill-gray-900" />
                </svg>
                <span className="relative z-10">{h.crop}</span>
                <ChevronDown className="h-3.5 w-3.5 relative z-10" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={localePath('/crop-image')}>{h.imageCropper}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/crop-png')}>{h.cropPng}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/crop-jpg')}>{h.cropJpg}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/crop-webp')}>{h.cropWebp}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="group relative flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-white transition-all uppercase tracking-wide overflow-hidden">
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all" style={{
                  clipPath: 'polygon(6px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 3px 100%, 0 calc(100% - 3px), 0 6px)',
                  backgroundColor: '#0E5E89'
                }} />
                <svg className="absolute top-0 left-0 w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ pointerEvents: 'none' }}>
                  <path d="M 0 6 L 6 0 L 0 0 Z" className="fill-white dark:fill-gray-900" />
                </svg>
                <svg className="absolute bottom-0 right-0 w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ pointerEvents: 'none' }}>
                  <path d="M 6 0 L 6 6 L 0 6 Z" className="fill-white dark:fill-gray-900" />
                </svg>
                <span className="relative z-10">{h.more}</span>
                <ChevronDown className="h-3.5 w-3.5 relative z-10" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={localePath('/exif-viewer')}>{h.exifViewer}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/remove-exif')}>{h.removeExif}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localePath('/rotate-flip-image')}>{h.rotateFlip}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
              >
                <span className="sr-only">{h.openMenu}</span>
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">{h.navMenu}</SheetTitle>
              <SheetDescription className="sr-only">
                {h.navMenuDesc}
              </SheetDescription>

              <div className="flex items-center space-x-2.5 mb-6">
                <div className="w-9 h-9 grid place-items-center text-white bg-blue-600 [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]">
                  <ImageDown className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                    PixBatch
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 leading-none mt-0.5">
                    {h.bulkImageProcessing}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <LanguageSwitcher currentLocale={locale} />
                </div>

                <Link
                  href={localePath('/optimize-image')}
                  className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {h.optimize.charAt(0) + h.optimize.slice(1).toLowerCase()}
                </Link>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="compress" className="border-none">
                    <AccordionTrigger className="px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg hover:no-underline">
                      {h.compress.charAt(0) + h.compress.slice(1).toLowerCase()}
                    </AccordionTrigger>
                    <AccordionContent className="pl-6 space-y-2 pt-2">
                      <Link href={localePath('/compress-image')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.imageCompressor}
                      </Link>
                      <Link href={localePath('/compress-png')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.compressPng}
                      </Link>
                      <Link href={localePath('/compress-jpg')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.compressJpg}
                      </Link>
                      <Link href={localePath('/compress-webp')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.compressWebp}
                      </Link>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="resize" className="border-none">
                    <AccordionTrigger className="px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg hover:no-underline">
                      {h.resize.charAt(0) + h.resize.slice(1).toLowerCase()}
                    </AccordionTrigger>
                    <AccordionContent className="pl-6 space-y-2 pt-2">
                      <Link href={localePath('/image-resizer')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.imagesResizer}
                      </Link>
                      <Link href={localePath('/resize-png')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.resizePng}
                      </Link>
                      <Link href={localePath('/resize-jpg')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.resizeJpg}
                      </Link>
                      <Link href={localePath('/resize-webp')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.resizeWebp}
                      </Link>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="convert" className="border-none">
                    <AccordionTrigger className="px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg hover:no-underline">
                      {h.convert.charAt(0) + h.convert.slice(1).toLowerCase()}
                    </AccordionTrigger>
                    <AccordionContent className="pl-6 space-y-2 pt-2">
                      <Link href={localePath('/image-converter')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.imageConverter}
                      </Link>
                      <Link href={localePath('/png-converter')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.pngConverter}
                      </Link>
                      <Link href={localePath('/jpg-converter')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.jpgConverter}
                      </Link>
                      <Link href={localePath('/webp-converter')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.webpConverter}
                      </Link>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="crop" className="border-none">
                    <AccordionTrigger className="px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg hover:no-underline">
                      {h.crop.charAt(0) + h.crop.slice(1).toLowerCase()}
                    </AccordionTrigger>
                    <AccordionContent className="pl-6 space-y-2 pt-2">
                      <Link href={localePath('/crop-image')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.imageCropper}
                      </Link>
                      <Link href={localePath('/crop-png')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.cropPng}
                      </Link>
                      <Link href={localePath('/crop-jpg')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.cropJpg}
                      </Link>
                      <Link href={localePath('/crop-webp')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.cropWebp}
                      </Link>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="more" className="border-none">
                    <AccordionTrigger className="px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg hover:no-underline">
                      {h.more.charAt(0) + h.more.slice(1).toLowerCase()}
                    </AccordionTrigger>
                    <AccordionContent className="pl-6 space-y-2 pt-2">
                      <Link href={localePath('/exif-viewer')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.exifViewer}
                      </Link>
                      <Link href={localePath('/remove-exif')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.removeExif}
                      </Link>
                      <Link href={localePath('/rotate-flip-image')} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        {h.rotateFlip}
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
        </div>
      </nav>

    </header>
  );
}
