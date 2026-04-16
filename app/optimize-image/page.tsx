'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, Download, Zap, FileImage, CircleCheck as CheckCircle, CircleAlert as AlertCircle, ChevronDown, ChevronRight, FileSliders as Sliders, X, CircleHelp as HelpCircle, Info, TrendingUp, Globe, Shield, BarChart3, Lightbulb, Gauge, Droplet, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { optimizeImage as optimizeImageWithSquoosh } from '@/lib/imageOptimizer';
import JSZip from 'jszip';
import type { Locale } from '@/lib/i18n/config';
import { useLocale } from '@/hooks/useLocale';

// Import dictionaries statically for client component
import enDict from '@/dictionaries/en/optimize-image.json';
import esDict from '@/dictionaries/es/optimize-image.json';
import deDict from '@/dictionaries/de/optimize-image.json';
import itDict from '@/dictionaries/it/optimize-image.json';

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
};

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  originalSize: number;
  optimizedSize?: number;
  optimizedBlob?: Blob;
  optimizedFormat?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export default function OptimizePageTranslated() {
  const { locale: lang, localePath } = useLocale();
  const t = dictionaries[lang];

  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [optimizationMode, setOptimizationMode] = useState<'smart' | 'manual'>('smart');
  const [targetFormat, setTargetFormat] = useState<'webp' | 'avif' | 'jpeg' | 'png'>('webp');
  const [quality, setQuality] = useState(85);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [showQualitySettings, setShowQualitySettings] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [demoQuality, setDemoQuality] = useState(75);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [initialSettings, setInitialSettings] = useState({ format: 'webp', quality: 85, stripMetadata: true });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    handleFiles(files);
  }, [quality, targetFormat, stripMetadata]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, [quality, targetFormat, stripMetadata]);

  const handleFiles = async (files: File[]) => {
    const newImages: ImageFile[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      originalSize: file.size,
    }));

    setImages(prev => [...prev, ...newImages]);

    for (const image of newImages) {
      await optimizeImage(image);
    }
  };

  const optimizeImage = async (imageFile: ImageFile) => {
    setImages(prev => prev.map(img =>
      img.id === imageFile.id ? { ...img, status: 'processing' } : img
    ));

    try {
      const result = await optimizeImageWithSquoosh(imageFile.file, {
        quality,
        targetFormat,
        stripMetadata,
      });

      setImages(prev => prev.map(img =>
        img.id === imageFile.id
          ? {
            ...img,
            status: 'completed',
            optimizedSize: result.size,
            optimizedBlob: result.blob,
            optimizedFormat: targetFormat
          }
          : img
      ));
    } catch (error) {
      setImages(prev => prev.map(img =>
        img.id === imageFile.id ? { ...img, status: 'error' } : img
      ));
    }
  };

  const downloadImage = (imageFile: ImageFile) => {
    if (!imageFile.optimizedBlob) return;

    const url = URL.createObjectURL(imageFile.optimizedBlob);
    const a = document.createElement('a');
    a.href = url;
    const format = imageFile.optimizedFormat || targetFormat;
    a.download = `optimized-${imageFile.file.name.replace(/\.[^/.]+$/, '')}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    const completedImages = images.filter(img => img.status === 'completed' && img.optimizedBlob);

    if (completedImages.length === 0) return;

    const zip = new JSZip();

    completedImages.forEach((img) => {
      if (img.optimizedBlob) {
        const fileName = `optimized-${img.file.name.replace(/\.[^/.]+$/, '')}.${targetFormat}`;
        zip.file(fileName, img.optimizedBlob);
      }
    });

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized-images-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
    }
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setSettingsChanged(false);
  };

  const reOptimizeAll = async () => {
    const imagesToReOptimize = images.filter(img => img.status === 'completed' || img.status === 'error');

    if (imagesToReOptimize.length === 0) return;

    setInitialSettings({ format: targetFormat, quality, stripMetadata });
    setSettingsChanged(false);

    for (const image of imagesToReOptimize) {
      await optimizeImage(image);
    }
  };

  // Track settings changes
  useEffect(() => {
    const hasCompletedImages = images.some(img => img.status === 'completed');
    if (hasCompletedImages) {
      const changed =
        initialSettings.format !== targetFormat ||
        initialSettings.quality !== quality ||
        initialSettings.stripMetadata !== stripMetadata;
      setSettingsChanged(changed);
    }
  }, [quality, targetFormat, stripMetadata, images, initialSettings]);

  // Save initial settings when first image completes
  useEffect(() => {
    const firstCompleted = images.find(img => img.status === 'completed');
    if (firstCompleted && initialSettings.format === 'webp' && initialSettings.quality === 85) {
      setInitialSettings({ format: targetFormat, quality, stripMetadata });
    }
  }, [images]);

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const calculateSavings = (original: number, optimized?: number) => {
    if (!optimized) return 0;
    return Math.round(((original - optimized) / original) * 100);
  };

  const totalOriginalSize = images.reduce((acc, img) => acc + img.originalSize, 0);
  const totalOptimizedSize = images
    .filter(img => img.status === 'completed' && img.optimizedSize)
    .reduce((acc, img) => acc + (img.optimizedSize || 0), 0);
  const totalSavings = totalOriginalSize > 0 && totalOptimizedSize > 0
    ? Math.round(((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100)
    : 0;
  const completedCount = images.filter(img => img.status === 'completed').length;
  const hasCompletedImages = completedCount > 0;

  // Helper for link paths (prefix with lang if not default)


  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href={localePath('/')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t.breadcrumb.home}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{t.breadcrumb.imageOptimizer}</span>
        </nav>

        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {t.hero.title} <span className="text-blue-600">{t.hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400" style={{ fontSize: '1.1rem' }}>
            {t.hero.description}
          </p>
        </div>


        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`relative border-2 border-dashed transition-all duration-500 bg-white dark:bg-gray-800 cursor-pointer group ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02] shadow-xl'
            : isHovering
              ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
            } ${hasCompletedImages ? 'py-8' : ''}`}
          style={{
            clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
            minHeight: hasCompletedImages ? '120px' : '320px'
          }}
        >
          <div className="absolute top-0 right-0 w-0 h-0" style={{
            borderLeft: '20px solid transparent',
            borderTop: `20px solid ${isDragging ? '#3b82f6' : isHovering ? '#60a5fa' : 'transparent'}`,
            transition: 'border-top-color 0.3s ease'
          }} />

          <svg
            className="absolute top-0 right-0 pointer-events-none"
            style={{ width: '20px', height: '20px' }}
          >
            <path
              d="M 0 0 L 20 0 L 20 20 Z"
              className={`transition-all duration-300 ${isDragging ? 'fill-blue-600' : isHovering ? 'fill-blue-500' : 'fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400'
                }`}
            />
          </svg>

          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            {hasCompletedImages ? (
              <>
                <label htmlFor="file-upload-compact" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 rounded-lg">
                    <Upload className="w-6 h-6 text-gray-600 dark:text-gray-400" strokeWidth={2} />
                  </div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {t.dropzone.addMore}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {t.dropzone.orDrop}
                  </p>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload-compact"
                />
              </>
            ) : (
              <>
                <div className={`w-16 h-16 bg-blue-600 flex items-center justify-center mb-5 transition-all duration-500 ${isDragging ? 'scale-110 rotate-6' : isHovering ? 'scale-105' : ''
                  }`}>
                  <Upload className={`w-8 h-8 text-white transition-transform duration-500 ${isDragging ? 'translate-y-[-4px]' : isHovering ? 'translate-y-[-2px]' : ''
                    }`} strokeWidth={2} />
                </div>

                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.dropzone.dropHere}
                </p>

                <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
                  {t.dropzone.orClick}
                </p>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />

                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm font-medium cursor-pointer transition-all duration-300 ${isHovering && !isDragging
                        ? 'scale-105 -translate-y-0.5 shadow-lg shadow-blue-500/30'
                        : ''
                      }`}
                    asChild
                  >
                    <span>{t.dropzone.browseFiles}</span>
                  </Button>
                </label>

                <p className="text-xs text-gray-500 dark:text-gray-500 mt-5">
                  {t.dropzone.maxSize}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <button
              onClick={() => setOptimizationMode('smart')}
              className={`relative p-3 border rounded-lg text-left transition-all duration-300 ${optimizationMode === 'smart'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 shadow-md'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 ${optimizationMode === 'smart'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                  <Zap className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-900 dark:text-white mb-0.5" style={{ fontWeight: 600 }}>
                    {t.modes.smart.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t.modes.smart.description}
                  </p>
                </div>
                {optimizationMode === 'smart' && (
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
              </div>
            </button>

            <button
              onClick={() => setOptimizationMode('manual')}
              className={`relative p-3 border rounded-lg text-left transition-all duration-300 ${optimizationMode === 'manual'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 shadow-md'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 ${optimizationMode === 'manual'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                  <Sliders className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-900 dark:text-white mb-0.5" style={{ fontWeight: 600 }}>
                    {t.modes.manual.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t.modes.manual.description}
                  </p>
                </div>
                {optimizationMode === 'manual' && (
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
              </div>
            </button>
          </div>

          {optimizationMode === 'smart' ? (
            <>
              <div style={{ padding: '1rem' }} className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" strokeWidth={2} />
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <span className="font-medium">{t.modes.smart.activeMessage}</span> {t.modes.smart.activeDetail}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="w-full flex items-center gap-3 py-3 hover:opacity-70 transition-opacity"
              >
                {showAdvancedSettings ? (
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
                <Sliders className="w-4 h-4 text-gray-600 dark:text-gray-400" strokeWidth={2} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{t.settings.advancedSettings}</span>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  {stripMetadata ? t.settings.optimized : t.settings.basic}
                </span>
              </button>

              {showAdvancedSettings && (
                <div style={{ padding: '1rem' }} className="ml-11 mt-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="strip-metadata-smart"
                      checked={stripMetadata}
                      onCheckedChange={(checked) => setStripMetadata(checked as boolean)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="strip-metadata-smart"
                        className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                      >
                        {t.settings.stripMetadata}
                      </label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {t.settings.stripMetadataDesc}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {t.settings.targetFormat}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'webp', label: 'webp', subtitle: t.settings.modernWeb, color: 'green' },
                    { value: 'avif', label: 'avif', subtitle: t.settings.bestCompression, color: 'purple' },
                    { value: 'jpeg', label: 'jpeg', subtitle: t.settings.universal, color: 'orange' },
                    { value: 'png', label: 'png', subtitle: t.settings.lossless, color: 'blue' }
                  ].map((format) => {
                    const isSelected = targetFormat === format.value;
                    const colorClasses = {
                      green: isSelected ? 'border-green-500 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-sm',
                      purple: isSelected ? 'border-purple-500 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-sm',
                      orange: isSelected ? 'border-orange-500 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm',
                      blue: isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm'
                    };
                    const textColorClasses = {
                      green: isSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white',
                      purple: isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white',
                      orange: isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white',
                      blue: isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                    };
                    return (
                      <button
                        key={format.value}
                        onClick={() => setTargetFormat(format.value as any)}
                        className={`p-3 border rounded-lg text-center transition-all duration-300 relative bg-white dark:bg-gray-800 ${colorClasses[format.color as keyof typeof colorClasses]}`}
                      >
                        <div className={`text-sm font-bold mb-0.5 ${textColorClasses[format.color as keyof typeof textColorClasses]}`}>
                          {format.label}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {format.subtitle}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-500">💡</span>
                  <span>{t.settings.formatTip}</span>
                </p>
              </div>

              {targetFormat !== 'png' && (
                <button
                  onClick={() => setShowQualitySettings(!showQualitySettings)}
                  className="w-full flex items-center gap-3 py-2 hover:opacity-70 transition-opacity"
                >
                  {showQualitySettings ? (
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                  <Sliders className="w-4 h-4 text-gray-600 dark:text-gray-400" strokeWidth={2} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t.settings.qualitySettings}</span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{quality}%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">{t.settings.defaultQuality}</span>
                </button>
              )}

              {showQualitySettings && targetFormat !== 'png' && (
                <div className="ml-11 p-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg space-y-6">
                  <div className="flex gap-2 justify-start">
                    {[
                      { label: t.settings.web, value: 75, gradient: 'from-cyan-500 to-blue-500' },
                      { label: t.settings.standard, value: 85, gradient: 'from-emerald-500 to-teal-500' },
                      { label: t.settings.high, value: 92, gradient: 'from-orange-500 to-amber-500' },
                      { label: t.settings.max, value: 100, gradient: 'from-rose-500 to-pink-500' }
                    ].map((preset) => {
                      const isSelected = quality === preset.value;
                      return (
                        <button
                          key={preset.label}
                          onClick={() => setQuality(preset.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${isSelected
                            ? `bg-gradient-to-r ${preset.gradient} text-white shadow-lg`
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                            }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    <Slider
                      value={[quality]}
                      onValueChange={(value) => setQuality(value[0])}
                      min={1}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{t.settings.smallerSize}</span>
                      <span>{t.settings.betterQuality}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t.settings.qualityExplainer}
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="w-full flex items-center gap-3 py-2 hover:opacity-70 transition-opacity"
              >
                {showAdvancedSettings ? (
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
                <Sliders className="w-4 h-4 text-gray-600 dark:text-gray-400" strokeWidth={2} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{t.settings.advancedSettings}</span>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  {stripMetadata ? t.settings.optimized : t.settings.basic}
                </span>
              </button>

              {showAdvancedSettings && (
                <div style={{ padding: '1rem' }} className="ml-11 mt-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="strip-metadata-manual"
                      checked={stripMetadata}
                      onCheckedChange={(checked) => setStripMetadata(checked as boolean)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="strip-metadata-manual"
                        className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                      >
                        {t.settings.stripMetadata}
                      </label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {t.settings.stripMetadataDesc}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {showPrivacyDialog && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
              onClick={() => setShowPrivacyDialog(false)}
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowPrivacyDialog(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t.privacy.title}
                </h2>

                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>{t.privacy.p1}</p>
                  <p>{t.privacy.p2}</p>
                  <p>{t.privacy.p3}</p>
                  <p>{t.privacy.p4}</p>
                </div>
              </div>
            </div>
          )}
        </div>



        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-6">
          {t.privacy.notice}{' '}
          <button
            onClick={() => setShowPrivacyDialog(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t.privacy.details}
          </button>
        </p>

        {/* Results - Processing */}
        {images.length > 0 && !hasCompletedImages && (
          <div
            className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 overflow-hidden transition-colors duration-300 relative"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
            }}
          >
            <svg
              className="absolute top-0 right-0 pointer-events-none transition-all duration-300"
              style={{ width: '20px', height: '20px' }}
            >
              <path
                d="M 0 0 L 20 0 L 20 20 Z"
                className="fill-gray-400 dark:fill-gray-600"
              />
            </svg>

            <svg
              className="absolute bottom-0 left-0 pointer-events-none transition-all duration-300"
              style={{ width: '20px', height: '20px' }}
            >
              <path
                d="M 0 20 L 0 0 L 20 20 Z"
                className="fill-gray-400 dark:fill-gray-600"
              />
            </svg>

            <div className="p-4">
              <div className="space-y-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg hover:shadow-sm transition-all"
                  >
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={img.preview}
                        alt={img.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate mb-0.5">
                            {img.file.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {img.file.type.split('/')[1]?.toUpperCase() || 'IMAGE'} • {formatSize(img.originalSize)}
                          </p>
                        </div>
                      </div>

                      {img.status === 'processing' && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs">{t.results.optimizing}</span>
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">{t.results.errorOptimizing}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => removeImage(img.id)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results - Completed */}
        {images.length > 0 && hasCompletedImages && (
          <div
            className="mt-8 mb-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 overflow-hidden transition-colors duration-300 relative"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
            }}
          >
            <svg
              className="absolute top-0 right-0 pointer-events-none"
              style={{ width: '20px', height: '20px' }}
            >
              <path
                d="M 0 0 L 20 0 L 20 20 Z"
                className="fill-gray-400 dark:fill-gray-600"
              />
            </svg>

            {hasCompletedImages && (
              <>
                {settingsChanged && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-400 dark:border-blue-600 p-4">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {t.results.settingsChanged}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 pb-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t.results.allDone}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {completedCount === 1
                          ? t.results.imageOptimized.replace('{count}', String(completedCount))
                          : t.results.imagesOptimized.replace('{count}', String(completedCount))}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {settingsChanged && (
                      <Button
                        onClick={reOptimizeAll}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 shadow-md hover:shadow-lg transition-all text-sm"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {t.results.applyNewSettings}
                      </Button>
                    )}
                    <Button
                      onClick={downloadAll}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 shadow-md hover:shadow-lg transition-all text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t.results.downloadZip}
                    </Button>
                    <Button
                      onClick={clearAll}
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 text-sm"
                    >
                      {t.results.clearAll}
                    </Button>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-6">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                    {t.results.optimizationSummary}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-green-600 dark:bg-green-500 flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                          </div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.results.spaceSaved}</p>
                        </div>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{totalSavings}%</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                            <FileImage className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                          </div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.results.filesProcessed}</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{completedCount}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-600 dark:bg-purple-500 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                          </div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.results.sizeReduced}</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{formatSize(totalOriginalSize - totalOptimizedSize)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-gray-600 dark:text-gray-400">{t.results.original} <span className="font-bold text-gray-900 dark:text-white">{formatSize(totalOriginalSize)}</span></span>
                      <span className="text-green-600 dark:text-green-400 font-bold">{t.results.saved.replace('{percent}', String(totalSavings))}</span>
                      <span className="text-gray-600 dark:text-gray-400">{t.results.optimizedLabel} <span className="font-bold text-gray-900 dark:text-white">{formatSize(totalOptimizedSize)}</span></span>
                    </div>
                    <div className="relative w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 h-3 transition-all duration-500 rounded-full shadow-lg"
                        style={{ width: `${totalSavings}%` }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className={hasCompletedImages ? "p-4 bg-gray-50/50 dark:bg-gray-900/30" : "p-4"}>
              <div className="space-y-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative flex items-center gap-4 p-4 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg hover:shadow-sm transition-all"
                  >
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={img.preview}
                        alt={img.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                        {img.file.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {img.file.type.split('/')[1]?.toUpperCase() || 'IMAGE'} • {formatSize(img.originalSize)}
                      </p>

                      {img.status === 'processing' && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-medium">{t.results.processing}</span>
                        </div>
                      )}
                      {img.status === 'completed' && img.optimizedSize && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${calculateSavings(img.originalSize, img.optimizedSize)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                            {calculateSavings(img.originalSize, img.optimizedSize)}% {t.results.saved.replace('{percent}% ', '')}
                          </span>
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">{t.results.errorProcessing}</span>
                        </div>
                      )}
                    </div>

                    {img.status === 'completed' && img.optimizedSize && (
                      <Button
                        onClick={() => downloadImage(img)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 h-9 shadow-sm flex items-center gap-2 flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">{t.results.download}</span>
                        <span className="text-xs font-medium hidden md:inline">({formatSize(img.optimizedSize)})</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {images.length === 0 && (
          <>
            <div
              className="mt-16 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 p-8 relative transition-colors duration-300 group"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <svg
                className="absolute top-0 right-0 pointer-events-none transition-all duration-300"
                style={{ width: '20px', height: '20px' }}
              >
                <path
                  d="M 0 0 L 20 0 L 20 20 Z"
                  className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400"
                />
              </svg>

              <div className="flex items-center gap-3 mb-8">
                <HelpCircle className="text-blue-600 dark:text-blue-400" style={{ width: '1.5rem', height: '1.5rem' }} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.howTo.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className="bg-blue-600 flex items-center justify-center text-white text-base font-bold relative"
                      style={{
                        width: '2rem',
                        height: '2rem',
                        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                      }}
                    >
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {t.howTo.step1Title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t.howTo.step1Desc}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className="bg-blue-600 flex items-center justify-center text-white text-base font-bold relative"
                      style={{
                        width: '2rem',
                        height: '2rem',
                        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                      }}
                    >
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {t.howTo.step2Title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t.howTo.step2Desc}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className="bg-blue-600 flex items-center justify-center text-white text-base font-bold relative"
                      style={{
                        width: '2rem',
                        height: '2rem',
                        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                      }}
                    >
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {t.howTo.step3Title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t.howTo.step3Desc}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <p className="text-blue-800 dark:text-blue-200">
                    <span className="font-bold">{t.howTo.proTip}</span> {t.howTo.proTipText}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="mt-16 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 p-8 relative transition-colors duration-300 group"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <svg
                className="absolute top-0 right-0 pointer-events-none transition-all duration-300"
                style={{ width: '20px', height: '20px' }}
              >
                <path
                  d="M 0 0 L 20 0 L 20 20 Z"
                  className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400"
                />
              </svg>

              <div className="flex items-center gap-3 mb-8">
                <Info className="text-blue-600 dark:text-blue-400" style={{ width: '1.5rem', height: '1.5rem' }} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.whyOptimize.title}
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.whyOptimize.intro}
                </p>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="font-semibold text-gray-900 dark:text-white">{t.whyOptimize.smartMode}</span> {t.whyOptimize.smartModeDesc} <span className="font-semibold text-gray-900 dark:text-white">{t.whyOptimize.smartModeFormats}</span> {t.whyOptimize.smartModeEnd}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="font-semibold text-gray-900 dark:text-white">{t.whyOptimize.manualControl}</span> {t.whyOptimize.manualControlDesc}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="font-semibold text-gray-900 dark:text-white">{t.whyOptimize.avif}</span> {t.whyOptimize.avifDesc} <span className="font-semibold text-gray-900 dark:text-white">{t.whyOptimize.webp}</span> {t.whyOptimize.webpDesc} <span className="font-semibold text-gray-900 dark:text-white">{t.whyOptimize.png}</span> {t.whyOptimize.pngDesc} <span className="font-semibold text-gray-900 dark:text-white">{t.whyOptimize.jpeg}</span> {t.whyOptimize.jpegDesc}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="mt-16 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 p-8 relative transition-colors duration-300 group"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <svg
                className="absolute top-0 right-0 pointer-events-none transition-all duration-300"
                style={{ width: '20px', height: '20px' }}
              >
                <path
                  d="M 0 0 L 20 0 L 20 20 Z"
                  className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400"
                />
              </svg>

              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="text-blue-600 dark:text-blue-400" style={{ width: '1.5rem', height: '1.5rem' }} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.seo.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {t.seo.lighterPages}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t.seo.lighterPagesDesc}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {t.seo.coreWebVitals}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t.seo.coreWebVitalsDesc}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {t.seo.secure}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t.seo.secureDesc}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <p>{t.seo.outro}</p>
              </div>
            </div>

            <div
              className="mt-16 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 p-8 relative transition-colors duration-300 group"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <svg
                className="absolute top-0 right-0 pointer-events-none transition-all duration-300"
                style={{ width: '20px', height: '20px' }}
              >
                <path
                  d="M 0 0 L 20 0 L 20 20 Z"
                  className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400"
                />
              </svg>

              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="text-blue-600 dark:text-blue-400" style={{ width: '1.5rem', height: '1.5rem' }} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.tips.title}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Gauge className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.tips.tip1}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Droplet className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.tips.tip2}</p>
                </div>
                <div className="flex items-start gap-3">
                  <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.tips.tip3}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Gauge className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.tips.tip4}</p>
                </div>
              </div>
            </div>

            <div
              className="mt-16 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 p-8 relative transition-colors duration-300 group"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <svg
                className="absolute top-0 right-0 pointer-events-none transition-all duration-300"
                style={{ width: '20px', height: '20px' }}
              >
                <path
                  d="M 0 0 L 20 0 L 20 20 Z"
                  className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400"
                />
              </svg>

              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="text-blue-600 dark:text-blue-400" style={{ width: '1.5rem', height: '1.5rem' }} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.qualityGuide.title}
                </h2>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {t.qualityGuide.interactiveDemo}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{t.qualityGuide.demoQuality}</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{demoQuality}%</span>
                </div>

                <Slider
                  value={[demoQuality]}
                  onValueChange={(value) => setDemoQuality(value[0])}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-base font-semibold text-blue-600 dark:text-blue-400 mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {t.qualityGuide.samplePhoto}
                  </p>

                  <div className="space-y-3">
                    {['WEBP', 'JPEG', 'AVIF', 'PNG'].map((fmt) => {
                      const multipliers: Record<string, number> = { WEBP: 0.52, JPEG: 0.59, AVIF: 0.39, PNG: 1 };
                      const mult = multipliers[fmt];
                      const isPng = fmt === 'PNG';
                      return (
                        <div key={fmt} className="bg-blue-50 dark:bg-blue-900/10 border border-gray-300 dark:border-gray-600 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{fmt}</span>
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {isPng ? '2.00 MB' : `${(2 * (demoQuality / 100) * mult).toFixed(2)} MB`}
                              </div>
                              <div className={`text-xs font-medium ${isPng ? 'text-gray-500 dark:text-gray-400' : 'text-green-600 dark:text-green-400'}`}>
                                {isPng ? t.qualityGuide.noSavings : `-${Math.round((1 - (demoQuality / 100) * mult) * 100)}%`}
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2">
                            <div
                              className="bg-blue-600 h-2 transition-all duration-300"
                              style={{ width: isPng ? '100%' : `${(demoQuality / 100) * mult * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-base font-semibold text-blue-600 dark:text-blue-400 mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {t.qualityGuide.recommendations}
                  </p>

                  <div className="space-y-3">
                    {[
                      { range: '90-100%', label: t.qualityGuide.printQuality, desc: t.qualityGuide.printQualityDesc, check: demoQuality >= 90, color: 'green' },
                      { range: '75-89%', label: t.qualityGuide.highQuality, desc: t.qualityGuide.highQualityDesc, check: demoQuality >= 75 && demoQuality < 90, color: 'blue' },
                      { range: '60-74%', label: t.qualityGuide.webOptimized, desc: t.qualityGuide.webOptimizedDesc, check: demoQuality >= 60 && demoQuality < 75, color: 'blue' },
                      { range: '10-59%', label: t.qualityGuide.maxCompression, desc: t.qualityGuide.maxCompressionDesc, check: demoQuality < 60, color: 'orange' }
                    ].map((rec) => (
                      <div key={rec.range} className={`border p-4 transition-all duration-300 ${rec.check
                        ? `border-${rec.color}-500 bg-${rec.color}-50 dark:bg-${rec.color}-900/20`
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 bg-${rec.color}-600 text-white text-xs font-bold rounded`}>{rec.range}</span>
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">{rec.label}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{rec.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-700 p-8 relative transition-colors duration-300 group"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <svg
                className="absolute top-0 right-0 pointer-events-none transition-all duration-300"
                style={{ width: '20px', height: '20px' }}
              >
                <path
                  d="M 0 0 L 20 0 L 20 20 Z"
                  className="fill-gray-400 dark:fill-gray-600 group-hover:fill-orange-400"
                />
              </svg>

              <div className="flex items-center gap-3 mb-8">
                <HelpCircle className="text-orange-600 dark:text-orange-400" style={{ width: '1.5rem', height: '1.5rem' }} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.faq.title}
                </h2>
              </div>

              <div className="space-y-3">
                {t.faq.items.map((faq: { question: string; answer: string }, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors"
                  >
                    <h3 className="m-0 p-0 text-base">
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white pr-4">
                          {faq.question}
                        </span>
                        <ChevronRight className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${openFaqIndex === index ? 'rotate-90' : ''}`} />
                      </button>
                    </h3>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
