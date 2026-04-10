'use client';
import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const size = Math.min(pixelCrop.width, pixelCrop.height);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas leer'))),
      'image/jpeg',
      0.9,
    );
  });
}

export default function SteckbriefImageCropper({ imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const croppedAreaRef = useRef<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    croppedAreaRef.current = croppedAreaPixels;
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaRef.current) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaRef.current);
      onConfirm(blob);
    } catch {
      // fallback: use original
      const resp = await fetch(imageSrc);
      const blob = await resp.blob();
      onConfirm(blob);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bild zuschneiden</DialogTitle>
        </DialogHeader>

        {/* Crop canvas area */}
        <div className="relative w-full rounded-xl overflow-hidden bg-gray-900" style={{ height: 300 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 mt-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            className="p-1 rounded text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1.5 appearance-none bg-gray-200 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 cursor-pointer"
          />
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            className="p-1 rounded text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Abbrechen</Button>
          <Button type="button" onClick={handleConfirm} loading={processing}>
            Zuschnitt übernehmen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
