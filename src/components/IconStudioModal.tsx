/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { WrapperConfig } from '../types';
import { 
  createDefaultAppIconCanvas, 
  generateIcoBinary 
} from '../utils/icoGenerator';
import { 
  X, 
  Upload, 
  Download, 
  Check, 
  RefreshCw, 
  Palette,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface IconStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WrapperConfig;
  onUpdateIcon: (dataUrl: string) => void;
}

const COLOR_PRESETS = [
  '#2563EB', // Blue
  '#4F46E5', // Indigo
  '#0891B2', // Cyan
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#7C3AED', // Purple
  '#0F172A', // Slate Dark
];

export const IconStudioModal: React.FC<IconStudioModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateIcon,
}) => {
  const [selectedBgColor, setSelectedBgColor] = useState('#2563EB');
  const [customImage, setCustomImage] = useState<HTMLImageElement | null>(null);
  const [letterGlyph, setLetterGlyph] = useState(config.app.name.charAt(0).toUpperCase() || 'A');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render preview canvas whenever inputs change
  useEffect(() => {
    if (!isOpen) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 256;
    canvas.height = 256;

    if (customImage) {
      ctx.clearRect(0, 0, 256, 256);
      ctx.drawImage(customImage, 0, 0, 256, 256);
    } else {
      const generated = createDefaultAppIconCanvas(letterGlyph, selectedBgColor, 256);
      ctx.clearRect(0, 0, 256, 256);
      ctx.drawImage(generated, 0, 0);
    }
  }, [isOpen, selectedBgColor, customImage, letterGlyph]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setCustomImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyToApp = () => {
    if (!previewCanvasRef.current) return;
    const dataUrl = previewCanvasRef.current.toDataURL('image/png');
    onUpdateIcon(dataUrl);
    onClose();
  };

  const handleDownloadIco = async () => {
    if (!previewCanvasRef.current) return;
    try {
      const icoBytes = await generateIcoBinary(previewCanvasRef.current);
      const blob = new Blob([icoBytes.buffer as ArrayBuffer], { type: 'image/x-icon' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.app.executableName.replace(/\.exe$/i, '') || 'app'}.ico`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ICO', err);
      alert('Error generating .ico file');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col text-slate-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">Windows Icon (.ico) Studio</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Canvas Preview in Multi-Sizes */}
          <div>
            <span className="text-xs font-semibold text-slate-200 block mb-2">
              Generated Windows Icon Mipmaps
            </span>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-end justify-center gap-6">
              {/* 128px */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-24 h-24 rounded-lg bg-slate-900 border border-slate-800 p-1 flex items-center justify-center">
                  <canvas ref={previewCanvasRef} className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">128×128</span>
              </div>

              {/* 48px */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded bg-slate-900 border border-slate-800 p-0.5 flex items-center justify-center">
                  <canvas
                    width={48}
                    height={48}
                    ref={(canvas) => {
                      if (!canvas || !previewCanvasRef.current) return;
                      const ctx = canvas.getContext('2d');
                      ctx?.drawImage(previewCanvasRef.current, 0, 0, 48, 48);
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">48×48</span>
              </div>

              {/* 32px */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 p-0.5 flex items-center justify-center">
                  <canvas
                    width={32}
                    height={32}
                    ref={(canvas) => {
                      if (!canvas || !previewCanvasRef.current) return;
                      const ctx = canvas.getContext('2d');
                      ctx?.drawImage(previewCanvasRef.current, 0, 0, 32, 32);
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">32×32</span>
              </div>

              {/* 16px (Tray / Taskbar) */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <canvas
                    width={16}
                    height={16}
                    ref={(canvas) => {
                      if (!canvas || !previewCanvasRef.current) return;
                      const ctx = canvas.getContext('2d');
                      ctx?.drawImage(previewCanvasRef.current, 0, 0, 16, 16);
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">16×16</span>
              </div>
            </div>
          </div>

          {/* Options: Upload custom image or generate letter badge */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-200 block mb-1.5">
                Upload Custom Image
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose PNG / SVG / JPG</span>
                </button>

                {customImage && (
                  <button
                    type="button"
                    onClick={() => setCustomImage(null)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Reset to generated glyph
                  </button>
                )}
              </div>
            </div>

            {!customImage && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    App Icon Glyph Letter
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={letterGlyph}
                    onChange={(e) => setLetterGlyph(e.target.value.toUpperCase())}
                    className="w-24 bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 font-bold text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-200 block mb-1.5">
                    Background Color Palette
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedBgColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-7 h-7 rounded-md transition-transform ${
                          selectedBgColor === color ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <button
            type="button"
            onClick={handleDownloadIco}
            className="px-3.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .ICO File</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyToApp}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Icon to Wrapper</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
