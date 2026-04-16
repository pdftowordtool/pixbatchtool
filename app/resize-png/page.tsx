'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Upload, X, Download, CheckCircle, AlertCircle, Zap, FileImage, TrendingUp, Shield, ImageIcon, Maximize2, Info, HelpCircle, ChevronRight, ChevronDown, Sliders, BarChart3, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import JSZip from 'jszip'
import { encode as encodeJPEG } from '@jsquash/jpeg'
import { encode as encodePNG } from '@jsquash/png'
import { encode as encodeWebP } from '@jsquash/webp'
import { useLocale } from '@/hooks/useLocale'

import enDict from '@/dictionaries/en/resize-png.json'
import esDict from '@/dictionaries/es/resize-png.json'
import deDict from '@/dictionaries/de/resize-png.json'
import itDict from '@/dictionaries/it/resize-png.json'

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
}
interface ImageFile {
  id: string
  file: File
  preview: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  resizedSize?: number
  resizedBlob?: Blob
  resizedWidth?: number
  resizedHeight?: number
  status: 'pending' | 'processing' | 'completed' | 'error'
}

export default function ResizeImagePage() {
  const { locale, localePath } = useLocale()
  const t = dictionaries[locale] || enDict

  const [images, setImages] = useState<ImageFile[]>([]);
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [activeTab, setActiveTab] = useState<'custom' | 'percentage' | 'preset'>('custom');
  const [scalePercentage, setScalePercentage] = useState<number>(100);
  const [geometry, setGeometry] = useState<'contain' | 'cover' | 'fill'>('fill');
  const [position, setPosition] = useState<'center' | 'top' | 'bottom' | 'left' | 'right'>('center');
  const [preventUpscaling, setPreventUpscaling] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'original' | 'jpeg' | 'png' | 'webp' | 'avif'>('png');
  const [quality, setQuality] = useState<number>(85);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [demoQuality, setDemoQuality] = useState<number>(85);
    
      // Track settings changes after images are completed
  useEffect(() => {
    const hasCompleted = images.some(img => img.status === 'completed');
    if (hasCompleted) {
      setSettingsChanged(true);
    }
  }, [width, height, activeTab, scalePercentage, geometry, position, preventUpscaling, outputFormat, quality, backgroundColor]);

  // Check if there are pending images that need to be resized
  const hasPendingImages = images.some(img => img.status === 'pending');

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, []);

  const handleFiles = async (files: File[]) => {
    // Filter only PNG files
    const pngFiles = files.filter(file => file.type === 'image/png');
    
    if (pngFiles.length === 0) {
      alert(t.errors.pngOnly);
      return;
    }
    
    const newImages: ImageFile[] = await Promise.all(
      pngFiles.map(async (file) => {
        const img = new Image();
        const preview = URL.createObjectURL(file);
        
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = preview;
        });

        return {
          id: Math.random().toString(36).substring(7),
          file,
          preview,
          status: 'pending' as const,
          originalSize: file.size,
          originalWidth: img.width,
          originalHeight: img.height,
        };
      })
    );

    setImages(prev => [...prev, ...newImages]);
  };

  const resizeImage = async (imageFile: ImageFile) => {
    setImages(prev => prev.map(img =>
      img.id === imageFile.id ? { ...img, status: 'processing' } : img
    ));

    try {
      const img = new Image();
      img.src = imageFile.preview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      let targetWidth = width;
      let targetHeight = height;

      // Calculate dimensions based on active tab
      if (activeTab === 'percentage') {
        targetWidth = Math.round(img.width * (scalePercentage / 100));
        targetHeight = Math.round(img.height * (scalePercentage / 100));
      } else if (activeTab === 'preset') {
        // Preset dimensions are already set in width/height
        targetWidth = width;
        targetHeight = height;
      } else if (activeTab === 'custom') {
        targetWidth = width;
        targetHeight = height;
      }

      // Apply geometry modes
      let canvasWidth = targetWidth;
      let canvasHeight = targetHeight;
      let drawX = 0;
      let drawY = 0;
      let drawWidth = targetWidth;
      let drawHeight = targetHeight;

      // For preset and percentage modes, use exact dimensions (fill mode) by default
      const effectiveGeometry = (activeTab === 'preset' || activeTab === 'percentage') ? 'fill' : geometry;

      if (effectiveGeometry === 'contain') {
        // Fit inside dimensions, maintain aspect ratio
        const aspectRatio = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;
        
        if (targetAspect > aspectRatio) {
          canvasWidth = Math.round(targetHeight * aspectRatio);
          canvasHeight = targetHeight;
        } else {
          canvasWidth = targetWidth;
          canvasHeight = Math.round(targetWidth / aspectRatio);
        }
        
        drawWidth = canvasWidth;
        drawHeight = canvasHeight;
      } else if (effectiveGeometry === 'cover') {
        // Fill dimensions, crop excess, maintain aspect ratio
        const aspectRatio = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;
        
        canvasWidth = targetWidth;
        canvasHeight = targetHeight;
        
        if (targetAspect > aspectRatio) {
          drawWidth = targetWidth;
          drawHeight = Math.round(targetWidth / aspectRatio);
        } else {
          drawWidth = Math.round(targetHeight * aspectRatio);
          drawHeight = targetHeight;
        }
        
        // Apply position for cover mode
        if (position === 'top') {
          drawY = 0;
          drawX = (canvasWidth - drawWidth) / 2;
        } else if (position === 'bottom') {
          drawY = canvasHeight - drawHeight;
          drawX = (canvasWidth - drawWidth) / 2;
        } else if (position === 'left') {
          drawX = 0;
          drawY = (canvasHeight - drawHeight) / 2;
        } else if (position === 'right') {
          drawX = canvasWidth - drawWidth;
          drawY = (canvasHeight - drawHeight) / 2;
        } else {
          drawX = (canvasWidth - drawWidth) / 2;
          drawY = (canvasHeight - drawHeight) / 2;
        }
      } else if (effectiveGeometry === 'fill') {
        // Exact dimensions, may distort
        canvasWidth = targetWidth;
        canvasHeight = targetHeight;
        drawWidth = targetWidth;
        drawHeight = targetHeight;
      }

      // Prevent upscaling only for custom mode with contain/cover geometry
      if (preventUpscaling && activeTab === 'custom' && (geometry === 'contain' || geometry === 'cover')) {
        if (canvasWidth > img.width || canvasHeight > img.height) {
          canvasWidth = img.width;
          canvasHeight = img.height;
          drawWidth = img.width;
          drawHeight = img.height;
          drawX = 0;
          drawY = 0;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Fill background color if needed (for transparent images to JPEG)
      if (outputFormat === 'jpeg' || (outputFormat === 'original' && imageFile.file.type === 'image/jpeg')) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
      
      // Draw image
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      // Get ImageData for jsquash encoding
      const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

      const exportFromCanvas = async (type: string, qualityValue?: number) => {
        const blobFromCanvas = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, type, qualityValue);
        });

        if (!blobFromCanvas) {
          throw new Error(`Failed to export ${type} image`);
        }

        return blobFromCanvas;
      };

      // Determine output format
      let blob: Blob;
      let fileExtension = imageFile.file.name.split('.').pop() || 'jpg';
      
      if (outputFormat === 'original') {
        // Keep original format
        const originalFormat = imageFile.file.type;
        if (originalFormat === 'image/jpeg' || originalFormat === 'image/jpg') {
          const uint8Array = await encodeJPEG(imageData, { quality: quality });
          blob = new Blob([uint8Array], { type: 'image/jpeg' });
          fileExtension = 'jpg';
        } else if (originalFormat === 'image/png') {
          const uint8Array = await encodePNG(imageData);
          blob = new Blob([uint8Array], { type: 'image/png' });
          fileExtension = 'png';
        } else if (originalFormat === 'image/webp') {
          const uint8Array = await encodeWebP(imageData, { quality: quality });
          blob = new Blob([uint8Array], { type: 'image/webp' });
          fileExtension = 'webp';
        } else if (originalFormat === 'image/avif') {
          blob = await exportFromCanvas('image/avif', quality / 100);
          fileExtension = 'avif';
        } else {
          // Fallback to JPEG for unknown formats
          const uint8Array = await encodeJPEG(imageData, { quality: quality });
          blob = new Blob([uint8Array], { type: 'image/jpeg' });
          fileExtension = 'jpg';
        }
      } else {
        // Convert to specified format
        switch (outputFormat) {
          case 'jpeg':
            const jpegData = await encodeJPEG(imageData, { quality: quality });
            blob = new Blob([jpegData], { type: 'image/jpeg' });
            fileExtension = 'jpg';
            break;
          case 'png':
            const pngData = await encodePNG(imageData);
            blob = new Blob([pngData], { type: 'image/png' });
            fileExtension = 'png';
            break;
          case 'webp':
            const webpData = await encodeWebP(imageData, { quality: quality });
            blob = new Blob([webpData], { type: 'image/webp' });
            fileExtension = 'webp';
            break;
          case 'avif':
            blob = await exportFromCanvas('image/avif', quality / 100);
            fileExtension = 'avif';
            break;
          default:
            const defaultData = await encodeJPEG(imageData, { quality: quality });
            blob = new Blob([defaultData], { type: 'image/jpeg' });
            fileExtension = 'jpg';
        }
      }

      setImages(prev => prev.map(img =>
        img.id === imageFile.id
          ? {
              ...img,
              status: 'completed',
              resizedSize: blob.size,
              resizedBlob: blob,
              resizedWidth: canvasWidth,
              resizedHeight: canvasHeight,
            }
          : img
      ));
    } catch (error) {
      console.error('Resize error:', error);
      setImages(prev => prev.map(img =>
        img.id === imageFile.id ? { ...img, status: 'error' } : img
      ));
    }
  };

  const reResizeAll = async () => {
    const imagesToReResize = images.filter(img => img.status === 'completed' || img.status === 'error');
    
    if (imagesToReResize.length === 0) return;

    for (const image of imagesToReResize) {
      await resizeImage(image);
    }
    
    setSettingsChanged(false);
  };

  const downloadImage = (image: ImageFile) => {
    if (!image.resizedBlob) return

    const url = URL.createObjectURL(image.resizedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resized_${image.file.name}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAll = async () => {
    const completedImages = images.filter(img => img.status === 'completed' && img.resizedBlob)
    
    if (completedImages.length === 0) return

    if (completedImages.length === 1) {
      downloadImage(completedImages[0])
      return
    }

    const zip = new JSZip()
    const folder = zip.folder('resized_images')

    completedImages.forEach((img) => {
      if (img.resizedBlob) {
        folder?.file(`resized_${img.file.name}`, img.resizedBlob)
      }
    })

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resized_images.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'image/png'
    );
    
    if (files.length > 0) {
      handleFiles(files);
    } else {
      alert(t.errors.pngOnly);
    }
  }, [handleFiles, t]);

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

  const completedCount = images.filter(img => img.status === 'completed').length
  const hasCompletedImages = completedCount > 0

  const totalOriginalSize = images
    .filter(img => img.status === 'completed')
    .reduce((sum, img) => sum + img.originalSize, 0)

  const totalResizedSize = images
    .filter(img => img.status === 'completed' && img.resizedSize)
    .reduce((sum, img) => sum + (img.resizedSize || 0), 0)

  const totalSavings = totalOriginalSize > 0 
    ? Math.round(((totalOriginalSize - totalResizedSize) / totalOriginalSize) * 100)
    : 0

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href={localePath('/')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t.breadcrumb.home}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={localePath('/image-resizer')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t.breadcrumb.imageResizer}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">{t.breadcrumb.resizePng}</span>
        </nav>

        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {t.hero.title}{' '}<span className="text-blue-600">{t.hero.titleHighlight}</span>
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
          } ${images.length > 0 ? 'py-8' : ''}`}
          style={{
            clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
            minHeight: images.length > 0 ? '120px' : '320px'
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
            {images.length > 0 ? (
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
                  accept="image/png"
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

          <input
            type="file"
            multiple
            accept="image/png"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />

          <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.dropzone.dropHere}
                </p>

                <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
                  {t.dropzone.orClick}
                </p>

                <div className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm font-medium cursor-pointer mb-5 rounded-md inline-block transition-all duration-300 ${
                  isHovering && !isDragging
                    ? 'scale-105 -translate-y-0.5 shadow-lg shadow-blue-500/30'
                    : ''
                }`}>
                  {t.dropzone.browse}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {t.dropzone.maxSize}
                </p>
          </label>
              </>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <div className="mt-8 space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 p-6 space-y-4">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex-1 p-3 rounded-lg border transition-all ${
                  activeTab === 'custom'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-transparent'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.tabs.custom.title}</div>
                <div className="text-xs text-gray-500">{t.tabs.custom.desc}</div>
              </button>

              <button
                onClick={() => setActiveTab('percentage')}
                className={`flex-1 p-3 rounded-lg border transition-all ${
                  activeTab === 'percentage'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-transparent'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.tabs.percentage.title}</div>
                <div className="text-xs text-gray-500">{t.tabs.percentage.desc}</div>
              </button>

              <button
                onClick={() => setActiveTab('preset')}
                className={`flex-1 p-3 rounded-lg border transition-all ${
                  activeTab === 'preset'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-transparent'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.tabs.preset.title}</div>
                <div className="text-xs text-gray-500">{t.tabs.preset.desc}</div>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'custom' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex gap-2 w-full sm:w-auto sm:flex-1">
                    <Input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="1920"
                      className="text-center text-base font-mono h-9 flex-1 sm:flex-none sm:w-32"
                      min="1"
                    />
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="1080"
                      className="text-center text-base font-mono h-9 flex-1 sm:flex-none sm:w-32"
                      min="1"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="checkbox"
                      id="maintain-aspect"
                      checked={geometry === 'contain'}
                      onChange={(e) => setGeometry(e.target.checked ? 'contain' : 'fill')}
                      className="w-4 h-4 flex-shrink-0"
                    />
                    <label htmlFor="maintain-aspect" className="text-sm text-gray-700 dark:text-gray-300">
                      {t.custom.maintainAspect}
                    </label>
                  </div>
                </div>

                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-gray-600 dark:text-gray-400 inline-block">
                  <strong>{t.custom.tipLabel}</strong> {t.custom.tipText}
                </div>
              </div>
            )}

            {activeTab === 'percentage' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t.percentage.scale}</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{scalePercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={scalePercentage}
                    onChange={(e) => setScalePercentage(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10%</span>
                    <span>200%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {[25, 50, 75, 100, 150].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => setScalePercentage(percent)}
                      className={`flex-1 py-1.5 rounded text-sm font-medium transition-all ${
                        scalePercentage === percent
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preset' && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'instagramPostSquare', width: 1080, height: 1080 },
                  { key: 'instagramStory', width: 1080, height: 1920 },
                  { key: 'facebookPost', width: 1200, height: 630 },
                  { key: 'facebookCover', width: 820, height: 312 },
                  { key: 'twitterPost', width: 1200, height: 675 },
                  { key: 'twitterHeader', width: 1500, height: 500 },
                  { key: 'youtubeThumbnail', width: 1280, height: 720 },
                  { key: 'linkedinPost', width: 1200, height: 627 },
                  { key: 'fullHD', width: 1920, height: 1080 }
                ].map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => {
                      setWidth(preset.width);
                      setHeight(preset.height);
                      setGeometry('fill');
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all text-left ${
                      width === preset.width && height === preset.height
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t.presets.items[preset.key as keyof typeof t.presets.items]}</span>
                    <span className="text-xs text-gray-500 font-mono">{preset.width}×{preset.height}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Geometry & Constraints */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-gray-900 dark:text-white text-sm">{t.geometry.title}</div>
                
                <div className="flex gap-2 flex-1 ml-4">
                  <select
                    value={geometry}
                    onChange={(e) => setGeometry(e.target.value as 'contain' | 'cover' | 'fill')}
                    className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm h-9 flex-1"
                  >
                    <option value="contain">{t.geometry.contain}</option>
                    <option value="cover">{t.geometry.cover}</option>
                    <option value="fill">{t.geometry.fill}</option>
                  </select>

                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as any)}
                    className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm h-9 flex-1"
                  >
                    <option value="center">{t.geometry.center}</option>
                    <option value="top">{t.geometry.top}</option>
                    <option value="bottom">{t.geometry.bottom}</option>
                    <option value="left">{t.geometry.left}</option>
                    <option value="right">{t.geometry.right}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prevent-upscaling"
                  checked={preventUpscaling}
                  onChange={(e) => setPreventUpscaling(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="prevent-upscaling" className="text-sm text-gray-700 dark:text-gray-300">
                  {t.geometry.preventUpscaling}
                </label>
              </div>
            </div>

            {/* Output Format */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <div className="font-bold text-gray-900 dark:text-white text-sm">{t.output.title}</div>
              
              <div className="flex gap-2">
                {(['original', 'jpeg', 'png', 'webp', 'avif'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setOutputFormat(format)}
                    className={`flex-1 py-1.5 rounded text-sm font-medium transition-all ${
                      outputFormat === format
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>

              {outputFormat !== 'original' && outputFormat !== 'png' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">{t.output.quality} ({quality}%)</span>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-500">{t.output.lowerSize}</span>
                      <span className="text-gray-500">{t.output.higherQuality}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${quality}%, #e5e7eb ${quality}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              )}
            </div>

            {/* Advanced Settings */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                <Sliders className="w-4 h-4" />
                <span className="font-medium">{t.advanced.title}</span>
                <span className="ml-auto px-2 py-0.5 bg-blue-600 text-white text-xs rounded">{t.advanced.badge}</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="strip-metadata"
                      checked={stripMetadata}
                      onChange={(e) => setStripMetadata(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="strip-metadata" className="text-sm text-gray-700 dark:text-gray-300">
                      {t.advanced.stripMetadata}
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <label htmlFor="bg-color" className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{t.advanced.background}</label>
                    <input
                      id="bg-color"
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder={t.advanced.backgroundPlaceholder}
                      className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm h-9"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Resize Summary */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {t.resizeSummary.title}
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.resizeSummary.targetSize}</div>
                    <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                      {activeTab === 'percentage' ? `${scalePercentage}%` : `${width}×${height}`}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.resizeSummary.format}</div>
                    <div className="text-base font-bold text-green-600 dark:text-green-400 uppercase">
                      {outputFormat === 'original' ? t.output.same : outputFormat}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.resizeSummary.quality}</div>
                    <div className="text-base font-bold text-orange-600 dark:text-orange-400">
                      {outputFormat === 'original' || outputFormat === 'png' ? '—' : `${quality}%`}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.resizeSummary.aspectRatio}</div>
                    <div className="text-base font-bold text-purple-600 dark:text-purple-400">
                      {geometry === 'contain' ? t.resizeSummary.yes : t.resizeSummary.no}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {images.length > 0 && (
            <div className="mt-6 space-y-3">
              {(settingsChanged || hasPendingImages) && (
                <div className={`border rounded-lg p-3 flex items-center gap-3 ${
                  hasPendingImages 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                }`}>
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                    hasPendingImages 
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`} />
                  <p className={`text-sm ${
                    hasPendingImages
                      ? 'text-blue-800 dark:text-blue-200'
                      : 'text-amber-800 dark:text-amber-200'
                  }`}>
                    {hasPendingImages 
                      ? <>{t.notices.startResizeHint}</>
                      : <>{t.notices.settingsChangedHint}</>
                    }
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={async () => {
                    // Re-resize all images with current settings
                    for (const image of images) {
                      await resizeImage(image);
                    }
                  }}
                  className={`px-6 py-2.5 shadow-md hover:shadow-lg transition-all ${
                    settingsChanged || hasPendingImages
                      ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {t.actions.startResize}
                </Button>
                
                <Button
                  onClick={() => {
                    // Reset all settings to default
                    setWidth(1920);
                    setHeight(1080);
                    setActiveTab('custom');
                    setScalePercentage(100);
                    setGeometry('fill');
                  setPosition('center');
                  setPreventUpscaling(false);
                  setOutputFormat('png');
                  setQuality(85);
                  setShowAdvanced(false);
                  setStripMetadata(true);
                  setBackgroundColor('#ffffff');
                }}
                variant="outline"
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-2.5"
              >
                <Sliders className="w-4 h-4 mr-2" />
                {t.actions.resetSettings}
              </Button>
              </div>
            </div>
          )}
        </div>

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
                            {img.originalWidth}x{img.originalHeight} • {formatSize(img.originalSize)}
                          </p>
                        </div>
                      </div>

                      {img.status === 'processing' && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs">{t.status.resizing}</span>
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">{t.status.errorResizing}</span>
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 pb-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t.status.allDone}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {completedCount} {completedCount === 1 ? t.status.imageResized : t.status.imagesResized}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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

            <div className="px-6 pb-6 pt-6">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                {t.resizeSummary.title}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                        <Maximize2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.resizeSummary.targetSize}</p>
                    </div>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{width}x{height}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-green-600 dark:bg-green-500 flex items-center justify-center">
                        <FileImage className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.resizeSummary.filesResized}</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{completedCount}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-600 dark:bg-purple-500 flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.resizeSummary.totalSize}</p>
                    </div>
                    <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{formatSize(totalResizedSize)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30">
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
                        {img.originalWidth}x{img.originalHeight} → {img.resizedWidth}x{img.resizedHeight}
                      </p>

                      {img.status === 'processing' && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-medium">{t.status.resizing}</span>
                        </div>
                      )}
                      {img.status === 'completed' && img.resizedSize && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            {formatSize(img.resizedSize)}
                          </span>
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">{t.status.errorResizing}</span>
                        </div>
                      )}
                    </div>

                    {img.status === 'completed' && img.resizedSize && (
                      <Button
                        onClick={() => downloadImage(img)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 h-9 shadow-sm flex items-center gap-2 flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">{t.actions.download}</span>
                      </Button>
                    )}

                    <Button
                      onClick={() => removeImage(img.id)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 w-7 h-7 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
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

          <div className="flex items-center gap-3 mb-6">
            <Info className="text-purple-600 dark:text-purple-400" style={{ width: '1.5rem', height: '1.5rem' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.sections.why.title}
            </h2>
          </div>

          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {t.sections.why.p1}
          </p>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
              <span className="font-semibold">{t.sections.why.tipLabel}</span> {t.sections.why.tipText}
            </p>
          </div>
        </div>

        <div
          className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 p-8 relative transition-colors duration-300 group"
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
              className="fill-gray-400 dark:fill-gray-600 group-hover:fill-green-400"
            />
          </svg>

          <div className="flex items-center gap-3 mb-8">
            <Zap className="text-green-600 dark:text-green-400" style={{ width: '1.5rem', height: '1.5rem' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.sections.platform.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center flex-shrink-0" style={{ width: '2.5rem', height: '2.5rem' }}>
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                  {t.sections.platform.card1Title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.sections.platform.card1Desc}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center flex-shrink-0" style={{ width: '2.5rem', height: '2.5rem' }}>
                <Maximize2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                  {t.sections.platform.card2Title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.sections.platform.card2Desc}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 flex items-center justify-center flex-shrink-0" style={{ width: '2.5rem', height: '2.5rem' }}>
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                  {t.sections.platform.card3Title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.sections.platform.card3Desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-cyan-300 dark:hover:border-cyan-700 p-8 relative transition-colors duration-300 group"
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
              className="fill-gray-400 dark:fill-gray-600 group-hover:fill-cyan-400"
            />
          </svg>

          <svg
            className="absolute bottom-0 left-0 pointer-events-none transition-all duration-300"
            style={{ width: '20px', height: '20px' }}
          >
            <path
              d="M 0 20 L 0 0 L 20 20 Z"
              className="fill-gray-400 dark:fill-gray-600 group-hover:fill-cyan-400"
            />
          </svg>

          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-cyan-600 dark:text-cyan-400" style={{ width: '1.5rem', height: '1.5rem' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.sections.qualityGuide.title}
            </h2>
          </div>

          <div className="bg-cyan-50 dark:bg-cyan-900/20 p-6 rounded-lg mb-6 border border-cyan-200 dark:border-cyan-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t.sections.qualityGuide.introPrefix}{' '}
              <strong className="text-gray-900 dark:text-white">AVIF</strong>{' '}
              {t.sections.qualityGuide.introMiddle1}{' '}
              <strong className="text-gray-900 dark:text-white">WebP</strong>{' '}
              {t.sections.qualityGuide.introMiddle2}{' '}
              <strong className="text-gray-900 dark:text-white">JPEG</strong>.{' '}
              {t.sections.qualityGuide.introSuffix}
            </p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">{t.sections.qualityGuide.demoQuality}</span>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{demoQuality}%</span>
            </div>
            <Slider
              value={[demoQuality]}
              onValueChange={(value) => setDemoQuality(value[0])}
              min={10}
              max={100}
              step={1}
              className="w-full mb-6"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-4 uppercase">{t.sections.qualityGuide.sample}</p>
              <div className="space-y-4">
                {(() => {
                  const calculateAVIFSize = (quality: number) => {
                    const base = 320;
                    const variation = (quality - 85) * 2.5;
                    return Math.max(180, base + variation).toFixed(0);
                  };

                  const calculateWebPSize = (quality: number) => {
                    const base = 450;
                    const variation = (quality - 85) * 3.5;
                    return Math.max(280, base + variation).toFixed(0);
                  };

                  const calculateJPEGSize = (quality: number) => {
                    const base = 580;
                    const variation = (quality - 85) * 4.2;
                    return Math.max(360, base + variation).toFixed(0);
                  };

                  const calculatePNGSize = () => {
                    return "2100";
                  };

                  const calculateReduction = (size: string) => {
                    const sizeInKB = parseFloat(size);
                    return Math.round((1 - sizeInKB / 2100) * 100);
                  };

                  const calculateBarWidth = (size: string) => {
                    const sizeInKB = parseFloat(size);
                    return Math.round((sizeInKB / 2100) * 100);
                  };

                  const avifSize = calculateAVIFSize(demoQuality);
                  const webpSize = calculateWebPSize(demoQuality);
                  const jpegSize = calculateJPEGSize(demoQuality);
                  const pngSize = calculatePNGSize();

                  return (
                    <>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">AVIF</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{avifSize} KB</span>
                            <span className="text-xs text-green-600 dark:text-green-400 ml-2">-{calculateReduction(avifSize)}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${calculateBarWidth(avifSize)}%` }} />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">WEBP</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{webpSize} KB</span>
                            <span className="text-xs text-green-600 dark:text-green-400 ml-2">-{calculateReduction(webpSize)}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${calculateBarWidth(webpSize)}%` }} />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">JPEG</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{jpegSize} KB</span>
                            <span className="text-xs text-green-600 dark:text-green-400 ml-2">-{calculateReduction(jpegSize)}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${calculateBarWidth(jpegSize)}%` }} />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">PNG</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{pngSize} KB</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{t.sections.qualityGuide.noSavings}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }} />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div>
              <p className="text-cyan-600 dark:text-cyan-400 font-bold text-sm mb-4 uppercase">{t.sections.qualityGuide.qualityRecommendations}</p>
              <div className="space-y-3">
                <div className={`p-4 border transition-all ${
                  demoQuality >= 90 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">90-100%</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white uppercase">{t.sections.qualityGuide.maximumQuality}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t.sections.qualityGuide.maximumQualityDesc}
                  </p>
                </div>

                <div className={`p-4 border transition-all ${
                  demoQuality >= 75 && demoQuality < 90 ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-cyan-600 text-white text-xs font-bold rounded">75-89%</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white uppercase">{t.sections.qualityGuide.recommended}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t.sections.qualityGuide.recommendedDesc}
                  </p>
                </div>

                <div className={`p-4 border transition-all ${
                  demoQuality >= 50 && demoQuality < 75 ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded">50-74%</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white uppercase">{t.sections.qualityGuide.moderate}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t.sections.qualityGuide.moderateDesc}
                  </p>
                </div>

                <div className={`p-4 border transition-all ${
                  demoQuality < 50 ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">10-49%</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white uppercase">{t.sections.qualityGuide.lowQuality}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t.sections.qualityGuide.lowQualityDesc}
                  </p>
                </div>
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
          </>
        )}
      </div>
    </main>
  )
}
