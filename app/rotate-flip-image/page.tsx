'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Upload, X, Download, CheckCircle, Zap, Shield, ImageIcon, HelpCircle, ChevronRight, ChevronDown, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, FileImage, Info, Lightbulb, Crop, Grid3X3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useLocale } from '@/hooks/useLocale'

import enDict from '@/dictionaries/en/rotate-flip-image.json'
import esDict from '@/dictionaries/es/rotate-flip-image.json'
import deDict from '@/dictionaries/de/rotate-flip-image.json'
import itDict from '@/dictionaries/it/rotate-flip-image.json'

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
}

interface ProcessedImage {
  original: File;
  originalUrl: string;
  processedUrl: string;
  processedBlob: Blob | null;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

export default function RotateFlipPage() {
  const { locale, localePath } = useLocale();
  const t = dictionaries[locale] || enDict;
  const ui = t.ui;
  const faqs = t.faq.items;

  const [image, setImage] = useState<ProcessedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'original' | 'jpeg' | 'png' | 'webp' | 'avif'>('original');
  const [quality, setQuality] = useState(85);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [bgColor, setBgColor] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const originalUrl = URL.createObjectURL(file);
    
    setImage({
      original: file,
      originalUrl,
      processedUrl: originalUrl,
      processedBlob: null,
      rotation: 0,
      flipH: false,
      flipV: false
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const applyTransformations = async (newRotation: number, newFlipH: boolean, newFlipV: boolean) => {
    if (!image) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = image.originalUrl;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // Calculate canvas dimensions based on rotation
      const isRotated90or270 = newRotation === 90 || newRotation === 270;
      canvas.width = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      canvas.height = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      // Move to center
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Apply rotation
      ctx.rotate((newRotation * Math.PI) / 180);

      // Apply flips
      ctx.scale(newFlipH ? -1 : 1, newFlipV ? -1 : 1);

      // Draw image centered
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      // Get mime type
      let mimeType = 'image/jpeg';
      if (outputFormat === 'original') {
        mimeType = image.original.type || 'image/jpeg';
      } else if (outputFormat === 'png') {
        mimeType = 'image/png';
      } else if (outputFormat === 'webp') {
        mimeType = 'image/webp';
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          },
          mimeType,
          quality / 100
        );
      });

      const processedUrl = URL.createObjectURL(blob);

      // Revoke old processed URL if different from original
      if (image.processedUrl !== image.originalUrl) {
        URL.revokeObjectURL(image.processedUrl);
      }

      setImage({
        ...image,
        processedUrl,
        processedBlob: blob,
        rotation: newRotation,
        flipH: newFlipH,
        flipV: newFlipV
      });
    } catch (error) {
      console.error('Error applying transformations:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const rotateLeft = () => {
    if (!image) return;
    const newRotation = (image.rotation - 90 + 360) % 360;
    applyTransformations(newRotation, image.flipH, image.flipV);
  };

  const rotateRight = () => {
    if (!image) return;
    const newRotation = (image.rotation + 90) % 360;
    applyTransformations(newRotation, image.flipH, image.flipV);
  };

  const rotate180 = () => {
    if (!image) return;
    const newRotation = (image.rotation + 180) % 360;
    applyTransformations(newRotation, image.flipH, image.flipV);
  };

  const setRotation = (angle: number) => {
    if (!image) return;
    applyTransformations(angle, image.flipH, image.flipV);
  };

  const flipHorizontal = () => {
    if (!image) return;
    applyTransformations(image.rotation, !image.flipH, image.flipV);
  };

  const flipVertical = () => {
    if (!image) return;
    applyTransformations(image.rotation, image.flipH, !image.flipV);
  };

  const resetTransformations = () => {
    if (!image) return;
    if (image.processedUrl !== image.originalUrl) {
      URL.revokeObjectURL(image.processedUrl);
    }
    setImage({
      ...image,
      processedUrl: image.originalUrl,
      processedBlob: null,
      rotation: 0,
      flipH: false,
      flipV: false
    });
  };

  const clearImage = () => {
    if (image) {
      URL.revokeObjectURL(image.originalUrl);
      if (image.processedUrl !== image.originalUrl) {
        URL.revokeObjectURL(image.processedUrl);
      }
    }
    setImage(null);
  };

  const downloadImage = () => {
    if (!image || !image.processedBlob) return;
    const a = document.createElement('a');
    a.href = image.processedUrl;
    
    let ext = 'jpg';
    if (outputFormat === 'original') {
      ext = image.original.name.split('.').pop() || 'jpg';
    } else if (outputFormat === 'png') {
      ext = 'png';
    } else if (outputFormat === 'webp') {
      ext = 'webp';
    }
    
    const baseName = image.original.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}_edited.${ext}`;
    a.click();
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasChanges = image && (image.rotation !== 0 || image.flipH || image.flipV);

  const outputFormats = [
    { label: ui.formats.original, value: 'original' as const },
    { label: ui.formats.jpeg, value: 'jpeg' as const },
    { label: ui.formats.png, value: 'png' as const },
    { label: ui.formats.webp, value: 'webp' as const },
    { label: ui.formats.avif, value: 'avif' as const },
  ];

  const angleOptions = [
    { label: '0°', value: 0 },
    { label: '90°', value: 90 },
    { label: '180°', value: 180 },
    { label: '270°', value: 270 },
  ];

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href={localePath('/')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.breadcrumb.home}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">{t.breadcrumb.rotateFlip}</span>
        </nav>

        {/* Header - Same design as crop-image */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {t.hero.title} <span className="text-blue-600">{t.hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400" style={{ fontSize: '1.1rem' }}>
            {t.hero.description}
          </p>
        </div>

        {/* Main Tool Area - Equal columns like crop-image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left: Upload/Image Area - 6 columns */}
          <div className="lg:col-span-6 space-y-4">
            {/* Original Upload Box - Only show when no image */}
            {!image ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={`relative border-2 border-dashed transition-all duration-500 bg-white dark:bg-gray-800 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02] shadow-xl'
                    : isHovering
                    ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                  minHeight: '380px'
                }}
              >
                <svg
                  className="absolute top-0 right-0 pointer-events-none"
                  style={{ width: '20px', height: '20px' }}
                >
                  <path
                    d="M 0 0 L 20 0 L 20 20 Z"
                    className={`transition-all duration-300 ${
                      isDragging ? 'fill-blue-600' : isHovering ? 'fill-blue-500' : 'fill-gray-400 dark:fill-gray-600'
                    }`}
                  />
                </svg>

                <label className="flex flex-col items-center justify-center h-full min-h-[380px] cursor-pointer p-6">
                  <div className={`w-16 h-16 bg-blue-600 flex items-center justify-center mb-5 transition-all duration-500 ${
                    isDragging ? 'scale-110 rotate-6' : isHovering ? 'scale-105' : ''
                  }`} style={{
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                  }}>
                    <Upload className={`w-8 h-8 text-white transition-transform duration-500 ${
                      isDragging ? 'translate-y-[-4px]' : isHovering ? 'translate-y-[-2px]' : ''
                    }`} strokeWidth={2} />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
                    {ui.dropzone.dropYourImageHere}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {ui.dropzone.orClickBrowse}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {ui.dropzone.supportsHint}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <>
                {/* Replace Image Area - Top (only when image exists) */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg transition-all duration-300 bg-white dark:bg-gray-800 ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  }`}
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'
                  }}
                >
                  <svg
                    className="absolute top-0 right-0 pointer-events-none"
                    style={{ width: '16px', height: '16px' }}
                  >
                    <path
                      d="M 0 0 L 16 0 L 16 16 Z"
                      className={`transition-all duration-300 ${
                        isDragging ? 'fill-blue-500' : 'fill-gray-300 dark:fill-gray-600'
                      }`}
                    />
                  </svg>

                  <label className="flex flex-col items-center justify-center py-6 cursor-pointer">
                    <div className="w-10 h-10 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {ui.replace.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {ui.replace.orDropNew}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image Preview Area */}
                <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(156,163,175,0.3) 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                  }}
                >
                  <div className="relative">
                    {/* Delete button */}
                    <button
                      onClick={clearImage}
                      className="absolute top-3 right-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors z-20"
                    >
                      {ui.preview.delete}
                    </button>
                    
                    {/* Processing overlay */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    
                    <img
                      src={image.processedUrl}
                      alt={ui.preview.previewAlt}
                      className="max-w-full block mx-auto transition-all duration-300"
                      style={{ maxHeight: '400px' }}
                      draggable={false}
                    />
                    
                    {/* Transformation Info */}
                    {hasChanges && (
                      <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded flex items-center gap-2">
                        {image.rotation !== 0 && <span>{ui.preview.transformation.rotated} {image.rotation}°</span>}
                        {image.flipH && <span>{ui.preview.transformation.flippedH}</span>}
                        {image.flipV && <span>{ui.preview.transformation.flippedV}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Settings Panel - 6 columns */}
          <div className="lg:col-span-6 space-y-4">
            {/* All Settings in One Box */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-5"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
              }}>
              
              {/* Angle */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{ui.settings.angle}</p>
                <div className="grid grid-cols-4 gap-2">
                  {angleOptions.map((angle) => (
                    <button
                      key={angle.value}
                      onClick={() => setRotation(angle.value)}
                      disabled={!image || isProcessing}
                      className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        image?.rotation === angle.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      {angle.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Flip Checkboxes */}
              <div className="flex items-center gap-6 mb-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={image?.flipH || false}
                    onChange={() => flipHorizontal()}
                    disabled={!image || isProcessing}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{ui.settings.flipHorizontal}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={image?.flipV || false}
                    onChange={() => flipVertical()}
                    disabled={!image || isProcessing}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{ui.settings.flipVertical}</span>
                </label>
              </div>
              
              {/* Output Format */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{ui.settings.outputFormat}</p>
                <div className="grid grid-cols-5 gap-2">
                  {outputFormats.map((format) => {
                    const colorMap: Record<string, { bg: string; border: string; text: string; activeBg: string }> = {
                      original: { bg: 'bg-gray-100 dark:bg-gray-700', border: 'border-gray-400 dark:border-gray-500', text: 'text-gray-700 dark:text-gray-300', activeBg: 'bg-gray-600' },
                      jpeg: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-400 dark:border-orange-600', text: 'text-orange-700 dark:text-orange-400', activeBg: 'bg-orange-500' },
                      png: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-400 dark:border-blue-600', text: 'text-blue-700 dark:text-blue-400', activeBg: 'bg-blue-500' },
                      webp: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-400 dark:border-green-600', text: 'text-green-700 dark:text-green-400', activeBg: 'bg-green-500' },
                      avif: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-400 dark:border-purple-600', text: 'text-purple-700 dark:text-purple-400', activeBg: 'bg-purple-500' },
                    };
                    const colors = colorMap[format.value] || colorMap.original;
                    return (
                      <button
                        key={format.value}
                        onClick={() => setOutputFormat(format.value)}
                        className={`px-2 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                          outputFormat === format.value
                            ? `${colors.activeBg} text-white border-transparent`
                            : `${colors.bg} ${colors.text} ${colors.border} hover:opacity-80`
                        }`}
                      >
                        {format.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Strip Metadata Checkbox */}
              <div className="mb-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stripMetadata}
                    onChange={(e) => setStripMetadata(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{ui.settings.stripMetadata}</span>
                </label>
              </div>
              
              {/* Background Color */}
              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{ui.settings.background}</span>
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder={ui.settings.backgroundPlaceholder}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>

              {/* Quality Slider - only show for lossy formats */}
              {(outputFormat === 'jpeg' || outputFormat === 'webp' || outputFormat === 'avif') && (
                <div className="mb-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{ui.settings.quality}</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{quality}%</span>
                  </div>
                  <Slider
                    value={[quality]}
                    onValueChange={(value: number[]) => setQuality(value[0])}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{ui.settings.smallerFile}</span>
                    <span>{ui.settings.betterQuality}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-4"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
              }}>
              <Button
                onClick={downloadImage}
                disabled={!image || !hasChanges || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {ui.preview.processing}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    {ui.preview.downloadImage}
                  </>
                )}
              </Button>
              
              {image && hasChanges && (
                <button
                  onClick={resetTransformations}
                  className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  {ui.preview.resetToOriginal}
                </button>
              )}
              
              {image && !hasChanges && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  {ui.preview.applyTransformationHint}
                </p>
              )}
            </div>

            {/* Result Preview */}
            {image && hasChanges && image.processedBlob && (
              <div className="bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg p-4"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                }}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{ui.preview.transformationApplied}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{ui.preview.originalSize}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatSize(image.original.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{ui.preview.newSize}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatSize(image.processedBlob.size)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features - Same design as crop-image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <RotateCw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ui.featureCards.items[0].title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.featureCards.items[0].description}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <FlipHorizontal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ui.featureCards.items[1].title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.featureCards.items[1].description}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ui.featureCards.items[2].title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.featureCards.items[2].description}</p>
            </div>
          </div>
        </div>

        {/* How to Rotate & Flip Section */}
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
              <div className="flex-shrink-0"><div className="bg-blue-600 flex items-center justify-center text-white text-base font-bold" style={{ width: '2rem', height: '2rem', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>01</div></div>
              <div><h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>{ui.howTo.step1Title}</h3><p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.howTo.step1Desc}</p></div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0"><div className="bg-blue-600 flex items-center justify-center text-white text-base font-bold" style={{ width: '2rem', height: '2rem', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>02</div></div>
              <div><h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>{ui.howTo.step2Title}</h3><p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.howTo.step2Desc}</p></div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0"><div className="bg-blue-600 flex items-center justify-center text-white text-base font-bold" style={{ width: '2rem', height: '2rem', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>03</div></div>
              <div><h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>{ui.howTo.step3Title}</h3><p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.howTo.step3Desc}</p></div>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed"><span className="font-semibold">{ui.howTo.tipLabel}</span> {ui.howTo.tipText}</p>
          </div>
        </div>

        {/* Features Section */}
        <div
          className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 p-8 relative transition-colors duration-300 group"
          style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
        >
          <svg className="absolute top-0 right-0 pointer-events-none transition-all duration-300" style={{ width: '20px', height: '20px' }}><path d="M 0 0 L 20 0 L 20 20 Z" className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400" /></svg>
          <div className="flex items-center gap-3 mb-8">
            <Zap className="text-green-600 dark:text-green-400" style={{ width: '1.5rem', height: '1.5rem' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{ui.featuresSection.title}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-4"><RotateCw className="w-6 h-6 text-blue-600" /></div>
              <p className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-sm">{ui.featuresSection.items[0].title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.featuresSection.items[0].description}</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center mb-4"><FlipHorizontal className="w-6 h-6 text-green-600" /></div>
              <p className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-sm">{ui.featuresSection.items[1].title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.featuresSection.items[1].description}</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 flex items-center justify-center mb-4"><Shield className="w-6 h-6 text-purple-600" /></div>
              <p className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-sm">{ui.featuresSection.items[2].title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.featuresSection.items[2].description}</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 flex items-center justify-center mb-4"><Grid3X3 className="w-6 h-6 text-orange-600" /></div>
              <p className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-sm">{ui.featuresSection.items[3].title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.featuresSection.items[3].description}</p>
            </div>
          </div>
        </div>

        {/* Why Rotate & Flip Images? Section */}
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
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.why.p1}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.why.p2}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <RotateCw className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.why.bullets[0]}</p>
            </div>
            <div className="flex items-start gap-3">
              <FlipHorizontal className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.why.bullets[1]}</p>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
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
