'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Upload, X, Download, CheckCircle, AlertCircle, Zap, FileImage, TrendingUp, Shield, ImageIcon, Maximize2, Info, HelpCircle, ChevronRight, RefreshCw, ChevronDown, Sliders, Layers, BarChart3, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import JSZip from 'jszip'
import { encode as encodeWebP } from '@jsquash/webp'
import { encode as encodeJPEG } from '@jsquash/jpeg'
import { encode as encodePNG } from '@jsquash/png'
import { useLocale } from '@/hooks/useLocale'

import enDict from '@/dictionaries/en/png-converter.json'
import esDict from '@/dictionaries/es/png-converter.json'
import deDict from '@/dictionaries/de/png-converter.json'
import itDict from '@/dictionaries/it/png-converter.json'
type OutputFormat = 'webp' | 'jpeg' | 'png' | 'avif';

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
}

interface ConvertedOutput {
  format: OutputFormat;
  blob: Blob;
  size: number;
}

interface ImageFile {
  id: string
  file: File
  preview: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  originalFormat: string
  convertedOutputs?: ConvertedOutput[]
  convertedSize?: number
  convertedBlob?: Blob
  status: 'pending' | 'processing' | 'completed' | 'error'
}

export default function PngConverterPage() {
  const { locale, localePath } = useLocale()
  const t = dictionaries[locale] || enDict

  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [selectedFormats, setSelectedFormats] = useState<OutputFormat[]>(['png']);
  const [showFormatSettings, setShowFormatSettings] = useState(false);
  const [showQualitySettings, setShowQualitySettings] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [demoQuality, setDemoQuality] = useState(80);
    
      const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, []);

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert(t.errors.selectImages);
      return;
    }
    
    const newImages: ImageFile[] = await Promise.all(
      imageFiles.map(async (file) => {
        const img = new Image();
        const preview = URL.createObjectURL(file);
        const format = file.type.split('/')[1].toUpperCase();
        
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = preview;
        });

        return {
          id: Math.random().toString(36).substring(7),
          file,
          preview,
          originalSize: file.size,
          originalWidth: img.width,
          originalHeight: img.height,
          originalFormat: format,
          status: 'pending' as const
        };
      })
    );
    
    setImages(prev => [...prev, ...newImages]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleFiles(files);
    } else {
      alert(t.errors.dropImages);
    }
  }, [t]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id))
  }

  const convertImage = async (image: ImageFile) => {
    setImages(prev => prev.map(img => 
      img.id === image.id ? { ...img, status: 'processing' as const } : img
    ));

    try {
      const img = new Image();
      img.src = image.preview;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const convertedOutputs: ConvertedOutput[] = [];
      
      for (const format of selectedFormats) {
        let blob: Blob;
        
        switch (format) {
          case 'webp':
            blob = new Blob([await encodeWebP(imageData, { quality })], { type: 'image/webp' });
            break;
          case 'jpeg':
            blob = new Blob([await encodeJPEG(imageData, { quality })], { type: 'image/jpeg' });
            break;
          case 'png':
            blob = new Blob([await encodePNG(imageData)], { type: 'image/png' });
            break;
          case 'avif':
            {
              const avifBlob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, 'image/avif', quality / 100);
              });
              if (!avifBlob) throw new Error('Failed to encode AVIF image');
              blob = avifBlob;
            }
            break;
          default:
            continue;
        }

        convertedOutputs.push({ format, blob, size: blob.size });
      }

      // Use first format as primary for backwards compatibility
      const primaryOutput = convertedOutputs[0];

      setImages(prev => prev.map(img =>
        img.id === image.id
          ? {
              ...img,
              convertedOutputs,
              convertedBlob: primaryOutput?.blob,
              convertedSize: primaryOutput?.size,
              status: 'completed' as const
            }
          : img
      ));
    } catch (error) {
      console.error('Conversion error:', error);
      setImages(prev => prev.map(img =>
        img.id === image.id ? { ...img, status: 'error' as const } : img
      ));
    }
  };

  const convertAllImages = async () => {
    const pendingImages = images.filter(img => img.status === 'pending');
    for (const image of pendingImages) {
      await convertImage(image);
    }
  };

  const downloadImage = async (image: ImageFile) => {
    if (!image.convertedOutputs || image.convertedOutputs.length === 0) return;

    const originalName = image.file.name.split('.')[0];

    if (image.convertedOutputs.length === 1) {
      const output = image.convertedOutputs[0];
      const url = URL.createObjectURL(output.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${originalName}.${output.format === 'jpeg' ? 'jpg' : output.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Multiple formats - download as ZIP
      const zip = new JSZip();
      image.convertedOutputs.forEach((output) => {
        const ext = output.format === 'jpeg' ? 'jpg' : output.format;
        zip.file(`${originalName}.${ext}`, output.blob);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${originalName}-converted.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const downloadAll = async () => {
    const completedImages = images.filter(img => img.status === 'completed' && img.convertedOutputs && img.convertedOutputs.length > 0);
    
    if (completedImages.length === 0) return;

    if (completedImages.length === 1 && completedImages[0].convertedOutputs?.length === 1) {
      downloadImage(completedImages[0]);
      return;
    }

    const zip = new JSZip();
    
    completedImages.forEach((image) => {
      if (image.convertedOutputs) {
        const originalName = image.file.name.split('.')[0];
        image.convertedOutputs.forEach((output) => {
          const ext = output.format === 'jpeg' ? 'jpg' : output.format;
          zip.file(`${originalName}.${ext}`, output.blob);
        });
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-images.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setImages([]);
  };

  const completedCount = images.filter(img => img.status === 'completed').length;
  const pendingCount = images.filter(img => img.status === 'pending').length;
  const hasCompletedImages = completedCount > 0;

  // Calculate total sizes (sum all formats for each image)
  const totalOriginalSize = images
    .filter(img => img.status === 'completed' && img.convertedOutputs && img.convertedOutputs.length > 0)
    .reduce((sum, img) => sum + img.originalSize, 0);
  const totalConvertedSize = images
    .filter(img => img.status === 'completed' && img.convertedOutputs && img.convertedOutputs.length > 0)
    .reduce((sum, img) => {
      // Use smallest converted size for comparison
      const sizes = img.convertedOutputs?.map(o => o.size) || [0];
      return sum + Math.min(...sizes);
    }, 0);
  const totalSavings = totalOriginalSize > 0 
    ? Math.round((1 - totalConvertedSize / totalOriginalSize) * 100)
    : 0;

  const calculateSavings = (original: number, converted: number) => {
    return Math.round((1 - converted / original) * 100);
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href={localePath('/')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t.breadcrumb.home}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={localePath('/image-converter')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t.breadcrumb.imageConverter}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">{t.breadcrumb.pngConverter}</span>
        </nav>

        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {t.hero.title} <span className="text-blue-600">{t.hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400" style={{ fontSize: '1.1rem' }}>
            {t.hero.description}
          </p>
        </div>

        {/* Upload Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`relative border-2 border-dashed transition-all duration-500 bg-white dark:bg-gray-800 cursor-pointer group ${
            isDragging
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
              className={`transition-all duration-300 ${
                isDragging ? 'fill-blue-600' : isHovering ? 'fill-blue-500' : 'fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400'
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
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {t.dropzone.addMore}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {t.dropzone.orDrop}
                  </p>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/webp,image/avif,image/gif,image/bmp"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload-compact"
                />
              </>
            ) : (
              <>
                <div className={`w-16 h-16 bg-blue-600 flex items-center justify-center mb-5 transition-all duration-500 ${
                  isDragging ? 'scale-110 rotate-6' : isHovering ? 'scale-105' : ''
                }`}>
                  <Upload className={`w-8 h-8 text-white transition-transform duration-500 ${
                    isDragging ? 'translate-y-[-4px]' : isHovering ? 'translate-y-[-2px]' : ''
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
                  accept="image/jpeg,image/webp,image/avif,image/gif,image/bmp"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />

                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm font-medium cursor-pointer transition-all duration-300 ${
                      isHovering && !isDragging
                        ? 'scale-105 -translate-y-0.5 shadow-lg shadow-blue-500/30'
                        : ''
                    }`}
                    asChild
                  >
                    <span>{t.dropzone.browse}</span>
                  </Button>
                </label>

                <p className="text-xs text-gray-500 dark:text-gray-500 mt-5">
                  {t.dropzone.supports}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {/* Target Format Settings */}
          <button
            onClick={() => setShowFormatSettings(!showFormatSettings)}
            className="w-full flex items-center gap-3 py-2 hover:opacity-70 transition-opacity"
          >
            {showFormatSettings ? (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
            <Sliders className="w-4 h-4 text-gray-600 dark:text-gray-400" strokeWidth={2} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{t.formatSettings.title}</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded uppercase">
                {selectedFormats.length === 4 ? t.formatSettings.badgeAll : selectedFormats.map(f => f === 'jpeg' ? 'JPG' : f.toUpperCase()).join(', ')}
            </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedFormats.length}{' '}
                {selectedFormats.length > 1 ? t.formatSettings.formatsSelectedPlural : t.formatSettings.formatsSelectedSingular}
              </span>
          </button>

          {showFormatSettings && (
            <div className="ml-11 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg space-y-4">
              {/* Select All Button */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">{t.formatSettings.chooseOutputFormats}</span>
                <button
                  onClick={() => {
                    if (selectedFormats.length === 4) {
                      setSelectedFormats(['png']);
                    } else {
                      setSelectedFormats(['webp', 'avif', 'png', 'jpeg']);
                    }
                  }}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedFormats.length === 4 ? t.formatSettings.resetToPngOnly : t.formatSettings.selectAllFormats}
                </button>
              </div>

              {/* Format Grid - Box Design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: 'webp' as OutputFormat, label: 'WebP', subtitle: 'Modern web format', icon: Zap, gradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10', border: 'border-purple-200 dark:border-purple-800', iconBg: 'bg-purple-600 dark:bg-purple-500', textColor: 'text-purple-700 dark:text-purple-400', selectedBorder: 'border-purple-500 dark:border-purple-400' },
                  { value: 'avif' as OutputFormat, label: 'AVIF', subtitle: 'Next-gen compression', icon: TrendingUp, gradient: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/10', border: 'border-teal-200 dark:border-teal-800', iconBg: 'bg-teal-600 dark:bg-teal-500', textColor: 'text-teal-700 dark:text-teal-400', selectedBorder: 'border-teal-500 dark:border-teal-400' },
                  { value: 'png' as OutputFormat, label: 'PNG', subtitle: 'Lossless with transparency', icon: Layers, gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10', border: 'border-blue-200 dark:border-blue-800', iconBg: 'bg-blue-600 dark:bg-blue-500', textColor: 'text-blue-700 dark:text-blue-400', selectedBorder: 'border-blue-500 dark:border-blue-400' },
                  { value: 'jpeg' as OutputFormat, label: 'JPEG', subtitle: 'Universal compatibility', icon: ImageIcon, gradient: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10', border: 'border-orange-200 dark:border-orange-800', iconBg: 'bg-orange-600 dark:bg-orange-500', textColor: 'text-orange-700 dark:text-orange-400', selectedBorder: 'border-orange-500 dark:border-orange-400' }
                ].map((format) => {
                  const isSelected = selectedFormats.includes(format.value);
                  const IconComponent = format.icon;
                  return (
                    <button
                      key={format.value}
                      onClick={() => {
                        if (isSelected && selectedFormats.length > 1) {
                          setSelectedFormats(selectedFormats.filter(f => f !== format.value));
                        } else if (!isSelected) {
                          setSelectedFormats([...selectedFormats, format.value]);
                        }
                      }}
                      className={`bg-gradient-to-br ${format.gradient} p-3 rounded-lg border-2 ${isSelected ? format.selectedBorder : format.border} transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${format.iconBg} flex items-center justify-center`}>
                            <IconComponent className="w-4 h-4 text-white" strokeWidth={2.5} />
                          </div>
                          <div className="text-left">
                            <p className={`text-sm font-bold ${format.textColor}`}>{t.formatSettings.cards[format.value].label}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{t.formatSettings.cards[format.value].subtitle}</p>
                          </div>
                        </div>
                        {isSelected ? (
                          <CheckCircle className={`w-5 h-5 ${format.textColor}`} />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selection Info */}
              <div className="text-center text-xs text-gray-600 dark:text-gray-400">
                {selectedFormats.length}{' '}
                {selectedFormats.length > 1 ? t.formatSettings.formatsSelectedPlural : t.formatSettings.formatsSelectedSingular}{' '}
                • {t.formatSettings.selectionInfoEachImage}{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {selectedFormats.map(f => f === 'jpeg' ? 'JPG' : f.toUpperCase()).join(', ')}
                </span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.formatSettings.description}
              </p>
            </div>
          )}

          {/* Quality Settings */}
          <button
            onClick={() => setShowQualitySettings(!showQualitySettings)}
            className="w-full flex items-center gap-3 py-2 hover:opacity-70 transition-opacity"
          >
            {showQualitySettings ? (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
            <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" strokeWidth={2} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{t.qualitySettings.title}</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
              {quality}%
            </span>
          </button>

          {showQualitySettings && (
            <div className="ml-11 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg space-y-4">
              {/* Quality Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t.qualitySettings.compressionQuality}</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{quality}%</span>
                </div>
                <Slider
                  value={[quality]}
                  onValueChange={(value) => setQuality(value[0])}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-2">
                  <span>{t.qualitySettings.smallerFile}</span>
                  <span>{t.qualitySettings.betterQuality}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t.qualitySettings.note}
              </p>
            </div>
          )}

          {/* Advanced Settings */}
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
            <span className="text-sm font-medium text-gray-900 dark:text-white">{t.advancedSettings.title}</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
              {stripMetadata ? t.advancedSettings.badgeOptimized : t.advancedSettings.badgeBasic}
            </span>
          </button>

          {showAdvancedSettings && (
            <div style={{ padding: '1rem' }} className="ml-11 mt-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="strip-metadata"
                  checked={stripMetadata}
                  onChange={(e) => setStripMetadata(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label
                    htmlFor="strip-metadata"
                    className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                  >
                    {t.advancedSettings.stripMetadataLabel}
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {t.advancedSettings.stripMetadataDesc}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Dialog */}
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
                <p>
                  {t.privacy.p1}
                </p>

                <p>
                  {t.privacy.p2}
                </p>

                <p>
                  {t.privacy.p3}
                </p>

                <p>
                  {t.privacy.p4}
                </p>
              </div>
            </div>
          </div>
        )}

        

        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-6">
          {t.privacy.notice}{' '}
          <button
            onClick={() => setShowPrivacyDialog(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t.privacy.details}
          </button>
        </p>

        {/* Action Buttons */}
        {images.length > 0 && !hasCompletedImages && (
          <div className="mt-8 space-y-4">
            {pendingCount > 0 && (
              <div style={{ padding: '1rem' }} className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" strokeWidth={2} />
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <span className="font-medium">{t.notices.readyToConvertLabel}</span> {pendingCount}{' '}
                    {pendingCount > 1 ? t.status.images : t.status.image}{' '}
                    {t.notices.willBeConvertedTo}{' '}
                    {selectedFormats.map(f => f === 'jpeg' ? 'JPG' : f.toUpperCase()).join(', ')}{' '}
                    {t.notices.atQuality} {quality}% {t.notices.qualitySuffix}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {pendingCount > 0 && (
                <Button
                  onClick={convertAllImages}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 font-medium"
                >
                  <RefreshCw className="w-4 h-4 mr-2" strokeWidth={2} />
                  {selectedFormats.length === 1
                    ? `${t.actions.convertTo} ${selectedFormats[0] === 'jpeg' ? 'JPG' : selectedFormats[0].toUpperCase()}`
                    : `${t.actions.convert} ${selectedFormats.length} ${t.actions.formats}`}
                </Button>
              )}
              
              {images.length > 0 && (
                <Button
                  onClick={clearAll}
                  variant="outline"
                  className="px-6 py-2.5 font-medium"
                >
                  {t.actions.clearAll}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Results Section with Summary */}
        {images.length > 0 && hasCompletedImages && (
          <div
            className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 overflow-hidden transition-colors duration-300 relative"
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

            {/* Success Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 pb-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {pendingCount > 0 ? t.status.conversionInProgress : t.status.allDone}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {completedCount} {completedCount === 1 ? t.status.image : t.status.images} {t.status.convertedTo}{' '}
                    {selectedFormats.map(f => f === 'jpeg' ? 'JPG' : f.toUpperCase()).join(', ')}
                    {pendingCount > 0 && <> • {pendingCount} {t.status.pending}</>}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {pendingCount > 0 && (
                  <Button
                    onClick={convertAllImages}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 shadow-md hover:shadow-lg transition-all text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.actions.convert} {pendingCount} {t.actions.more}
                  </Button>
                )}
                <Button
                  onClick={downloadAll}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 shadow-md hover:shadow-lg transition-all text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.actions.downloadZip}
                </Button>
                <Button
                  onClick={clearAll}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 text-sm"
                >
                  {t.actions.clearAll}
                </Button>
              </div>
            </div>

            {/* Conversion Summary */}
            <div className="px-6 pb-6 pt-6">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                {t.summary.conversionSummary}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                        <FileImage className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.summary.filesConverted}</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{completedCount}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-600 dark:bg-purple-500 flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {selectedFormats.length > 1 ? t.summary.outputFormats : t.summary.outputFormat}
                      </p>
                    </div>
                    <p className={`font-bold text-purple-700 dark:text-purple-400 ${selectedFormats.length > 2 ? 'text-sm' : 'text-2xl'}`}>
                      {selectedFormats.length === 4 ? t.formatSettings.badgeAll : selectedFormats.map(f => f === 'jpeg' ? 'JPG' : f.toUpperCase()).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-green-600 dark:bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.summary.quality}</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{quality}%</p>
                  </div>
                </div>
              </div>
              {totalOriginalSize > 0 && (
                <div className="space-y-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t.summary.original}: <span className="font-bold text-gray-900 dark:text-white">{formatSize(totalOriginalSize)}</span>
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-bold">{totalSavings > 0 ? `-${totalSavings}%` : t.summary.converted}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t.summary.converted}: <span className="font-bold text-gray-900 dark:text-white">{formatSize(totalConvertedSize)}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Images List */}
            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="space-y-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg hover:shadow-sm transition-all overflow-hidden"
                  >
                    <div className="flex items-center gap-4 p-4 pr-12">
                    {/* Image Thumbnail */}
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={image.preview}
                        alt={image.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* File Info */}
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                        {image.file.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {image.originalFormat} → {selectedFormats.map(f => f === 'jpeg' ? 'JPG' : f.toUpperCase()).join(', ')} • {formatSize(image.originalSize)}
                      </p>

                      {/* Status & Progress */}
                      {image.status === 'pending' && (
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                          <span className="text-xs font-medium">{t.status.waitingToConvert}</span>
                        </div>
                      )}
                      {image.status === 'processing' && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-medium">
                            {t.status.convertingTo} {selectedFormats.length}{' '}
                            {selectedFormats.length > 1 ? t.formatSettings.formatPlural : t.formatSettings.formatSingular}...
                          </span>
                        </div>
                      )}
                      {image.status === 'completed' && image.convertedOutputs && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-bold">
                            {t.status.convertedTo} {image.convertedOutputs.length}{' '}
                            {image.convertedOutputs.length > 1 ? t.formatSettings.formatPlural : t.formatSettings.formatSingular}
                          </span>
                        </div>
                      )}
                      {image.status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">{t.status.errorConverting}</span>
                        </div>
                      )}
                    </div>

                    {/* Download All Button */}
                    {image.status === 'completed' && image.convertedOutputs && image.convertedOutputs.length > 0 && (
                      <Button
                        onClick={() => downloadImage(image)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 h-9 shadow-sm flex items-center gap-2 flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">
                          {image.convertedOutputs.length > 1 ? t.actions.downloadAll : t.actions.download}
                        </span>
                      </Button>
                    )}

                      {/* Remove Button */}
                      <Button
                        onClick={() => removeImage(image.id)}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 w-7 h-7 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Individual Format Results */}
                    {image.status === 'completed' && image.convertedOutputs && image.convertedOutputs.length > 1 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {image.convertedOutputs.map((output) => {
                            const formatColors: Record<string, string> = {
                              webp: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                              avif: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
                              png: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                              jpeg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                            };
                            const savings = Math.round((1 - output.size / image.originalSize) * 100);
                            return (
                              <button
                                key={output.format}
                                onClick={() => {
                                  const url = URL.createObjectURL(output.blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  const originalName = image.file.name.split('.')[0];
                                  a.download = `${originalName}.${output.format === 'jpeg' ? 'jpg' : output.format}`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                }}
                                className={`flex items-center justify-between p-2 rounded border ${formatColors[output.format]} hover:opacity-80 transition-opacity`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold uppercase">
                                    {output.format === 'jpeg' ? 'JPG' : output.format.toUpperCase()}
                                  </span>
                                  <span className="text-xs opacity-75">{formatSize(output.size)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {savings > 0 && (
                                    <span className="text-xs font-medium text-green-600 dark:text-green-400">-{savings}%</span>
                                  )}
                                  <Download className="w-3 h-3" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Images List (No completed) */}
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

            <div className="p-4">
              <div className="space-y-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg hover:shadow-sm transition-all"
                  >
                    {/* Image Thumbnail */}
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={image.preview}
                        alt={image.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* File Info */}
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate mb-0.5">
                        {image.file.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                        {image.originalFormat} • {image.originalWidth} × {image.originalHeight} • {formatSize(image.originalSize)}
                      </p>

                      {image.status === 'pending' && (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <span className="text-xs">
                            {t.notices.readyToConvertTo} {selectedFormats.map(f => f === 'jpeg' ? 'JPG' : f.toUpperCase()).join(', ')}
                          </span>
                        </div>
                      )}
                      {image.status === 'processing' && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs">
                            {t.status.convertingTo} {selectedFormats.length}{' '}
                            {selectedFormats.length > 1 ? t.formatSettings.formatPlural : t.formatSettings.formatSingular}...
                          </span>
                        </div>
                      )}
                      {image.status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">{t.status.errorConverting}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => removeImage(image.id)}
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

        {/* How To Section */}
        {!hasCompletedImages && (
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
              {t.sections.howTo.title}
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
                  01
                </div>
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
                  {t.sections.howTo.step1Title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.sections.howTo.step1Desc}
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
                  02
                </div>
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
                  {t.sections.howTo.step2Title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.sections.howTo.step2Desc}
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
                  03
                </div>
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>
                  {t.sections.howTo.step3Title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.sections.howTo.step3Desc}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              <span className="font-semibold">{t.sections.howTo.tipLabel}</span> {t.sections.howTo.tipText}
            </p>
          </div>
        </div>
        )}

        {/* Key Features Section */}
        {!hasCompletedImages && (
        <div
          className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 p-8 relative transition-colors duration-300 group"
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
            <Zap className="text-green-600 dark:text-green-400" style={{ width: '1.5rem', height: '1.5rem' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.sections.keyFeatures.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                {t.sections.keyFeatures.items[0].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.sections.keyFeatures.items[0].desc}
              </p>
            </div>

            <div>
              <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                {t.sections.keyFeatures.items[1].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.sections.keyFeatures.items[1].desc}
              </p>
            </div>

            <div>
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                {t.sections.keyFeatures.items[2].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.sections.keyFeatures.items[2].desc}
              </p>
            </div>

            <div>
              <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                {t.sections.keyFeatures.items[3].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.sections.keyFeatures.items[3].desc}
              </p>
            </div>

            <div>
              <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                {t.sections.keyFeatures.items[4].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.sections.keyFeatures.items[4].desc}
              </p>
            </div>

            <div>
              <div className="w-14 h-14 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                {t.sections.keyFeatures.items[5].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.sections.keyFeatures.items[5].desc}
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Quality vs Size Guide */}
        {!hasCompletedImages && (
        <div
          className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700 p-8 relative transition-colors duration-300 group"
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
              className="fill-gray-400 dark:fill-gray-600 group-hover:fill-purple-400"
            />
          </svg>

          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="text-purple-600 dark:text-purple-400" style={{ width: '1.5rem', height: '1.5rem' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.sections.qualityGuide.title}
            </h2>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t.sections.qualityGuide.interactiveIntro}
            </p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">{t.sections.qualityGuide.demoQuality}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{demoQuality}%</span>
            </div>
            <Slider
              value={[demoQuality]}
              onValueChange={(value) => setDemoQuality(value[0])}
              min={1}
              max={100}
              step={1}
              className="w-full mb-6"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-4 uppercase">{t.sections.qualityGuide.sampleLabel}</p>
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">{t.sections.qualityGuide.pngLossless}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">2.00 MB</span>
                      <span className="text-xs text-green-600 dark:text-green-400 ml-2">100% {t.sections.qualityGuide.qualityLabel}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">WEBP</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {(2 * (1 - (demoQuality / 100) * 0.48)).toFixed(2)} MB
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                        -{Math.round((demoQuality / 100) * 48)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(1 - (demoQuality / 100) * 0.48) * 50}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">JPEG</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {(2 * (1 - (demoQuality / 100) * 0.41)).toFixed(2)} MB
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                        -{Math.round((demoQuality / 100) * 41)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(1 - (demoQuality / 100) * 0.41) * 50}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">AVIF</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {(2 * (1 - (demoQuality / 100) * 0.61)).toFixed(2)} MB
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                        -{Math.round((demoQuality / 100) * 61)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(1 - (demoQuality / 100) * 0.61) * 50}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-4 uppercase">{t.sections.qualityGuide.qualityRecommendations}</p>
              <div className="space-y-3">
                <div className={`p-4 border transition-all ${
                  demoQuality >= 90 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">{t.sections.qualityGuide.tiers[0].range}</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white uppercase">{t.sections.qualityGuide.tiers[0].title}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t.sections.qualityGuide.tiers[0].desc}
                  </p>
                </div>

                <div className={`p-4 border transition-all ${
                  demoQuality >= 75 && demoQuality < 90 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">{t.sections.qualityGuide.tiers[1].range}</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white uppercase">{t.sections.qualityGuide.tiers[1].title}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t.sections.qualityGuide.tiers[1].desc}
                  </p>
                </div>

                <div className={`p-4 border transition-all ${
                  demoQuality >= 60 && demoQuality < 75 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">{t.sections.qualityGuide.tiers[2].range}</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white uppercase">{t.sections.qualityGuide.tiers[2].title}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t.sections.qualityGuide.tiers[2].desc}
                  </p>
                </div>

                <div className={`p-4 border transition-all ${
                  demoQuality < 60 ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded">{t.sections.qualityGuide.tiers[3].range}</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white uppercase">{t.sections.qualityGuide.tiers[3].title}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t.sections.qualityGuide.tiers[3].desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Frequently Asked Questions */}
        {!hasCompletedImages && (
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
              {t.sections.faqTitle}
            </h2>
          </div>

          <div className="space-y-3">
            {t.faq.items.map((faq, index) => (
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
                  <ChevronRight
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${openFaqIndex === index ? 'rotate-90' : ''}`}
                  />
                  </button>
                </h3>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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
        )}
      </div>
    </main>
  )
}
