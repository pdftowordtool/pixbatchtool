'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Upload, Download, CheckCircle, Zap, Shield, ImageIcon, HelpCircle, ChevronRight, ChevronDown, Sliders, Crop, Lock, Unlock, RotateCcw, Info, Focus, Scissors, Rocket, Lightbulb, Grid3X3, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { encode as encodeWebP } from '@jsquash/webp'
import { useLocale } from '@/hooks/useLocale'

import enDict from '@/dictionaries/en/crop-webp.json'
import esDict from '@/dictionaries/es/crop-webp.json'
import deDict from '@/dictionaries/de/crop-webp.json'
import itDict from '@/dictionaries/it/crop-webp.json'

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
}

interface CropArea { x: number; y: number; width: number; height: number; }

export default function CropWebPPage() {
  const { locale, localePath } = useLocale()
  const t = dictionaries[locale] || enDict
  const ui = t.ui

  const [image, setImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })
  const [aspectRatio, setAspectRatio] = useState<string>('free')
  const [lockAspect, setLockAspect] = useState(true)
  const [quality, setQuality] = useState(85)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 })
  const [isSelecting, setIsSelecting] = useState(false)
  const [isDraggingCrop, setIsDraggingCrop] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string>('')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [initialCropArea, setInitialCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const aspectRatios = [
    { label: 'free', value: 'free' }, { label: '1:1', value: '1:1' }, { label: '4:3', value: '4:3' },
    { label: '3:2', value: '3:2' }, { label: '16:9', value: '16:9' }, { label: '9:16', value: '9:16' },
    { label: '2:3', value: '2:3' }, { label: '3:4', value: '3:4' }, { label: '21:9', value: '21:9' },
  ]

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { alert(ui.alerts.selectImageFile); return }
    if (file.size > 10 * 1024 * 1024) { alert(ui.alerts.fileSizeLimit); return }
    setOriginalFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => { setImage(e.target?.result as string); setCroppedImage(null); setCroppedBlob(null); setCropArea({ x: 0, y: 0, width: 0, height: 0 }) }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }, [])
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])

  const getAspectRatioValue = (ratio: string): number | null => {
    if (ratio === 'free') return null
    const [w, h] = ratio.split(':').map(Number)
    return w / h
  }

  useEffect(() => {
    if (imageRef.current && image) {
      const updateSize = () => {
        if (!imageRef.current) return
        const width = imageRef.current.clientWidth, height = imageRef.current.clientHeight
        setDisplaySize({ width, height })
        const padding = 20, cropWidth = width - padding * 2, cropHeight = height - padding * 2
        if (aspectRatio === 'free') { setCropArea({ x: padding, y: padding, width: cropWidth, height: cropHeight }) }
        else {
          const ratio = getAspectRatioValue(aspectRatio)
          if (ratio) {
            let nw = cropWidth, nh = cropWidth / ratio
            if (nh > cropHeight) { nh = cropHeight; nw = cropHeight * ratio }
            setCropArea({ x: (width - nw) / 2, y: (height - nh) / 2, width: nw, height: nh })
          }
        }
      }
      const timer = setTimeout(updateSize, 100)
      window.addEventListener('resize', updateSize)
      return () => { clearTimeout(timer); window.removeEventListener('resize', updateSize) }
    }
  }, [image])

  useEffect(() => {
    if (!imageRef.current || !image || displaySize.width === 0) return
    const imgW = displaySize.width, imgH = displaySize.height, ratio = getAspectRatioValue(aspectRatio)
    if (cropArea.width === 0 || cropArea.height === 0) {
      const p = 20, mw = imgW - p * 2, mh = imgH - p * 2
      if (!ratio) { setCropArea({ x: p, y: p, width: mw, height: mh }) }
      else { let nw = mw, nh = nw / ratio; if (nh > mh) { nh = mh; nw = nh * ratio }; setCropArea({ x: (imgW - nw) / 2, y: (imgH - nh) / 2, width: nw, height: nh }) }
      return
    }
    if (!ratio) return
    const cx = cropArea.x + cropArea.width / 2, cy = cropArea.y + cropArea.height / 2
    let nw = Math.max(cropArea.width, cropArea.height * ratio), nh = nw / ratio
    if (nh > imgH - 20) { nh = imgH - 20; nw = nh * ratio }
    if (nw > imgW - 20) { nw = imgW - 20; nh = nw / ratio }
    nw = Math.max(50, nw); nh = Math.max(50, nh)
    let nx = Math.max(0, Math.min(cx - nw / 2, imgW - nw)), ny = Math.max(0, Math.min(cy - nh / 2, imgH - nh))
    setCropArea({ x: nx, y: ny, width: nw, height: nh })
  }, [aspectRatio, displaySize])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top
    if (cropArea.width > 0 && cropArea.height > 0) {
      const hs = 12, handles = [
        { name: 'nw', x: cropArea.x, y: cropArea.y }, { name: 'n', x: cropArea.x + cropArea.width / 2, y: cropArea.y },
        { name: 'ne', x: cropArea.x + cropArea.width, y: cropArea.y }, { name: 'w', x: cropArea.x, y: cropArea.y + cropArea.height / 2 },
        { name: 'e', x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height / 2 }, { name: 'sw', x: cropArea.x, y: cropArea.y + cropArea.height },
        { name: 's', x: cropArea.x + cropArea.width / 2, y: cropArea.y + cropArea.height }, { name: 'se', x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
      ]
      for (const h of handles) { if (Math.abs(x - h.x) < hs && Math.abs(y - h.y) < hs) { setIsResizing(true); setResizeHandle(h.name); setDragStart({ x, y }); setInitialCropArea({ ...cropArea }); return } }
      if (x >= cropArea.x && x <= cropArea.x + cropArea.width && y >= cropArea.y && y <= cropArea.y + cropArea.height) { setIsDraggingCrop(true); setDragStart({ x: x - cropArea.x, y: y - cropArea.y }); return }
    }
    setIsSelecting(true); setStartPoint({ x, y }); setCropArea({ x, y, width: 0, height: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect(), imgW = imageRef.current.clientWidth, imgH = imageRef.current.clientHeight
    let cx = Math.max(0, Math.min(e.clientX - rect.left, imgW)), cy = Math.max(0, Math.min(e.clientY - rect.top, imgH))
    if (isResizing) {
      const dx = cx - dragStart.x, dy = cy - dragStart.y
      let nx = initialCropArea.x, ny = initialCropArea.y, nw = initialCropArea.width, nh = initialCropArea.height
      const ratio = lockAspect && aspectRatio !== 'free' ? getAspectRatioValue(aspectRatio) : null
      switch (resizeHandle) {
        case 'se': nw = Math.max(50, initialCropArea.width + dx); nh = ratio ? nw / ratio : Math.max(50, initialCropArea.height + dy); break
        case 'sw': nw = Math.max(50, initialCropArea.width - dx); nh = ratio ? nw / ratio : Math.max(50, initialCropArea.height + dy); nx = initialCropArea.x + initialCropArea.width - nw; break
        case 'ne': nw = Math.max(50, initialCropArea.width + dx); nh = ratio ? nw / ratio : Math.max(50, initialCropArea.height - dy); ny = initialCropArea.y + initialCropArea.height - nh; break
        case 'nw': nw = Math.max(50, initialCropArea.width - dx); nh = ratio ? nw / ratio : Math.max(50, initialCropArea.height - dy); nx = initialCropArea.x + initialCropArea.width - nw; ny = initialCropArea.y + initialCropArea.height - nh; break
        case 'n': if (ratio) { nh = Math.max(50, initialCropArea.height - dy); nw = nh * ratio; nx = initialCropArea.x + (initialCropArea.width - nw) / 2 } else { nh = Math.max(50, initialCropArea.height - dy) }; ny = initialCropArea.y + initialCropArea.height - nh; break
        case 's': if (ratio) { nh = Math.max(50, initialCropArea.height + dy); nw = nh * ratio; nx = initialCropArea.x + (initialCropArea.width - nw) / 2 } else { nh = Math.max(50, initialCropArea.height + dy) }; break
        case 'e': if (ratio) { nw = Math.max(50, initialCropArea.width + dx); nh = nw / ratio; ny = initialCropArea.y + (initialCropArea.height - nh) / 2 } else { nw = Math.max(50, initialCropArea.width + dx) }; break
        case 'w': if (ratio) { nw = Math.max(50, initialCropArea.width - dx); nh = nw / ratio; ny = initialCropArea.y + (initialCropArea.height - nh) / 2 } else { nw = Math.max(50, initialCropArea.width - dx) }; nx = initialCropArea.x + initialCropArea.width - nw; break
      }
      nx = Math.max(0, nx); ny = Math.max(0, ny); if (nx + nw > imgW) nw = imgW - nx; if (ny + nh > imgH) nh = imgH - ny
      setCropArea({ x: nx, y: ny, width: nw, height: nh }); return
    }
    if (isDraggingCrop) { let nx = Math.max(0, Math.min(cx - dragStart.x, imgW - cropArea.width)), ny = Math.max(0, Math.min(cy - dragStart.y, imgH - cropArea.height)); setCropArea(p => ({ ...p, x: nx, y: ny })); return }
    if (!isSelecting) return
    let w = cx - startPoint.x, h = cy - startPoint.y, x = startPoint.x, y = startPoint.y
    if (w < 0) { x = cx; w = Math.abs(w) }; if (h < 0) { y = cy; h = Math.abs(h) }
    if (lockAspect && aspectRatio !== 'free') { const r = getAspectRatioValue(aspectRatio); if (r) { if (w / h > r) w = h * r; else h = w / r; if (x + w > imgW) { w = imgW - x; h = w / r }; if (y + h > imgH) { h = imgH - y; w = h * r } } }
    setCropArea({ x, y, width: w, height: h })
  }

  const handleMouseUp = () => { setIsSelecting(false); setIsDraggingCrop(false); setIsResizing(false); setResizeHandle('') }

  const performCrop = async () => {
    if (!image || !imageRef.current || cropArea.width < 10 || cropArea.height < 10) { alert(ui.alerts.selectLargerArea); return }
    setIsCropping(true)
    try {
      const img = imageRef.current, scaleX = img.naturalWidth / img.clientWidth, scaleY = img.naturalHeight / img.clientHeight
      const ac = { x: Math.round(cropArea.x * scaleX), y: Math.round(cropArea.y * scaleY), width: Math.round(cropArea.width * scaleX), height: Math.round(cropArea.height * scaleY) }
      const canvas = document.createElement('canvas'); canvas.width = ac.width; canvas.height = ac.height
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Failed')
      const srcImg = new Image(); srcImg.crossOrigin = 'anonymous'
      await new Promise((res, rej) => { srcImg.onload = res; srcImg.onerror = rej; srcImg.src = image })
      ctx.drawImage(srcImg, ac.x, ac.y, ac.width, ac.height, 0, 0, ac.width, ac.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const encoded = await encodeWebP(imageData, { quality })
      const blob = new Blob([encoded], { type: 'image/webp' })
      setCroppedImage(URL.createObjectURL(blob)); setCroppedBlob(blob)
    } catch (e) { console.error(e); alert(ui.alerts.cropFailed) } finally { setIsCropping(false) }
  }

  const downloadResult = () => { if (!croppedBlob || !originalFile) return; const a = document.createElement('a'); a.href = URL.createObjectURL(croppedBlob); a.download = `cropped-${originalFile.name.split('.')[0]}.webp`; a.click() }
  const resetCrop = () => { setCropArea({ x: 0, y: 0, width: 0, height: 0 }); setCroppedImage(null); setCroppedBlob(null) }
  const clearImage = () => { setImage(null); setOriginalFile(null); setCroppedImage(null); setCroppedBlob(null); setCropArea({ x: 0, y: 0, width: 0, height: 0 }) }
  const formatSize = (b: number) => { if (b === 0) return '0 Bytes'; const k = 1024, s = ['Bytes', 'KB', 'MB']; const i = Math.floor(Math.log(b) / Math.log(k)); return Math.round((b / Math.pow(k, i)) * 100) / 100 + ' ' + s[i] }
  const getActualCropDimensions = () => { if (!imageRef.current || cropArea.width === 0) return null; return { width: Math.round(cropArea.width * imageRef.current.naturalWidth / imageRef.current.clientWidth), height: Math.round(cropArea.height * imageRef.current.naturalHeight / imageRef.current.clientHeight) } }

  const faqs = t.faq.items

  const actualDims = getActualCropDimensions()

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href={localePath('/')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.breadcrumb.home}</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={localePath('/crop-image')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.breadcrumb.imageCropper}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">{t.breadcrumb.cropWebp}</span>
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
          <div className="lg:col-span-6 space-y-4">
            {!image ? (
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
                className={`relative border-2 border-dashed transition-all duration-500 bg-white dark:bg-gray-800 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02] shadow-xl' : isHovering ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'}`}
                style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))', minHeight: '380px' }}>
                <svg className="absolute top-0 right-0 pointer-events-none" style={{ width: '20px', height: '20px' }}><path d="M 0 0 L 20 0 L 20 20 Z" className={`transition-all ${isDragging ? 'fill-blue-600' : isHovering ? 'fill-blue-500' : 'fill-gray-400 dark:fill-gray-600'}`} /></svg>
                <label className="flex flex-col items-center justify-center h-full min-h-[380px] cursor-pointer p-6">
                  <div className={`w-16 h-16 bg-blue-600 flex items-center justify-center mb-5 transition-all ${isDragging ? 'scale-110 rotate-6' : isHovering ? 'scale-105' : ''}`} style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
                    <Upload className={`w-8 h-8 text-white transition-transform ${isDragging ? 'translate-y-[-4px]' : isHovering ? 'translate-y-[-2px]' : ''}`} strokeWidth={2} />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">{ui.dropzone.dropYourImageHere}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{ui.dropzone.orClickBrowse}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{ui.dropzone.maxSizeHint}</p>
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
                </label>
              </div>
            ) : (
              <>
                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg transition-all bg-white dark:bg-gray-800 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
                  style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>
                  <svg className="absolute top-0 right-0 pointer-events-none" style={{ width: '16px', height: '16px' }}><path d="M 0 0 L 16 0 L 16 16 Z" className={`${isDragging ? 'fill-blue-500' : 'fill-gray-300 dark:fill-gray-600'}`} /></svg>
                  <label className="flex flex-col items-center justify-center py-6 cursor-pointer">
                    <div className="w-10 h-10 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg flex items-center justify-center mb-3"><Upload className="w-5 h-5 text-gray-400" /></div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{ui.replace.title}</p>
                    <p className="text-xs text-gray-500">{ui.replace.orDropNew}</p>
                    <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>
                <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle, rgba(156,163,175,0.3) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
                  <button onClick={clearImage} className="absolute top-3 right-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded z-20">{ui.actions.delete}</button>
                  <div ref={containerRef} className="relative cursor-crosshair select-none" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                    <img ref={imageRef} src={image} alt={ui.images.uploadAlt} className="max-w-full block mx-auto" style={{ maxHeight: '400px' }} draggable={false} onLoad={() => imageRef.current && setDisplaySize({ width: imageRef.current.clientWidth, height: imageRef.current.clientHeight })} />
                    {cropArea.width > 0 && cropArea.height > 0 && (
                      <>
                        <div className="absolute pointer-events-none" style={{ left: (containerRef.current?.clientWidth || 0) / 2 - (imageRef.current?.clientWidth || 0) / 2, top: 0, width: imageRef.current?.clientWidth || 0, height: imageRef.current?.clientHeight || 0, background: 'rgba(0,0,0,0.4)', clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${cropArea.x}px ${cropArea.y}px, ${cropArea.x}px ${cropArea.y + cropArea.height}px, ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px, ${cropArea.x + cropArea.width}px ${cropArea.y}px, ${cropArea.x}px ${cropArea.y}px)` }} />
                        <div className="absolute" style={{ left: (containerRef.current?.clientWidth || 0) / 2 - (imageRef.current?.clientWidth || 0) / 2 + cropArea.x, top: cropArea.y, width: cropArea.width, height: cropArea.height, border: '2px solid #3b82f6' }}>
                          <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-nw-resize z-10" />
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-ne-resize z-10" />
                          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-sw-resize z-10" />
                          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-se-resize z-10" />
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-n-resize z-10" />
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-s-resize z-10" />
                          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-w-resize z-10" />
                          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-e-resize z-10" />
                          <div className="absolute inset-4 cursor-move" />
                          {actualDims && <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{actualDims.width}×{actualDims.height}px</div>}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{ui.settings.aspectRatio}</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {aspectRatios.map((r) => (
                  <button key={r.value} onClick={() => { setAspectRatio(r.value); if (r.value !== 'free') resetCrop() }} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${aspectRatio === r.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}>{r.label}</button>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">{lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}{ui.settings.lockAspect}</span>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{ui.settings.outputFormat}</p>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <ImageIcon className="w-5 h-5 text-green-600" />
                <div><p className="text-sm font-medium text-gray-900 dark:text-white">{ui.settings.webpModernTitle}</p><p className="text-xs text-gray-500">{ui.settings.webpModernDesc}</p></div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
              <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-2"><ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} /><Sliders className="w-4 h-4 text-gray-500" /><span className="text-sm font-medium text-gray-900 dark:text-white">{ui.quality.panelTitle}</span></div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">{quality}%</span>
              </button>
              {showAdvanced && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-700 dark:text-gray-300">{ui.quality.qualityLabel}</span><span className="text-sm font-medium text-blue-600">{quality}%</span></div>
                  <Slider value={[quality]} onValueChange={(v: number[]) => setQuality(v[0])} min={1} max={100} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1"><span>{ui.quality.smallerFile}</span><span>{ui.quality.betterQuality}</span></div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
              <div className="flex gap-3">
                <Button onClick={performCrop} disabled={!image || cropArea.width < 10 || isCropping} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 font-medium disabled:opacity-50">
                  {isCropping ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />{ui.actions.cropping}</> : <><Crop className="w-4 h-4 mr-2" />{ui.actions.startCrop}</>}
                </Button>
                <Button onClick={downloadResult} disabled={!croppedBlob} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 font-medium disabled:opacity-50"><Download className="w-4 h-4 mr-2" />{ui.actions.downloadWebp}</Button>
              </div>
              {image && <button onClick={resetCrop} className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"><RotateCcw className="w-4 h-4" />{ui.actions.resetSelection}</button>}
            </div>

            {croppedImage && (
              <div className="bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
                <div className="flex items-center gap-2 mb-3"><CheckCircle className="w-5 h-5 text-green-600" /><p className="text-sm font-semibold text-gray-900 dark:text-white">{ui.actions.croppedResult}</p></div>
                <img src={croppedImage} alt={ui.images.croppedAlt} className="max-w-full max-h-32 mx-auto rounded border border-gray-200 dark:border-gray-700" />
                {croppedBlob && <p className="text-center text-xs text-gray-500 mt-2">{ui.actions.size}: {formatSize(croppedBlob.size)}</p>}
              </div>
            )}
          </div>
        </div>

        {!croppedImage && (
        <>
        {/* How To */}
        <div className="mt-16 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 p-8 relative transition-colors group" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>
          <svg className="absolute top-0 right-0 pointer-events-none" style={{ width: '20px', height: '20px' }}><path d="M 0 0 L 20 0 L 20 20 Z" className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400" /></svg>
          <div className="flex items-center gap-3 mb-8"><HelpCircle className="w-6 h-6 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ui.howTo.title}</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex gap-4"><div className="flex-shrink-0"><div className="bg-blue-600 flex items-center justify-center text-white text-base font-bold" style={{ width: '2rem', height: '2rem', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>01</div></div><div><h3 className="text-gray-900 dark:text-white mb-3 font-semibold">{ui.howTo.step1Title}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{ui.howTo.step1Desc}</p></div></div>
            <div className="flex gap-4"><div className="flex-shrink-0"><div className="bg-blue-600 flex items-center justify-center text-white text-base font-bold" style={{ width: '2rem', height: '2rem', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>02</div></div><div><h3 className="text-gray-900 dark:text-white mb-3 font-semibold">{ui.howTo.step2Title}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{ui.howTo.step2Desc}</p></div></div>
            <div className="flex gap-4"><div className="flex-shrink-0"><div className="bg-blue-600 flex items-center justify-center text-white text-base font-bold" style={{ width: '2rem', height: '2rem', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>03</div></div><div><h3 className="text-gray-900 dark:text-white mb-3 font-semibold">{ui.howTo.step3Title}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{ui.howTo.step3Desc}</p></div></div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"><p className="text-sm text-blue-800 dark:text-blue-200"><span className="font-semibold">{ui.howTo.tip}</span> {ui.howTo.tipText}</p></div>
        </div>

        {/* Why Crop WebP */}
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 p-8 relative transition-colors group" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>
          <svg className="absolute top-0 right-0 pointer-events-none" style={{ width: '20px', height: '20px' }}><path d="M 0 0 L 20 0 L 20 20 Z" className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400" /></svg>
          <div className="flex items-center gap-3 mb-6"><Info className="w-6 h-6 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ui.why.title}</h2></div>
          <div className="space-y-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">{ui.why.p1}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{ui.why.p2}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3"><Focus className="w-5 h-5 text-blue-500 mt-0.5" /><p className="text-sm text-gray-600 dark:text-gray-400">{ui.why.b1}</p></div>
            <div className="flex items-start gap-3"><Scissors className="w-5 h-5 text-blue-500 mt-0.5" /><p className="text-sm text-gray-600 dark:text-gray-400">{ui.why.b2}</p></div>
            <div className="flex items-start gap-3"><Rocket className="w-5 h-5 text-blue-500 mt-0.5" /><p className="text-sm text-gray-600 dark:text-gray-400">{ui.why.b3}</p></div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 p-8 relative transition-colors group" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>
          <svg className="absolute top-0 right-0 pointer-events-none" style={{ width: '20px', height: '20px' }}><path d="M 0 0 L 20 0 L 20 20 Z" className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400" /></svg>
          <div className="flex items-center gap-3 mb-8"><Zap className="w-6 h-6 text-green-600" /><h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ui.features.title}</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div><div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-4"><Crop className="w-6 h-6 text-blue-600" /></div><h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-sm">{ui.features.presetRatiosTitle}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{ui.features.presetRatiosDesc}</p></div>
            <div><div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center mb-4"><ImageIcon className="w-6 h-6 text-green-600" /></div><h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-sm">{ui.features.transparencyTitle}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{ui.features.transparencyDesc}</p></div>
            <div><div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 flex items-center justify-center mb-4"><Shield className="w-6 h-6 text-purple-600" /></div><h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-sm">{ui.features.privateTitle}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{ui.features.privateDesc}</p></div>
            <div><div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 flex items-center justify-center mb-4"><Zap className="w-6 h-6 text-orange-600" /></div><h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-sm">{ui.features.compressionTitle}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{ui.features.compressionDesc}</p></div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-300 p-8 relative transition-colors group" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>
          <svg className="absolute top-0 right-0 pointer-events-none" style={{ width: '20px', height: '20px' }}><path d="M 0 0 L 20 0 L 20 20 Z" className="fill-gray-400 dark:fill-gray-600 group-hover:fill-blue-400" /></svg>
          <div className="flex items-center gap-3 mb-6"><Lightbulb className="w-6 h-6 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ui.proTips.title}</h2></div>
          <div className="space-y-3">
            <div className="flex items-start gap-3"><Crop className="w-5 h-5 text-blue-500 mt-0.5" /><p className="text-sm text-gray-600 dark:text-gray-400">{ui.proTips.t1}</p></div>
            <div className="flex items-start gap-3"><Grid3X3 className="w-5 h-5 text-blue-500 mt-0.5" /><p className="text-sm text-gray-600 dark:text-gray-400">{ui.proTips.t2}</p></div>
            <div className="flex items-start gap-3"><ImageOff className="w-5 h-5 text-blue-500 mt-0.5" /><p className="text-sm text-gray-600 dark:text-gray-400">{ui.proTips.t3}</p></div>
            <div className="flex items-start gap-3"><ImageIcon className="w-5 h-5 text-blue-500 mt-0.5" /><p className="text-sm text-gray-600 dark:text-gray-400">{ui.proTips.t4}</p></div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-orange-300 p-8 relative transition-colors group" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>
          <svg className="absolute top-0 right-0 pointer-events-none" style={{ width: '20px', height: '20px' }}><path d="M 0 0 L 20 0 L 20 20 Z" className="fill-gray-400 dark:fill-gray-600 group-hover:fill-orange-400" /></svg>
          <div className="flex items-center gap-3 mb-8"><HelpCircle className="w-6 h-6 text-orange-600" /><h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ui.faqTitle}</h2></div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaqIndex === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all ${openFaqIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700"><p className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p></div>
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
