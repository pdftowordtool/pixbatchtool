'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Upload, X, Download, CheckCircle, AlertCircle, Zap, FileImage, TrendingUp, Shield, ImageIcon, Gauge, Info, BarChart3, HelpCircle, ChevronRight, ChevronDown, Sliders, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import imageCompression from 'browser-image-compression'
import JSZip from 'jszip'
import { useLocale } from '@/hooks/useLocale'

import enDict from '@/dictionaries/en/compress-jpg.json'
import esDict from '@/dictionaries/es/compress-jpg.json'
import deDict from '@/dictionaries/de/compress-jpg.json'
import itDict from '@/dictionaries/it/compress-jpg.json'

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
  optimizedSize?: number
  optimizedBlob?: Blob
  status: 'pending' | 'processing' | 'completed' | 'error'
}

export default function CompressJPGPage() {
  const { locale, localePath } = useLocale()
  const t = dictionaries[locale] || enDict

  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(85);
  const [initialQuality, setInitialQuality] = useState(85);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [demoQuality, setDemoQuality] = useState(85);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showQualitySettings, setShowQualitySettings] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  useEffect(() => {
    if (quality !== initialQuality && images.some(img => img.status === 'completed')) {
      setSettingsChanged(true);
    } else {
      setSettingsChanged(false);
    }
  }, [quality, initialQuality, images]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, [quality]);

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
      await compressImage(image);
    }
  };

  const compressImage = async (imageFile: ImageFile) => {
    setImages(prev => prev.map(img =>
      img.id === imageFile.id ? { ...img, status: 'processing' } : img
    ));

    try {
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        quality: quality / 100,
        fileType: 'image/jpeg'
      };

      const compressedBlob = await imageCompression(imageFile.file, options);

      setImages(prev => prev.map(img =>
        img.id === imageFile.id
          ? {
              ...img,
              status: 'completed',
              optimizedSize: compressedBlob.size,
              optimizedBlob: compressedBlob,
            }
          : img
      ));
    } catch (error) {
      console.error('Compression error:', error);
      setImages(prev => prev.map(img =>
        img.id === imageFile.id ? { ...img, status: 'error' } : img
      ));
    }
  };

  const reCompressAll = async () => {
    const imagesToReCompress = images.filter(img => img.status === 'completed' || img.status === 'error');
    
    if (imagesToReCompress.length === 0) return;

    setInitialQuality(quality);
    setSettingsChanged(false);

    for (const image of imagesToReCompress) {
      await compressImage(image);
    }
  };

  const downloadImage = (image: ImageFile) => {
    if (!image.optimizedBlob) return

    const url = URL.createObjectURL(image.optimizedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compressed_${image.file.name}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAll = async () => {
    const completedImages = images.filter(img => img.status === 'completed' && img.optimizedBlob)
    
    if (completedImages.length === 0) return

    if (completedImages.length === 1) {
      downloadImage(completedImages[0])
      return
    }

    const zip = new JSZip()
    const folder = zip.folder('compressed_images')

    completedImages.forEach((img, index) => {
      if (img.optimizedBlob) {
        folder?.file(`compressed_${img.file.name}`, img.optimizedBlob)
      }
    })

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'compressed_images.zip'
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
    setSettingsChanged(false);
    setInitialQuality(quality);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'image/jpeg' || file.type === 'image/jpg'
    );
    
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [quality]);

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

  const calculateSavings = (original: number, optimized: number) => {
    return Math.round(((original - optimized) / original) * 100)
  }

  const completedCount = images.filter(img => img.status === 'completed').length
  const hasCompletedImages = completedCount > 0

  const totalOriginalSize = images
    .filter(img => img.status === 'completed')
    .reduce((sum, img) => sum + img.originalSize, 0)

  const totalOptimizedSize = images
    .filter(img => img.status === 'completed' && img.optimizedSize)
    .reduce((sum, img) => sum + (img.optimizedSize || 0), 0)

  const totalSavings = totalOriginalSize > 0 
    ? Math.round(((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100)
    : 0

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href={localePath('/')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t.breadcrumb.home}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={localePath('/compress-image')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t.breadcrumb.compressImage}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">{t.breadcrumb.compressJpg}</span>
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
                  accept="image/jpeg,image/jpg"
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
                  accept="image/jpeg,image/jpg"
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
                  {t.dropzone.maxSize}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-6">
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
            <span className="text-sm font-medium text-gray-900 dark:text-white">{t.qualitySettings.title}</span>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{quality}%</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">{t.qualitySettings.default}</span>
          </button>

          {showQualitySettings && (
            <div className="ml-11 p-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg space-y-6">
              <div className="flex gap-2 justify-start">
                {[
                  { label: t.qualitySettings.presets.web, value: 75, gradient: 'from-cyan-500 to-blue-500' },
                  { label: t.qualitySettings.presets.standard, value: 85, gradient: 'from-emerald-500 to-teal-500' },
                  { label: t.qualitySettings.presets.high, value: 92, gradient: 'from-orange-500 to-amber-500' },
                  { label: t.qualitySettings.presets.max, value: 100, gradient: 'from-rose-500 to-pink-500' }
                ].map((preset) => {
                  const isSelected = quality === preset.value;
                  return (
                    <button
                      key={preset.label}
                      onClick={() => setQuality(preset.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        isSelected
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
                  <span>{t.qualitySettings.smallerSize}</span>
                  <span>{t.qualitySettings.betterQuality}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.qualitySettings.description}
              </p>
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
                    {/* Image Thumbnail */}
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={img.preview}
                        alt={img.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* File Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate mb-0.5">
                            {img.file.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            JPG • {formatSize(img.originalSize)}
                          </p>
                        </div>
                      </div>

                      {img.status === 'processing' && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs">{t.status.compressing}</span>
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">{t.status.errorCompressing}</span>
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

            {hasCompletedImages && (
              <>
                {settingsChanged && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-400 dark:border-blue-600 p-4">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {t.status.settingsChanged} {t.status.settingsChangedDesc}
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
                        {t.status.allDone}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {completedCount} JPG {completedCount === 1 ? t.status.imageCompressed : t.status.imagesCompressed}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {settingsChanged && (
                      <Button
                        onClick={reCompressAll}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 shadow-md hover:shadow-lg transition-all text-sm"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {t.actions.applyNewSettings}
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

                <div className="px-6 pb-6 pt-6">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                    {t.summary.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-green-600 dark:bg-green-500 flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                          </div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.summary.spaceSaved}</p>
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
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.summary.filesProcessed}</p>
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
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.summary.sizeReduced}</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{formatSize(totalOriginalSize - totalOptimizedSize)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-gray-600 dark:text-gray-400">{t.summary.original}: <span className="font-bold text-gray-900 dark:text-white">{formatSize(totalOriginalSize)}</span></span>
                      <span className="text-green-600 dark:text-green-400 font-bold">{totalSavings}% {t.summary.saved}</span>
                      <span className="text-gray-600 dark:text-gray-400">{t.summary.compressed}: <span className="font-bold text-gray-900 dark:text-white">{formatSize(totalOptimizedSize)}</span></span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${totalSavings}%` }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className={hasCompletedImages ? "p-4 bg-gray-50/50 dark:bg-gray-900/30" : "p-4"}>
              <div className="space-y-3">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className="relative flex items-center gap-4 p-4 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg hover:shadow-sm transition-all"
                  >
                    {/* Image Thumbnail */}
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={img.preview}
                        alt={img.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* File Info */}
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                        {img.file.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        JPG • {formatSize(img.originalSize)}
                      </p>

                      {/* Status & Progress */}
                      {img.status === 'processing' && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-medium">{t.status.compressing}</span>
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
                            {calculateSavings(img.originalSize, img.optimizedSize)}% {t.summary.saved}
                          </span>
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">{t.status.errorCompressing}</span>
                        </div>
                      )}
                    </div>

                    {/* Download Button */}
                    {img.status === 'completed' && img.optimizedSize && (
                      <Button
                        onClick={() => downloadImage(img)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 h-9 shadow-sm flex items-center gap-2 flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">{t.actions.download}</span>
                        <span className="text-xs font-medium hidden md:inline">({formatSize(img.optimizedSize)})</span>
                      </Button>
                    )}

                    {/* Remove Button */}
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
        </div>

        {/* Information Sections */}
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
              {t.sections.makeSmaller.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center flex-shrink-0" style={{ width: '2.5rem', height: '2.5rem' }}>
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                  {t.sections.makeSmaller.card1Title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.sections.makeSmaller.card1Desc}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center flex-shrink-0" style={{ width: '2.5rem', height: '2.5rem' }}>
                <ImageIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                  {t.sections.makeSmaller.card2Title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.sections.makeSmaller.card2Desc}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 flex items-center justify-center flex-shrink-0" style={{ width: '2.5rem', height: '2.5rem' }}>
                <Gauge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                  {t.sections.makeSmaller.card3Title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.sections.makeSmaller.card3Desc}
                </p>
              </div>
            </div>
          </div>
        </div>

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

          <div className="flex items-center gap-3 mb-6">
            <Info className="text-blue-600 dark:text-blue-400" style={{ width: '1.5rem', height: '1.5rem' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.sections.why.title}
            </h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            {t.sections.why.p1}
          </p>

          <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400 mb-8">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-sm leading-relaxed">
              <span className="font-medium text-gray-700 dark:text-gray-300">{t.sections.why.tipLabel}</span> {t.sections.why.tipText}
            </p>
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

          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-cyan-600 dark:text-cyan-400" style={{ width: '1.5rem', height: '1.5rem' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.sections.qualityGuide.title}
            </h2>
          </div>

          <div className="bg-cyan-50 dark:bg-cyan-900/20 p-6 rounded-lg mb-6 border border-cyan-200 dark:border-cyan-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t.sections.qualityGuide.intro}
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
              <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-4 uppercase">{t.sections.qualityGuide.samplePhoto}</p>
              <div className="space-y-4">
                {(() => {
                  const calculateWebPSize = (quality: number) => {
                    const base = 0.52;
                    const variation = (quality - 85) / 100 * 0.25;
                    return Math.max(0.35, base + variation).toFixed(2);
                  };

                  const calculateJPEGSize = (quality: number) => {
                    const base = 0.59;
                    const variation = (quality - 85) / 100 * 0.30;
                    return Math.max(0.4, base + variation).toFixed(2);
                  };

                  const calculateAVIFSize = (quality: number) => {
                    const base = 540;
                    const variation = (quality - 85) * 1.8;
                    return Math.max(300, base + variation).toFixed(1);
                  };

                  const calculatePNGSize = (quality: number) => {
                    return "2.00";
                  };

                  const calculateReduction = (size: string, isKB: boolean = false) => {
                    const sizeInMB = isKB ? parseFloat(size) / 1000 : parseFloat(size);
                    return Math.round((1 - sizeInMB / 2) * 100);
                  };

                  const calculateBarWidth = (size: string, isKB: boolean = false) => {
                    const sizeInMB = isKB ? parseFloat(size) / 1000 : parseFloat(size);
                    return Math.round((sizeInMB / 2) * 100);
                  };

                  const webpSize = calculateWebPSize(demoQuality);
                  const jpegSize = calculateJPEGSize(demoQuality);
                  const avifSize = calculateAVIFSize(demoQuality);
                  const pngSize = calculatePNGSize(demoQuality);

                  return (
                    <>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">WEBP</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{webpSize} MB</span>
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
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{jpegSize} MB</span>
                            <span className="text-xs text-green-600 dark:text-green-400 ml-2">-{calculateReduction(jpegSize)}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${calculateBarWidth(jpegSize)}%` }} />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">AVIF</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{avifSize} KB</span>
                            <span className="text-xs text-green-600 dark:text-green-400 ml-2">-{calculateReduction(avifSize, true)}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${calculateBarWidth(avifSize, true)}%` }} />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">PNG</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{pngSize} MB</span>
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
                  demoQuality >= 50 && demoQuality < 75 ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-cyan-600 text-white text-xs font-bold rounded">50-74%</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white uppercase">{t.sections.qualityGuide.highCompression}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t.sections.qualityGuide.highCompressionDesc}
                  </p>
                </div>

                <div className={`p-4 border transition-all ${
                  demoQuality < 50 ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded">10-49%</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white uppercase">{t.sections.qualityGuide.maxCompression}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t.sections.qualityGuide.maxCompressionDesc}
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
