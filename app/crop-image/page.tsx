'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Upload, X, Download, CheckCircle, Zap, Shield, ImageIcon, HelpCircle, ChevronRight, ChevronDown, Sliders, Crop, Lock, Unlock, RotateCcw, Info, Focus, Scissors, Rocket, Lightbulb, Grid3X3, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { encode as encodeWebP } from '@jsquash/webp'
import { encode as encodeJPEG } from '@jsquash/jpeg'
import { encode as encodePNG } from '@jsquash/png'
import { useLocale } from '@/hooks/useLocale'

import enDict from '@/dictionaries/en/crop-image.json'
import esDict from '@/dictionaries/es/crop-image.json'
import deDict from '@/dictionaries/de/crop-image.json'
import itDict from '@/dictionaries/it/crop-image.json'

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
}

type OutputFormat = 'original' | 'jpeg' | 'png' | 'webp' | 'avif';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageCropperPage() {
  const { locale } = useLocale()
  const t = dictionaries[locale] || enDict
  const ui = t.ui

  const [image, setImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalFormat, setOriginalFormat] = useState<string>('');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<string>('free');
  const [lockAspect, setLockAspect] = useState(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('original');
  const [quality, setQuality] = useState(85);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Crop selection state
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [initialCropArea, setInitialCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const aspectRatios = [
    { label: 'free', value: 'free' },
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '3:2', value: '3:2' },
    { label: '16:9', value: '16:9' },
    { label: '9:16', value: '9:16' },
    { label: '2:3', value: '2:3' },
    { label: '3:4', value: '3:4' },
    { label: '21:9', value: '21:9' },
  ];

  const outputFormats = [
    { label: 'original', value: 'original' as OutputFormat },
    { label: 'jpeg', value: 'jpeg' as OutputFormat },
    { label: 'png', value: 'png' as OutputFormat },
    { label: 'webp', value: 'webp' as OutputFormat },
    { label: 'avif', value: 'avif' as OutputFormat },
  ];

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(ui.alerts.selectImageFile);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert(ui.alerts.fileSizeLimit);
      return;
    }

    const format = file.type.split('/')[1].toUpperCase();
    setOriginalFormat(format);
    setOriginalFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        setImage(e.target?.result as string);
        setCroppedImage(null);
        setCroppedBlob(null);
        setCropArea({ x: 0, y: 0, width: 0, height: 0 });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Update display size when image loads and set initial crop
  useEffect(() => {
    if (imageRef.current && image) {
      const updateSize = () => {
        if (imageRef.current) {
          const width = imageRef.current.clientWidth;
          const height = imageRef.current.clientHeight;
          setDisplaySize({ width, height });
          
          // Auto-set crop area to cover most of the image with padding
          const padding = 20;
          const cropWidth = width - padding * 2;
          const cropHeight = height - padding * 2;
          
          if (aspectRatio === 'free') {
            setCropArea({
              x: padding,
              y: padding,
              width: cropWidth,
              height: cropHeight
            });
          } else {
            // Apply aspect ratio
            const ratio = getAspectRatioValue(aspectRatio);
            if (ratio) {
              let newWidth = cropWidth;
              let newHeight = cropWidth / ratio;
              
              if (newHeight > cropHeight) {
                newHeight = cropHeight;
                newWidth = cropHeight * ratio;
              }
              
              setCropArea({
                x: (width - newWidth) / 2,
                y: (height - newHeight) / 2,
                width: newWidth,
                height: newHeight
              });
            }
          }
        }
      };
      
      // Wait for image to render
      const timer = setTimeout(updateSize, 100);
      window.addEventListener('resize', updateSize);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateSize);
      };
    }
  }, [image]);

  // Update crop area when aspect ratio changes
  useEffect(() => {
    if (!imageRef.current || !image || displaySize.width === 0) return;
    
    const imgWidth = displaySize.width;
    const imgHeight = displaySize.height;
    
    const ratio = getAspectRatioValue(aspectRatio);
    
    // If crop area doesn't exist yet, create one
    if (cropArea.width === 0 || cropArea.height === 0) {
      const padding = 20;
      const maxWidth = imgWidth - padding * 2;
      const maxHeight = imgHeight - padding * 2;
      
      if (aspectRatio === 'free' || !ratio) {
        setCropArea({
          x: padding,
          y: padding,
          width: maxWidth,
          height: maxHeight
        });
      } else {
        let newWidth = maxWidth;
        let newHeight = newWidth / ratio;
        
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = newHeight * ratio;
        }
        
        setCropArea({
          x: (imgWidth - newWidth) / 2,
          y: (imgHeight - newHeight) / 2,
          width: newWidth,
          height: newHeight
        });
      }
      return;
    }
    
    // If free mode, don't change existing crop
    if (aspectRatio === 'free' || !ratio) return;
    
    // Keep the crop centered but apply new aspect ratio
    const centerX = cropArea.x + cropArea.width / 2;
    const centerY = cropArea.y + cropArea.height / 2;
    
    // Calculate new dimensions based on aspect ratio
    // Use the larger dimension to determine size
    let newWidth = Math.max(cropArea.width, cropArea.height * ratio);
    let newHeight = newWidth / ratio;
    
    // If height is too big, constrain by height
    if (newHeight > imgHeight - 20) {
      newHeight = imgHeight - 20;
      newWidth = newHeight * ratio;
    }
    
    // If width is too big, constrain by width
    if (newWidth > imgWidth - 20) {
      newWidth = imgWidth - 20;
      newHeight = newWidth / ratio;
    }
    
    // Ensure minimum size
    newWidth = Math.max(50, newWidth);
    newHeight = Math.max(50, newHeight);
    
    // Calculate new position keeping it centered
    let newX = centerX - newWidth / 2;
    let newY = centerY - newHeight / 2;
    
    // Constrain to image bounds
    newX = Math.max(0, Math.min(newX, imgWidth - newWidth));
    newY = Math.max(0, Math.min(newY, imgHeight - newHeight));
    
    setCropArea({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight
    });
  }, [aspectRatio, displaySize]);

  const getAspectRatioValue = (ratio: string): number | null => {
    if (ratio === 'free') return null;
    const [w, h] = ratio.split(':').map(Number);
    return w / h;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on resize handles
    if (cropArea.width > 0 && cropArea.height > 0) {
      const handleSize = 12;
      const handles = [
        { name: 'nw', x: cropArea.x, y: cropArea.y },
        { name: 'n', x: cropArea.x + cropArea.width / 2, y: cropArea.y },
        { name: 'ne', x: cropArea.x + cropArea.width, y: cropArea.y },
        { name: 'w', x: cropArea.x, y: cropArea.y + cropArea.height / 2 },
        { name: 'e', x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height / 2 },
        { name: 'sw', x: cropArea.x, y: cropArea.y + cropArea.height },
        { name: 's', x: cropArea.x + cropArea.width / 2, y: cropArea.y + cropArea.height },
        { name: 'se', x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
      ];
      
      for (const handle of handles) {
        if (Math.abs(x - handle.x) < handleSize && Math.abs(y - handle.y) < handleSize) {
          setIsResizing(true);
          setResizeHandle(handle.name);
          setDragStart({ x, y });
          setInitialCropArea({ ...cropArea });
          return;
        }
      }
      
      // Check if clicking inside existing crop area to drag it
      if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
          y >= cropArea.y && y <= cropArea.y + cropArea.height) {
        setIsDraggingCrop(true);
        setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
        return;
      }
    }
    
    setIsSelecting(true);
    setStartPoint({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const imgWidth = imageRef.current.clientWidth;
    const imgHeight = imageRef.current.clientHeight;
    
    let currentX = Math.max(0, Math.min(e.clientX - rect.left, imgWidth));
    let currentY = Math.max(0, Math.min(e.clientY - rect.top, imgHeight));
    
    // Handle resizing
    if (isResizing) {
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;
      
      let newX = initialCropArea.x;
      let newY = initialCropArea.y;
      let newWidth = initialCropArea.width;
      let newHeight = initialCropArea.height;
      
      const ratio = lockAspect && aspectRatio !== 'free' ? getAspectRatioValue(aspectRatio) : null;
      
      switch (resizeHandle) {
        case 'se':
          newWidth = Math.max(50, initialCropArea.width + deltaX);
          newHeight = ratio ? newWidth / ratio : Math.max(50, initialCropArea.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(50, initialCropArea.width - deltaX);
          newHeight = ratio ? newWidth / ratio : Math.max(50, initialCropArea.height + deltaY);
          newX = initialCropArea.x + initialCropArea.width - newWidth;
          break;
        case 'ne':
          newWidth = Math.max(50, initialCropArea.width + deltaX);
          newHeight = ratio ? newWidth / ratio : Math.max(50, initialCropArea.height - deltaY);
          newY = ratio ? initialCropArea.y + initialCropArea.height - newHeight : initialCropArea.y + initialCropArea.height - newHeight;
          break;
        case 'nw':
          newWidth = Math.max(50, initialCropArea.width - deltaX);
          newHeight = ratio ? newWidth / ratio : Math.max(50, initialCropArea.height - deltaY);
          newX = initialCropArea.x + initialCropArea.width - newWidth;
          newY = initialCropArea.y + initialCropArea.height - newHeight;
          break;
        case 'n':
          if (ratio) {
            newHeight = Math.max(50, initialCropArea.height - deltaY);
            newWidth = newHeight * ratio;
            newX = initialCropArea.x + (initialCropArea.width - newWidth) / 2;
          } else {
            newHeight = Math.max(50, initialCropArea.height - deltaY);
          }
          newY = initialCropArea.y + initialCropArea.height - newHeight;
          break;
        case 's':
          if (ratio) {
            newHeight = Math.max(50, initialCropArea.height + deltaY);
            newWidth = newHeight * ratio;
            newX = initialCropArea.x + (initialCropArea.width - newWidth) / 2;
          } else {
            newHeight = Math.max(50, initialCropArea.height + deltaY);
          }
          break;
        case 'e':
          if (ratio) {
            newWidth = Math.max(50, initialCropArea.width + deltaX);
            newHeight = newWidth / ratio;
            newY = initialCropArea.y + (initialCropArea.height - newHeight) / 2;
          } else {
            newWidth = Math.max(50, initialCropArea.width + deltaX);
          }
          break;
        case 'w':
          if (ratio) {
            newWidth = Math.max(50, initialCropArea.width - deltaX);
            newHeight = newWidth / ratio;
            newY = initialCropArea.y + (initialCropArea.height - newHeight) / 2;
          } else {
            newWidth = Math.max(50, initialCropArea.width - deltaX);
          }
          newX = initialCropArea.x + initialCropArea.width - newWidth;
          break;
      }
      
      // Constrain to image bounds
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      if (newX + newWidth > imgWidth) newWidth = imgWidth - newX;
      if (newY + newHeight > imgHeight) newHeight = imgHeight - newY;
      
      setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
      return;
    }
    
    if (isDraggingCrop) {
      // Drag existing crop area
      let newX = currentX - dragStart.x;
      let newY = currentY - dragStart.y;
      
      // Constrain to image bounds
      newX = Math.max(0, Math.min(newX, imgWidth - cropArea.width));
      newY = Math.max(0, Math.min(newY, imgHeight - cropArea.height));
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
      return;
    }
    
    if (!isSelecting) return;
    
    let width = currentX - startPoint.x;
    let height = currentY - startPoint.y;
    
    // Handle negative dimensions
    let x = startPoint.x;
    let y = startPoint.y;
    
    if (width < 0) {
      x = currentX;
      width = Math.abs(width);
    }
    if (height < 0) {
      y = currentY;
      height = Math.abs(height);
    }
    
    // Apply aspect ratio constraint
    if (lockAspect && aspectRatio !== 'free') {
      const ratio = getAspectRatioValue(aspectRatio);
      if (ratio) {
        const currentRatio = width / height;
        if (currentRatio > ratio) {
          width = height * ratio;
        } else {
          height = width / ratio;
        }
        
        // Ensure crop doesn't exceed image bounds
        if (x + width > imgWidth) {
          width = imgWidth - x;
          height = width / ratio;
        }
        if (y + height > imgHeight) {
          height = imgHeight - y;
          width = height * ratio;
        }
      }
    }
    
    setCropArea({ x, y, width, height });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setIsDraggingCrop(false);
    setIsResizing(false);
    setResizeHandle('');
  };

  const performCrop = async () => {
    if (!image || !imageRef.current || cropArea.width < 10 || cropArea.height < 10) {
      alert(ui.alerts.selectLargerArea);
      return;
    }

    setIsCropping(true);

    try {
      const img = imageRef.current;

      // Calculate scale between displayed image and actual image
      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;

      // Convert crop area to actual image coordinates
      const actualCrop = {
        x: Math.round(cropArea.x * scaleX),
        y: Math.round(cropArea.y * scaleY),
        width: Math.round(cropArea.width * scaleX),
        height: Math.round(cropArea.height * scaleY),
      };

      // Create canvas and crop
      const canvas = document.createElement('canvas');
      canvas.width = actualCrop.width;
      canvas.height = actualCrop.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Failed to get canvas context');

      // Create a new image element to draw from
      const sourceImg = new Image();
      sourceImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        sourceImg.onload = resolve;
        sourceImg.onerror = reject;
        sourceImg.src = image;
      });

      ctx.drawImage(
        sourceImg,
        actualCrop.x,
        actualCrop.y,
        actualCrop.width,
        actualCrop.height,
        0,
        0,
        actualCrop.width,
        actualCrop.height
      );

      // Get image data for encoding
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const exportFromCanvas = async (type: string, qualityValue?: number) => {
        const blobFromCanvas = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, type, qualityValue);
        });

        if (!blobFromCanvas) {
          throw new Error(`Failed to export ${type} image`);
        }

        return blobFromCanvas;
      };
      
      let blob: Blob;
      
      if (outputFormat === 'original') {
        // Use original format
        const origFormat = originalFormat.toLowerCase();
        if (origFormat === 'jpeg' || origFormat === 'jpg') {
          const encoded = await encodeJPEG(imageData, { quality });
          blob = new Blob([encoded], { type: 'image/jpeg' });
        } else if (origFormat === 'png') {
          const encoded = await encodePNG(imageData);
          blob = new Blob([encoded], { type: 'image/png' });
        } else if (origFormat === 'webp') {
          const encoded = await encodeWebP(imageData, { quality });
          blob = new Blob([encoded], { type: 'image/webp' });
        } else if (origFormat === 'avif') {
          blob = await exportFromCanvas('image/avif', quality / 100);
        } else {
          // Default to PNG for unknown formats
          const encoded = await encodePNG(imageData);
          blob = new Blob([encoded], { type: 'image/png' });
        }
      } else {
        switch (outputFormat) {
          case 'jpeg':
            const jpegData = await encodeJPEG(imageData, { quality });
            blob = new Blob([jpegData], { type: 'image/jpeg' });
            break;
          case 'png':
            const pngData = await encodePNG(imageData);
            blob = new Blob([pngData], { type: 'image/png' });
            break;
          case 'webp':
            const webpData = await encodeWebP(imageData, { quality });
            blob = new Blob([webpData], { type: 'image/webp' });
            break;
          case 'avif':
            blob = await exportFromCanvas('image/avif', quality / 100);
            break;
          default:
            const defaultData = await encodePNG(imageData);
            blob = new Blob([defaultData], { type: 'image/png' });
        }
      }

      const croppedUrl = URL.createObjectURL(blob);
      setCroppedImage(croppedUrl);
      setCroppedBlob(blob);
    } catch (error) {
      console.error('Crop error:', error);
      alert(ui.alerts.cropFailed);
    } finally {
      setIsCropping(false);
    }
  };

  const downloadResult = () => {
    if (!croppedBlob || !originalFile) return;
    
    const ext = outputFormat === 'original' 
      ? originalFormat.toLowerCase() === 'jpg' ? 'jpg' : originalFormat.toLowerCase()
      : outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    
    const url = URL.createObjectURL(croppedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cropped-${originalFile.name.split('.')[0]}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetCrop = () => {
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setCroppedImage(null);
    setCroppedBlob(null);
  };

  const clearImage = () => {
    setImage(null);
    setOriginalFile(null);
    setCroppedImage(null);
    setCroppedBlob(null);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Get actual crop dimensions in original image pixels
  const getActualCropDimensions = () => {
    if (!imageRef.current || cropArea.width === 0) return null;
    const scaleX = imageRef.current.naturalWidth / imageRef.current.clientWidth;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.clientHeight;
    return {
      width: Math.round(cropArea.width * scaleX),
      height: Math.round(cropArea.height * scaleY)
    };
  };

  const actualDims = getActualCropDimensions();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t.breadcrumb.home}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">{t.breadcrumb.imageCropper}</span>
        </nav>

        {/* Header - Same design as other pages */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {t.hero.title} <span className="text-blue-600">{t.hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400" style={{ fontSize: '1.1rem' }}>
            {t.hero.description}
          </p>
        </div>

        {/* Main Tool Area - Equal columns for balance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left: Upload/Crop Area - 6 columns */}
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
                    {ui.dropzone.maxSizeSingle}
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

                {/* Image Preview Area with Crop Selection */}
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
                      {ui.actions.delete}
                    </button>
                    
                    {/* Image with crop overlay */}
                    <div
                      ref={containerRef}
                      className="relative cursor-crosshair select-none"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      style={{
                        backgroundImage: 'radial-gradient(circle, rgba(156,163,175,0.3) 1px, transparent 1px)',
                        backgroundSize: '16px 16px'
                      }}
                    >
                      <img
                        ref={imageRef}
                        src={image}
                        alt="Upload"
                        className="max-w-full block mx-auto"
                        style={{ maxHeight: '400px' }}
                        draggable={false}
                        onLoad={() => {
                          if (imageRef.current) {
                            setDisplaySize({
                              width: imageRef.current.clientWidth,
                              height: imageRef.current.clientHeight
                            });
                          }
                        }}
                      />
                      
                      {/* Crop selection overlay */}
                      {cropArea.width > 0 && cropArea.height > 0 && (
                        <>
                          {/* Dark overlay outside crop area */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              left: (containerRef.current?.clientWidth || 0) / 2 - (imageRef.current?.clientWidth || 0) / 2,
                              top: 0,
                              width: imageRef.current?.clientWidth || 0,
                              height: imageRef.current?.clientHeight || 0,
                              background: 'rgba(0,0,0,0.4)',
                              clipPath: `polygon(
                                0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                                ${cropArea.x}px ${cropArea.y}px,
                                ${cropArea.x}px ${cropArea.y + cropArea.height}px,
                                ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px,
                                ${cropArea.x + cropArea.width}px ${cropArea.y}px,
                                ${cropArea.x}px ${cropArea.y}px
                              )`
                            }}
                          />
                          
                          {/* Crop border - Blue */}
                          <div
                            className="absolute"
                            style={{
                              left: (containerRef.current?.clientWidth || 0) / 2 - (imageRef.current?.clientWidth || 0) / 2 + cropArea.x,
                              top: cropArea.y,
                              width: cropArea.width,
                              height: cropArea.height,
                              border: '2px solid #3b82f6',
                            }}
                          >
                            {/* Corner handles - circles with cursors */}
                            <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-nw-resize z-10" />
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-ne-resize z-10" />
                            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-sw-resize z-10" />
                            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-se-resize z-10" />
                            
                            {/* Middle handles - circles with cursors */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-n-resize z-10" />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-s-resize z-10" />
                            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-w-resize z-10" />
                            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-e-resize z-10" />
                            
                            {/* Center area for moving */}
                            <div className="absolute inset-4 cursor-move" />
                            
                            {/* Dimensions label - bottom right inside */}
                            {actualDims && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {actualDims.width}×{actualDims.height}px
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Settings Panel - 6 columns */}
          <div className="lg:col-span-6 space-y-4">
            {/* Aspect Ratio */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
              }}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{ui.settings.aspectRatio}</h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => {
                      setAspectRatio(ratio.value);
                      if (ratio.value !== 'free') {
                        resetCrop();
                      }
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                      aspectRatio === ratio.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
              
              {/* Lock aspect checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  {ui.settings.lockAspect}
                </span>
              </label>
            </div>

            {/* Output Format */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
              }}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{ui.settings.outputFormat}</h3>
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
                      className={`px-2 py-2 text-xs font-medium rounded-lg border transition-all uppercase ${
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

            {/* Advanced Settings */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
              }}>
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showAdvancedSettings ? 'rotate-90' : ''}`} />
                  <Sliders className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{ui.settings.advancedSettings}</span>
                </div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                  {ui.settings.optimized}
                </span>
              </button>
              
              {showAdvancedSettings && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {outputFormat !== 'png' && (
                    <div>
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
                  {outputFormat === 'png' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {ui.settings.pngLossless}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-4"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
              }}>
              <div className="flex gap-3">
                <Button
                  onClick={performCrop}
                  disabled={!image || cropArea.width < 10 || isCropping}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCropping ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {ui.actions.cropping}
                    </>
                  ) : (
                    <>
                      <Crop className="w-4 h-4 mr-2" />
                      {ui.actions.startCrop}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={downloadResult}
                  disabled={!croppedBlob}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {ui.actions.downloadResult}
                </Button>
              </div>
              
              {image && (
                <button
                  onClick={resetCrop}
                  className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  {ui.actions.resetSelection}
                </button>
              )}
            </div>

            {/* Result Preview */}
            {croppedImage && (
              <div className="bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg p-4"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                }}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{ui.actions.croppedResult}</p>
                </div>
                <img
                  src={croppedImage}
                  alt="Cropped"
                  className="max-w-full max-h-32 mx-auto rounded border border-gray-200 dark:border-gray-700"
                />
                {croppedBlob && (
                  <p className="text-center text-xs text-gray-500 mt-2">
                    {ui.actions.size}: {formatSize(croppedBlob.size)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {!croppedImage && (
        <>
        {/* How To Section */}
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
              {ui.howTo.title}
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
                  {ui.howTo.step1Title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {ui.howTo.step1Desc}
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
                  {ui.howTo.step2Title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {ui.howTo.step2Desc}
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
                  {ui.howTo.step3Title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {ui.howTo.step3Desc}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              <span className="font-semibold">{ui.howTo.tip}</span> {ui.howTo.tipText}
            </p>
          </div>
        </div>

        {/* Why Crop Images Section */}
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
              {ui.why.title}
            </h2>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {ui.why.p1}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {ui.why.p2}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Focus className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {ui.why.b1}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Scissors className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {ui.why.b2}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Rocket className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {ui.why.b3}
              </p>
            </div>
          </div>
        </div>

        {/* Key Features Section */}
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
              {ui.features.title}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-4">
                <Crop className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                {ui.features.presetRatiosTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {ui.features.presetRatiosDesc}
              </p>
            </div>

            <div>
              <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                {ui.features.formatOptionsTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {ui.features.formatOptionsDesc}
              </p>
            </div>

            <div>
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                {ui.features.privateTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {ui.features.privateDesc}
              </p>
            </div>

            <div>
              <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
                {ui.features.instantTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {ui.features.instantDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Pro Tips Section */}
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
            <Lightbulb className="text-blue-600 dark:text-blue-400" style={{ width: '1.5rem', height: '1.5rem' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {ui.proTips.title}
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Crop className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {ui.proTips.t1}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Grid3X3 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {ui.proTips.t2}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ImageOff className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {ui.proTips.t3}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ImageIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {ui.proTips.t4}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
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
              {ui.faqTitle}
            </h2>
          </div>

          <div className="space-y-3">
            {t.faq.items.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <h3 className="m-0 p-0 text-base">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
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
