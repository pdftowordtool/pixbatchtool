'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Upload, X, Download, CheckCircle, Zap, Shield, ImageIcon, HelpCircle, ChevronRight, ChevronDown, Camera, Trash2, ShieldCheck, Eye, EyeOff, Lock, FileImage, RotateCcw, AlertTriangle, MapPinOff, Info, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/hooks/useLocale'
import exifr from 'exifr'

import enDict from '@/dictionaries/en/remove-exif.json'
import esDict from '@/dictionaries/es/remove-exif.json'
import deDict from '@/dictionaries/de/remove-exif.json'
import itDict from '@/dictionaries/it/remove-exif.json'

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
}

interface ProcessedImage {
  original: File;
  originalUrl: string;
  cleanedUrl: string;
  cleanedBlob: Blob;
  originalSize: number;
  cleanedSize: number;
  exifRemoved: boolean;
  hasExif: boolean;
}

export default function RemoveExifPage() {
  const { locale, localePath } = useLocale();
  const t = dictionaries[locale] || enDict;
  const ui = t.ui;
  const faqs = t.faq.items;

  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [quality, setQuality] = useState(92);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setIsProcessing(true);

    for (const file of imageFiles) {
      try {
        // Check if file has EXIF data
        let hasExif = false;
        try {
          const exifData = await exifr.parse(file);
          hasExif = exifData && Object.keys(exifData).length > 0;
        } catch {
          hasExif = false;
        }

        // Create original URL
        const originalUrl = URL.createObjectURL(file);

        // Load image and redraw on canvas (this strips EXIF)
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = originalUrl;
        });

        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        ctx.drawImage(img, 0, 0);

        // Export as blob
        const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : outputFormat === 'png' ? 'image/png' : 'image/webp';
        const cleanedBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to create blob'));
            },
            mimeType,
            quality / 100
          );
        });

        const cleanedUrl = URL.createObjectURL(cleanedBlob);

        setImages(prev => [...prev, {
          original: file,
          originalUrl,
          cleanedUrl,
          cleanedBlob,
          originalSize: file.size,
          cleanedSize: cleanedBlob.size,
          exifRemoved: hasExif,
          hasExif
        }]);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    setIsProcessing(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [outputFormat, quality]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].originalUrl);
      URL.revokeObjectURL(newImages[index].cleanedUrl);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const clearAll = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.originalUrl);
      URL.revokeObjectURL(img.cleanedUrl);
    });
    setImages([]);
  };

  const downloadImage = (img: ProcessedImage) => {
    const a = document.createElement('a');
    a.href = img.cleanedUrl;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const baseName = img.original.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}_no-exif.${ext}`;
    a.click();
  };

  const downloadAll = () => {
    images.forEach(img => downloadImage(img));
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCleanedSize = images.reduce((sum, img) => sum + img.cleanedSize, 0);
  const imagesWithExif = images.filter(img => img.hasExif).length;

  const removedIcons = [MapPinOff, Camera, FileImage, EyeOff] as const;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href={localePath('/')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.breadcrumb.home}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">{t.breadcrumb.removeExif}</span>
        </nav>

        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {t.hero.title} <span className="text-blue-600">{t.hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400" style={{ fontSize: '1.1rem' }}>
            {t.hero.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className={`relative border-2 border-dashed transition-all duration-500 bg-white dark:bg-gray-800 ${
                isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02] shadow-xl'
                  : isHovering ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
              style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))', minHeight: images.length === 0 ? '320px' : '120px' }}
            >
              <svg className="absolute top-0 right-0 pointer-events-none" style={{ width: '20px', height: '20px' }}>
                <path d="M 0 0 L 20 0 L 20 20 Z" className={`transition-all duration-300 ${isDragging ? 'fill-blue-600' : isHovering ? 'fill-blue-500' : 'fill-gray-400 dark:fill-gray-600'}`} />
              </svg>
              <label className={`flex flex-col items-center justify-center cursor-pointer p-6 ${images.length === 0 ? 'min-h-[320px]' : 'min-h-[120px]'}`}>
                <div className={`${images.length === 0 ? 'w-16 h-16' : 'w-10 h-10'} bg-blue-600 flex items-center justify-center mb-4 transition-all duration-500 ${isDragging ? 'scale-110 rotate-6' : isHovering ? 'scale-105' : ''}`} style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
                  <Upload className={`${images.length === 0 ? 'w-8 h-8' : 'w-5 h-5'} text-white transition-transform duration-500 ${isDragging ? 'translate-y-[-4px]' : isHovering ? 'translate-y-[-2px]' : ''}`} strokeWidth={2} />
                </div>
                <p className={`${images.length === 0 ? 'text-lg' : 'text-sm'} font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wide`}>
                  {images.length === 0 ? ui.uploader.dropYourImagesHere : ui.uploader.addMoreImages}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{ui.uploader.orClickBrowseFiles}</p>
                {images.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">{ui.uploader.supportsHint}</p>
                )}
                <input type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
              </label>
            </div>

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-700 dark:text-blue-300 font-medium">{ui.processing.processingImages}</span>
              </div>
            )}

            {/* Image List */}
            {images.length > 0 && (
              <div className="space-y-3">
                {images.map((img, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 flex items-center gap-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                      <img src={img.cleanedUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{img.original.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {img.hasExif ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3" />
                            {ui.imageBadges.exifRemoved}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                            <Info className="w-3 h-3" />
                            {ui.imageBadges.noExifFound}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatSize(img.originalSize)} → {formatSize(img.cleanedSize)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => downloadImage(img)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                      <button onClick={() => removeImage(index)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="lg:col-span-5 space-y-4">
            {/* Output Format */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{ui.settings.outputFormat}</p>
              <div className="grid grid-cols-3 gap-2">
                {ui.settings.formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setOutputFormat(format.id as any)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      outputFormat === format.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    <span className="font-medium text-sm block">{format.label}</span>
                    <span className={`text-xs ${outputFormat === format.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>{format.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider (for lossy formats) */}
            {outputFormat !== 'png' && (
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{ui.settings.quality}</p>
                  <span className="text-sm font-medium text-blue-600">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>{ui.settings.smallerFile}</span>
                  <span>{ui.settings.betterQuality}</span>
                </div>
              </div>
            )}

            {/* What Gets Removed */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                {ui.removedData.title}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {ui.removedData.items.map((label, i) => {
                  const Icon = removedIcons[i] ?? MapPinOff;
                  return (
                    <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Icon className="w-4 h-4 text-red-500" />
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary & Actions */}
            {images.length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{ui.summary.totalImages}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{images.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{ui.summary.exifRemovedFrom}</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{imagesWithExif} {ui.summary.imagesWord}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{ui.summary.sizeChange}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatSize(totalOriginalSize)} → {formatSize(totalCleanedSize)}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={downloadAll} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 font-medium">
                    <Download className="w-4 h-4 mr-2" />{ui.summary.downloadAll}
                  </Button>
                  <Button onClick={clearAll} variant="outline" className="flex-1 border-gray-300 dark:border-gray-600 px-4 py-2.5 font-medium">
                    <RotateCcw className="w-4 h-4 mr-2" />{ui.summary.clearAll}
                  </Button>
                </div>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">{ui.privacyNotice.title}</p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">{ui.privacyNotice.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ui.features.items[0].title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.features.items[0].description}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ui.features.items[1].title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.features.items[1].description}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ui.features.items[2].title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.features.items[2].description}</p>
            </div>
          </div>
        </div>

        {/* How to Remove EXIF Metadata Section */}
        <div
          className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 p-8 relative transition-colors duration-300 group"
          style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
        >
          <svg className="absolute top-0 right-0 pointer-events-none transition-all duration-300" style={{ width: '20px', height: '20px' }}><path d="M 0 0 L 20 0 L 20 20 Z" className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400" /></svg>
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="text-blue-600 dark:text-blue-400" style={{ width: '1.5rem', height: '1.5rem' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{ui.howTo.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0"><div className="bg-blue-600 flex items-center justify-center text-white text-base font-bold relative" style={{ width: '2rem', height: '2rem', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>01</div></div>
              <div><h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>{ui.howTo.steps[0].title}</h3><p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.howTo.steps[0].description}</p></div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0"><div className="bg-blue-600 flex items-center justify-center text-white text-base font-bold relative" style={{ width: '2rem', height: '2rem', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>02</div></div>
              <div><h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>{ui.howTo.steps[1].title}</h3><p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.howTo.steps[1].description}</p></div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0"><div className="bg-blue-600 flex items-center justify-center text-white text-base font-bold relative" style={{ width: '2rem', height: '2rem', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>03</div></div>
              <div><h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>{ui.howTo.steps[2].title}</h3><p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.howTo.steps[2].description}</p></div>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed"><span className="font-semibold">{ui.howTo.tipLabel}</span> {ui.howTo.tipText}</p>
          </div>
        </div>

        {/* Why Remove EXIF / GPS Metadata? Section */}
        <div
          className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 p-8 relative transition-colors duration-300 group"
          style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
        >
          <svg className="absolute top-0 right-0 pointer-events-none transition-all duration-300" style={{ width: '20px', height: '20px' }}><path d="M 0 0 L 20 0 L 20 20 Z" className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400" /></svg>
          <div className="flex items-center gap-3 mb-6">
            <Info className="text-blue-600 dark:text-blue-400" style={{ width: '1.5rem', height: '1.5rem' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{ui.why.title}</h2>
          </div>
          <div className="space-y-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.why.paragraphs[0]}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.why.paragraphs[1]}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPinOff className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.why.bullets[0]}</p>
            </div>
            <div className="flex items-start gap-3">
              <EyeOff className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.why.bullets[1]}</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.why.bullets[2]}</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{ui.faqTitle}</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <h3 className="m-0 p-0 text-base">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`} />
                </button>
                </h3>
                {openFaqIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      
    </main>
  )
}
