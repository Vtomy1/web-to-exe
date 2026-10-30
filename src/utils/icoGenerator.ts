/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Render a canvas with an icon graphic or initial letter if no image provided
 */
export function createDefaultAppIconCanvas(name: string, bgColor: string = "#1E293B", size: number = 256): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Background rounded rectangle
  const radius = size * 0.22;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, [radius]);
  ctx.fill();

  // Draw gradient overlay
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "rgba(255,255,255,0.18)");
  grad.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, [radius]);
  ctx.fill();

  // Subtle border
  ctx.lineWidth = Math.max(2, size * 0.02);
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, [radius]);
  ctx.stroke();

  // Letter glyph
  const letter = (name || "App").trim().charAt(0).toUpperCase();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.floor(size * 0.48)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = size * 0.08;
  ctx.shadowOffsetY = size * 0.03;
  ctx.fillText(letter, size / 2, size / 2 + size * 0.02);

  return canvas;
}

/**
 * Resize a source image / canvas to a target square size
 */
export async function resizeImageToPngBytes(
  source: HTMLCanvasElement | HTMLImageElement,
  size: number
): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create 2D canvas context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to export canvas blob"));
        return;
      }
      blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)));
    }, "image/png");
  });
}

/**
 * Generate a genuine Windows .ICO binary file containing multiple mipmap resolutions
 * (256x256, 128x128, 64x64, 48x48, 32x32, 16x16) formatted according to Windows Icon Spec.
 */
export async function generateIcoBinary(
  sourceCanvasOrImage: HTMLCanvasElement | HTMLImageElement
): Promise<Uint8Array> {
  const sizes = [256, 128, 64, 48, 32, 16];
  const pngEntries: { size: number; bytes: Uint8Array }[] = [];

  for (const s of sizes) {
    const bytes = await resizeImageToPngBytes(sourceCanvasOrImage, s);
    pngEntries.push({ size: s, bytes });
  }

  // ICONDIR is 6 bytes
  const headerSize = 6;
  // ICONDIRENTRY is 16 bytes per image
  const directorySize = headerSize + pngEntries.length * 16;

  // Calculate total file size and offsets
  let totalSize = directorySize;
  const offsets: number[] = [];
  for (const entry of pngEntries) {
    offsets.push(totalSize);
    totalSize += entry.bytes.length;
  }

  const icoBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(icoBuffer);
  const uint8 = new Uint8Array(icoBuffer);

  // Write ICONDIR
  view.setUint16(0, 0, true); // idReserved = 0
  view.setUint16(2, 1, true); // idType = 1 (Icon)
  view.setUint16(4, pngEntries.length, true); // idCount

  // Write ICONDIRENTRY for each size
  let dirOffset = 6;
  for (let i = 0; i < pngEntries.length; i++) {
    const entry = pngEntries[i];
    const s = entry.size;
    const bSize = s >= 256 ? 0 : s; // 0 represents 256 in ICONDIRENTRY
    view.setUint8(dirOffset + 0, bSize); // bWidth
    view.setUint8(dirOffset + 1, bSize); // bHeight
    view.setUint8(dirOffset + 2, 0);     // bColorCount (0 for >=8bpp)
    view.setUint8(dirOffset + 3, 0);     // bReserved
    view.setUint16(dirOffset + 4, 1, true); // wPlanes
    view.setUint16(dirOffset + 6, 32, true); // wBitCount (32-bit RGBA)
    view.setUint32(dirOffset + 8, entry.bytes.length, true); // dwBytesInRes
    view.setUint32(dirOffset + 12, offsets[i], true); // dwImageOffset

    // Copy PNG bytes into the computed offset
    uint8.set(entry.bytes, offsets[i]);

    dirOffset += 16;
  }

  return uint8;
}
