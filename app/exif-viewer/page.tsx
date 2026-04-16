'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Upload, Download, Zap, Shield, ImageIcon, HelpCircle, ChevronRight, ChevronDown, Camera, MapPin, Calendar, Settings, Aperture, Info, FileImage, Eye, Sun, Focus, Timer, Globe, Building2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/hooks/useLocale'
import exifr from 'exifr'

import enDict from '@/dictionaries/en/exif-viewer.json'
import esDict from '@/dictionaries/es/exif-viewer.json'
import deDict from '@/dictionaries/de/exif-viewer.json'
import itDict from '@/dictionaries/it/exif-viewer.json'

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
}

interface ExifData {
  Make?: string;
  Model?: string;
  Software?: string;
  DateTime?: string;
  DateTimeOriginal?: string;
  DateTimeDigitized?: string;
  ExposureTime?: number;
  FNumber?: number;
  ISO?: number;
  ISOSpeedRatings?: number;
  FocalLength?: number;
  FocalLengthIn35mmFormat?: number;
  ExposureProgram?: number;
  ExposureMode?: number;
  MeteringMode?: number;
  WhiteBalance?: number;
  Flash?: number;
  ImageWidth?: number;
  ImageHeight?: number;
  ExifImageWidth?: number;
  ExifImageHeight?: number;
  Orientation?: number;
  ColorSpace?: number;
  BitsPerSample?: number;
  XResolution?: number;
  YResolution?: number;
  ResolutionUnit?: number;
  GPSLatitude?: number;
  GPSLongitude?: number;
  GPSAltitude?: number;
  GPSLatitudeRef?: string;
  GPSLongitudeRef?: string;
  latitude?: number;
  longitude?: number;
  LensModel?: string;
  LensMake?: string;
  LensInfo?: number[];
  Artist?: string;
  Copyright?: string;
  ImageDescription?: string;
  UserComment?: string;
  [key: string]: any;
}

