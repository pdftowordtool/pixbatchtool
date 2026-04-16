'use client';

import { Image, Maximize2, Crop, RotateCw, Layers, Zap, ImageIcon, Shield, Upload, Box, Globe } from 'lucide-react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const tools = [
  {
    title: 'Compress IMAGE',
    description: 'Reduce file size for JPG, PNG, SVG, and GIF without visible quality loss…',
    icon: Image,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    href: '/compress-image',
  },
  {
    title: 'Resize IMAGE',
    description: 'Resize by width/height or percentage. Maintain aspect ratio and choose fit…',
    icon: Maximize2,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    href: '/image-resizer',
  },
  {
    title: 'Crop IMAGE',
    description: 'Precisely crop to custom or preset ratios. Frame your subject or prepare…',
    icon: Crop,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    href: '/crop-image',
  },
  {
    title: 'Rotate & Flip IMAGE',
    description: 'Rotate by 90° steps and flip horizontally or vertically. Batch-process…',
    icon: RotateCw,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    href: '/rotate-flip-image',
  },
  {
    title: 'Convert IMAGE',
    description: 'Convert between JPG, PNG, WebP, GIF, and more. Batch support with automatic…',
    icon: Layers,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    href: '/image-converter',
  },
  {
    title: 'Optimize IMAGE',
    description: 'Automatically optimize images for web: smart compression, color profile…',
    icon: Zap,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    href: '/optimize-image',
  },
  {
    title: 'EXIF Viewer',
    description: 'View EXIF, IPTC, XMP, and GPS metadata from your images. Privacy-first…',
    icon: ImageIcon,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    href: '/exif-viewer',
  },
  {
    title: 'Remove EXIF',
    description: 'Remove EXIF metadata from your images for privacy. Batch processing supported…',
    icon: Shield,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    href: '/remove-exif',
  },
];

export default function Home() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:py-16">
        <div className="text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            Every tool you need to edit<br className="hidden lg:block" />
            <span className="text-blue-600"> images in bulk</span>
          </h1>
          <p className="mx-auto max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400" style={{ fontSize: '1.1rem' }}>
            Powerful browser-based image processing tools. Everything runs locally on your device. No uploads, complete privacy.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8" style={{ paddingBottom: '3rem' }}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group relative flex flex-col border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                borderRadius: '0'
              }}
            >
              <svg className="absolute top-0 right-0 w-4 h-4" style={{ pointerEvents: 'none' }}>
                <path d="M 0 0 L 16 0 L 16 16 Z" className="fill-gray-300 group-hover:fill-blue-500 transition-all duration-300" />
              </svg>

              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-lg ${tool.iconBg} mb-4 border border-gray-200/60 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                <tool.icon className={`h-7 w-7 ${tool.iconColor} transition-all duration-300 group-hover:scale-110`} strokeWidth={2} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300 group-hover:text-blue-600" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {tool.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              How It Works
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Simple, fast, and secure image processing in three easy steps
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-center gap-6 lg:gap-8 mb-10">
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Upload Your Images
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Drag and drop your files or click to browse. Support for all major formats up to 5MB per file.
              </p>
            </div>

            <div className="hidden md:block w-8 h-0.5 bg-gray-300 dark:bg-gray-600 flex-shrink-0 mt-10" />

            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-cyan-50 dark:bg-cyan-900/30 border-2 border-cyan-200 dark:border-cyan-800 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-cyan-600 dark:text-cyan-400" strokeWidth={2} />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Configure & Process
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Choose your settings and process images instantly in your browser. Everything happens on your device.
              </p>
            </div>

            <div className="hidden md:block w-8 h-0.5 bg-gray-300 dark:bg-gray-600 flex-shrink-0 mt-10" />

            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 flex items-center justify-center">
                  <Box className="w-8 h-8 text-green-600 dark:text-green-400" strokeWidth={2} />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Download Results
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Download processed images individually or as a ZIP archive. Results are ready instantly.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-gray-700 dark:text-gray-300">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium">Processing happens instantly in your browser</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Complete Privacy by Design
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                All processing happens locally in your browser. Your images never get uploaded to any server.
              </p>

              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-cyan-600 dark:text-cyan-400" strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Zero Upload Required
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Your images never leave your device. All processing happens locally in your browser using modern web APIs.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Offline Capable
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Once loaded, most tools work without an internet connection. Process your images anywhere, anytime.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Open Source Technology
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Built with modern web technologies and open standards. You can verify exactly how your images are processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-square bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <div className="text-center">
                  <Shield className="w-32 h-32 text-blue-600 dark:text-blue-400 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-base tracking-wider">
                    100% CLIENT-SIDE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Everything you need to know about PixBatch
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Do you upload my images to a server?</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  No. PixBatch processes images locally in your browser. Your files never leave your device.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>What are the upload limits?</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Up to 5MB per file and up to 10 images per batch (per upload).
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Which image formats are supported?</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Most tools support JPG/JPEG, PNG, WebP, AVIF, and GIF. Supported formats can vary slightly by tool.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Can I remove EXIF/metadata before sharing?</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Yes. Use our Remove EXIF tool (or the “Strip metadata” option where available) to remove EXIF/ICC metadata before downloading.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Does PixBatch work offline and on mobile?</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Yes. After the page loads, most tools can keep working without an internet connection, and everything runs on modern mobile and desktop browsers. Processing speed depends on your device.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