export default function ExifViewerPage() {
  const { locale, localePath } = useLocale();
  const t = dictionaries[locale] || enDict;
  const ui = t.ui;
  const v = ui.values;

  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileType, setFileType] = useState<string>('');
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'image' | 'gps' | 'all'>('camera');

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(ui.alerts.selectImageFile);
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      setError(ui.alerts.fileSizeLimit);
      return;
    }

    setIsLoading(true);
    setError(null);
    setFileName(file.name);
    setFileSize(file.size);
    setFileType(file.type);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const data = await exifr.parse(file, {
        tiff: true,
        exif: true,
        gps: true,
        ifd1: true,
        interop: true,
        iptc: true,
        xmp: true,
        icc: true,
        makerNote: false,
        userComment: true,
        translateKeys: true,
        translateValues: true,
        reviveValues: true,
        sanitize: true,
        mergeOutput: true,
      });
      
      setExifData(data || {});
      setIsLoading(false);
    } catch (err) {
      console.error('Error parsing EXIF:', err);
      setExifData({});
      setIsLoading(false);
    }
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

  const resetAll = () => {
    setImage(null);
    setExifData(null);
    setFileName('');
    setFileSize(0);
    setFileType('');
    setError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatExposureTime = (time: number): string => {
    if (time >= 1) return `${time}s`;
    return `1/${Math.round(1 / time)}s`;
  };

  const getExposureProgramName = (value: number): string => {
    return v.exposurePrograms[String(value) as keyof typeof v.exposurePrograms] || v.unknown;
  };

  const getMeteringModeName = (value: number): string => {
    return v.meteringModes[String(value) as keyof typeof v.meteringModes] || v.unknown;
  };

  const getFlashDescription = (value: number): string => {
    if (value === 0) return v.flash.noFlash;
    if (value === 1) return v.flash.flashFired;
    if (value === 16) return v.flash.noFlashCompulsory;
    if (value === 24) return v.flash.noFlashAuto;
    if (value === 25) return v.flash.flashFiredAuto;
    return value ? v.flash.flashUsed : v.flash.noFlash;
  };

  const getWhiteBalanceName = (value: number): string => {
    return value === 0 ? v.auto : v.manual;
  };

  const getOrientationName = (value: number): string => {
    return v.orientation[String(value) as keyof typeof v.orientation] || v.unknown;
  };

  const formatDate = (dateStr: string | Date): string => {
    if (!dateStr) return v.unknown;
    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr.replace(/:/g, '-').replace(/-/, ':').replace(/-/, ':')) : dateStr;
      return date.toLocaleString();
    } catch {
      return String(dateStr);
    }
  };

  const formatGPSCoordinate = (value: number, isLat: boolean): string => {
    const direction = isLat ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
    const absValue = Math.abs(value);
    const degrees = Math.floor(absValue);
    const minutes = Math.floor((absValue - degrees) * 60);
    const seconds = ((absValue - degrees - minutes / 60) * 3600).toFixed(2);
    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  };

  const openInMaps = () => {
    if (exifData?.latitude && exifData?.longitude) {
      const url = new URL('https://www.google.com/maps');
      url.searchParams.set('q', `${exifData.latitude},${exifData.longitude}`);
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    }
  };

  const exportExifAsJSON = () => {
    if (!exifData) return;
    const dataStr = JSON.stringify(exifData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.split('.')[0]}_exif.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasGPSData = exifData?.latitude || exifData?.longitude || exifData?.GPSLatitude || exifData?.GPSLongitude;
  const hasCameraData = exifData?.Make || exifData?.Model || exifData?.ExposureTime || exifData?.FNumber || exifData?.ISO;

  const faqs = t.faq.items;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href={localePath('/')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.breadcrumb.home}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">{t.breadcrumb.exifViewer}</span>
        </nav>

        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {t.hero.title} <span className="text-blue-600">{t.hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400" style={{ fontSize: '1.1rem' }}>
            {t.hero.description}
          </p>
        </div>

        {!image ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`relative border-2 border-dashed transition-all duration-500 bg-white dark:bg-gray-800 mb-8 ${
              isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02] shadow-xl'
                : isHovering ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
            style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))', minHeight: '380px' }}
          >
            <svg className="absolute top-0 right-0 pointer-events-none" style={{ width: '20px', height: '20px' }}>
              <path d="M 0 0 L 20 0 L 20 20 Z" className={`transition-all duration-300 ${isDragging ? 'fill-blue-600' : isHovering ? 'fill-blue-500' : 'fill-gray-400 dark:fill-gray-600'}`} />
            </svg>
            <label className="flex flex-col items-center justify-center h-full min-h-[380px] cursor-pointer p-6">
              <div className={`w-16 h-16 bg-blue-600 flex items-center justify-center mb-5 transition-all duration-500 ${isDragging ? 'scale-110 rotate-6' : isHovering ? 'scale-105' : ''}`} style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
                <Upload className={`w-8 h-8 text-white transition-transform duration-500 ${isDragging ? 'translate-y-[-4px]' : isHovering ? 'translate-y-[-2px]' : ''}`} strokeWidth={2} />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">{ui.dropzone.dropYourImageHere}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{ui.dropzone.orClickBrowse}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{ui.dropzone.maxSizeHint}</p>
              <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
            </label>
            {error && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center mb-8" style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}>
            <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{ui.loading.extracting}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Left Column - Image & File Info */}
            <div className="lg:col-span-5 space-y-4">
              {/* Replace Image */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg transition-all duration-300 bg-white dark:bg-gray-800 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
                style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
              >
                <svg className="absolute top-0 right-0 pointer-events-none" style={{ width: '16px', height: '16px' }}>
                  <path d="M 0 0 L 16 0 L 16 16 Z" className={`transition-all duration-300 ${isDragging ? 'fill-blue-500' : 'fill-gray-300 dark:fill-gray-600'}`} />
                </svg>
                <label className="flex flex-col items-center justify-center py-4 cursor-pointer">
                  <div className="w-8 h-8 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg flex items-center justify-center mb-2">
                    <Upload className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{ui.replace.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ui.replace.orDropNew}</p>
                  <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                </label>
              </div>

              {/* Image Preview */}
              <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle, rgba(156,163,175,0.3) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
                <button onClick={resetAll} className="absolute top-3 right-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors z-20">{ui.actions.delete}</button>
                <img src={image} alt={ui.messages.previewAlt} className="max-w-full block mx-auto" style={{ maxHeight: '300px' }} />
              </div>

              {/* File Info */}
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-blue-600" />
                  {ui.fileInfo.title}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{ui.fileInfo.name}</span>
                    <span className="text-gray-900 dark:text-white font-medium truncate max-w-[180px]" title={fileName}>{fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{ui.fileInfo.size}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatFileSize(fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{ui.fileInfo.type}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{fileType}</span>
                  </div>
                  {(exifData?.ExifImageWidth || exifData?.ImageWidth) && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{ui.fileInfo.dimensions}</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {exifData?.ExifImageWidth || exifData?.ImageWidth} × {exifData?.ExifImageHeight || exifData?.ImageHeight}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                <div className="flex gap-3">
                  <Button onClick={exportExifAsJSON} disabled={!exifData || Object.keys(exifData).length === 0} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 font-medium disabled:opacity-50">
                    <Download className="w-4 h-4 mr-2" />{ui.actions.exportJson}
                  </Button>
                  <Button onClick={resetAll} variant="outline" className="flex-1 border-gray-300 dark:border-gray-600 px-4 py-2.5 font-medium">
                    <RotateCcw className="w-4 h-4 mr-2" />{ui.actions.newImage}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - EXIF Data */}
            <div className="lg:col-span-7 space-y-4">
              {!exifData || Object.keys(exifData).length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{ui.emptyExif.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    {ui.emptyExif.description}
                  </p>
                </div>
              ) : (
                <>
                  {/* Tabs */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'camera', label: ui.tabs.camera, icon: Camera },
                        { id: 'image', label: ui.tabs.image, icon: ImageIcon },
                        { id: 'gps', label: ui.tabs.gps, icon: MapPin },
                        { id: 'all', label: ui.tabs.all, icon: Settings },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-2 ${
                            activeTab === tab.id
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Camera Tab */}
                  {activeTab === 'camera' && (
                    <div className="space-y-4">
                      {(exifData.Make || exifData.Model || exifData.LensModel) && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-600" />{ui.panels.cameraLens}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {exifData.Make && (
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.make}</span><span className="text-gray-900 dark:text-white font-medium">{exifData.Make}</span></div>
                            )}
                            {exifData.Model && (
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.model}</span><span className="text-gray-900 dark:text-white font-medium">{exifData.Model}</span></div>
                            )}
                            {exifData.LensModel && (
                              <div className="flex justify-between sm:col-span-2"><span className="text-gray-500 dark:text-gray-400">{ui.labels.lens}</span><span className="text-gray-900 dark:text-white font-medium">{exifData.LensModel}</span></div>
                            )}
                            {exifData.Software && (
                              <div className="flex justify-between sm:col-span-2"><span className="text-gray-500 dark:text-gray-400">{ui.labels.software}</span><span className="text-gray-900 dark:text-white font-medium">{exifData.Software}</span></div>
                            )}
                          </div>
                        </div>
                      )}

                      {(exifData.ExposureTime || exifData.FNumber || exifData.ISO || exifData.ISOSpeedRatings) && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Aperture className="w-4 h-4 text-blue-600" />{ui.panels.exposureSettings}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {exifData.ExposureTime && (
                              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <Timer className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">{ui.labels.shutter}</p>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatExposureTime(exifData.ExposureTime)}</p>
                              </div>
                            )}
                            {exifData.FNumber && (
                              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <Aperture className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">{ui.labels.aperture}</p>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">f/{exifData.FNumber}</p>
                              </div>
                            )}
                            {(exifData.ISO || exifData.ISOSpeedRatings) && (
                              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <Sun className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">{ui.labels.iso}</p>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{exifData.ISO || exifData.ISOSpeedRatings}</p>
                              </div>
                            )}
                            {exifData.FocalLength && (
                              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <Focus className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">{ui.labels.focal}</p>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{exifData.FocalLength}mm</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(exifData.ExposureProgram !== undefined || exifData.MeteringMode !== undefined || exifData.Flash !== undefined) && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-blue-600" />{ui.panels.cameraSettings}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {exifData.ExposureProgram !== undefined && (
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.exposureMode}</span><span className="text-gray-900 dark:text-white font-medium">{getExposureProgramName(exifData.ExposureProgram)}</span></div>
                            )}
                            {exifData.MeteringMode !== undefined && (
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.metering}</span><span className="text-gray-900 dark:text-white font-medium">{getMeteringModeName(exifData.MeteringMode)}</span></div>
                            )}
                            {exifData.Flash !== undefined && (
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.flash}</span><span className="text-gray-900 dark:text-white font-medium">{getFlashDescription(exifData.Flash)}</span></div>
                            )}
                            {exifData.WhiteBalance !== undefined && (
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.whiteBalance}</span><span className="text-gray-900 dark:text-white font-medium">{getWhiteBalanceName(exifData.WhiteBalance)}</span></div>
                            )}
                          </div>
                        </div>
                      )}

                      {(exifData.DateTimeOriginal || exifData.DateTime) && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />{ui.panels.dateTime}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {exifData.DateTimeOriginal && (
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.taken}</span><span className="text-gray-900 dark:text-white font-medium">{formatDate(exifData.DateTimeOriginal)}</span></div>
                            )}
                            {exifData.DateTime && exifData.DateTime !== exifData.DateTimeOriginal && (
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.modified}</span><span className="text-gray-900 dark:text-white font-medium">{formatDate(exifData.DateTime)}</span></div>
                            )}
                          </div>
                        </div>
                      )}

                      {!hasCameraData && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">{ui.messages.noCameraInfo}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Tab */}
                  {activeTab === 'image' && (
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-blue-600" />{ui.panels.imageProperties}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {(exifData.ExifImageWidth || exifData.ImageWidth) && (
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.width}</span><span className="text-gray-900 dark:text-white font-medium">{exifData.ExifImageWidth || exifData.ImageWidth}px</span></div>
                          )}
                          {(exifData.ExifImageHeight || exifData.ImageHeight) && (
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.height}</span><span className="text-gray-900 dark:text-white font-medium">{exifData.ExifImageHeight || exifData.ImageHeight}px</span></div>
                          )}
                          {exifData.Orientation && (
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.orientation}</span><span className="text-gray-900 dark:text-white font-medium">{getOrientationName(exifData.Orientation)}</span></div>
                          )}
                          {exifData.ColorSpace !== undefined && (
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.colorSpace}</span><span className="text-gray-900 dark:text-white font-medium">{exifData.ColorSpace === 1 ? v.colorSpace.sRGB : v.colorSpace.uncalibrated}</span></div>
                          )}
                          {exifData.XResolution && (
                            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.resolution}</span><span className="text-gray-900 dark:text-white font-medium">{exifData.XResolution} DPI</span></div>
                          )}
                        </div>
                      </div>

                      {(exifData.Artist || exifData.Copyright) && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />{ui.panels.copyrightCredits}
                          </h4>
                          <div className="space-y-3 text-sm">
                            {exifData.Artist && (
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.artist}</span><span className="text-gray-900 dark:text-white font-medium">{exifData.Artist}</span></div>
                            )}
                            {exifData.Copyright && (
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{ui.labels.copyright}</span><span className="text-gray-900 dark:text-white font-medium">{exifData.Copyright}</span></div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* GPS Tab */}
                  {activeTab === 'gps' && (
                    <div className="space-y-4">
                      {hasGPSData ? (
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />{ui.panels.locationData}
                          </h4>
                          <div className="space-y-3 text-sm">
                            {(exifData.latitude || exifData.GPSLatitude) && (
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">{ui.labels.latitude}</span>
                                <span className="text-gray-900 dark:text-white font-medium">{exifData.latitude ? formatGPSCoordinate(exifData.latitude, true) : exifData.GPSLatitude}</span>
                              </div>
                            )}
                            {(exifData.longitude || exifData.GPSLongitude) && (
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">{ui.labels.longitude}</span>
                                <span className="text-gray-900 dark:text-white font-medium">{exifData.longitude ? formatGPSCoordinate(exifData.longitude, false) : exifData.GPSLongitude}</span>
                              </div>
                            )}
                            {exifData.GPSAltitude !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">{ui.labels.altitude}</span>
                                <span className="text-gray-900 dark:text-white font-medium">{Math.round(exifData.GPSAltitude)}m</span>
                              </div>
                            )}
                          </div>
                          {(exifData.latitude && exifData.longitude) && (
                            <Button onClick={openInMaps} className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                              <Globe className="w-4 h-4 mr-2" />{ui.actions.openInGoogleMaps}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">{ui.messages.noGpsData}</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{ui.messages.gpsHint}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* All Data Tab */}
                  {activeTab === 'all' && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-[500px] overflow-y-auto" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 sticky top-0 bg-white dark:bg-gray-800 py-2">
                        <Settings className="w-4 h-4 text-blue-600" />{ui.panels.allExifData} ({Object.keys(exifData).length} {ui.panels.fields})
                      </h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(exifData)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between items-start py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                              <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">{key}</span>
                              <span className="text-gray-900 dark:text-white font-medium text-right max-w-[60%] break-all text-xs">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ui.features.privateTitle}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.features.privateDesc}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ui.features.instantTitle}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.features.instantDesc}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ui.features.completeTitle}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{ui.features.completeDesc}</p>
            </div>
          </div>
        </div>

        {/* How to View EXIF Metadata Section */}
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
              <div><h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>{ui.howTo.step1Title}</h3><p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.howTo.step1Desc}</p></div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0"><div className="bg-blue-600 flex items-center justify-center text-white text-base font-bold relative" style={{ width: '2rem', height: '2rem', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>02</div></div>
              <div><h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>{ui.howTo.step2Title}</h3><p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.howTo.step2Desc}</p></div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0"><div className="bg-blue-600 flex items-center justify-center text-white text-base font-bold relative" style={{ width: '2rem', height: '2rem', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>03</div></div>
              <div><h3 className="text-gray-900 dark:text-white mb-3" style={{ fontSize: '1rem', fontWeight: 600 }}>{ui.howTo.step3Title}</h3><p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.howTo.step3Desc}</p></div>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed"><span className="font-semibold">{ui.howTo.tipLabel}</span> {ui.howTo.tipText}</p>
          </div>
        </div>

        {/* What Information is in EXIF? Section */}
        <div
          className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 p-8 relative transition-colors duration-300 group"
          style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
        >
          <svg className="absolute top-0 right-0 pointer-events-none transition-all duration-300" style={{ width: '20px', height: '20px' }}><path d="M 0 0 L 20 0 L 20 20 Z" className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400" /></svg>
          <div className="flex items-center gap-3 mb-6">
            <Info className="text-blue-600 dark:text-blue-400" style={{ width: '1.5rem', height: '1.5rem' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{ui.exifInfo.title}</h2>
          </div>
          <div className="space-y-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.exifInfo.p1}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ui.exifInfo.p2}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Camera className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{ui.exifInfo.cards.cameraLensTitle}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{ui.exifInfo.cards.cameraLensDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Aperture className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{ui.exifInfo.cards.exposureSettingsTitle}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{ui.exifInfo.cards.exposureSettingsDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{ui.exifInfo.cards.gpsTitle}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{ui.exifInfo.cards.gpsDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{ui.exifInfo.cards.dateTimeTitle}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{ui.exifInfo.cards.dateTimeDesc}</p>
              </div>
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
