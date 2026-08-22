'use client';

import { useEffect, useRef, useCallback } from 'react';

// ── Bayer 8×8 ordered dithering matrix (values 0–63, normalized to 0–1) ──────
const BAYER8 = new Float32Array([
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
].map(v => v / 63));

// ── EcoQuest 5-tone emerald palette (dark → bright) ───────────────────────────
const PALETTE = [
  [2,   8,   6  ], // #020806 near-black
  [4,   22,  16 ], // #041610 very dark forest
  [6,   58,  40 ], // #063a28 dark emerald
  [16,  120, 80 ], // #107850 mid emerald
  [16,  185, 129], // #10b981 EcoQuest brand emerald
] as [number, number, number][];

function quantize(luma: number, thresholdBias: number): [number, number, number] {
  // Map luma (0-1) + Bayer threshold to a palette step
  const levels = PALETTE.length - 1;
  const t = Math.max(0, Math.min(1, luma + thresholdBias));
  const idx = Math.min(levels, Math.floor(t * (levels + 1)));
  return PALETTE[idx];
}

interface DitherCanvasProps {
  src: string;
  /** Radius (px) of the undithered "reveal lens" around cursor. Default 160 */
  lensRadius?: number;
  className?: string;
}

export default function DitherCanvas({ src, lensRadius = 160, className = '' }: DitherCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });
  const raf = useRef(0);
  const imgData = useRef<{
    pixels: Uint8ClampedArray; // grayscale + alpha packed
    w: number; h: number;
  } | null>(null);
  const dirty = useRef(true);

  // ── Preprocess image → grayscale luminance buffer ─────────────────────────
  const loadImage = useCallback((imageSrc: string, targetW: number, targetH: number) => {
    const offscreen = document.createElement('canvas');
    offscreen.width = targetW;
    offscreen.height = targetH;
    const ctx = offscreen.getContext('2d')!;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Fill with image, cover crop
      const scale = Math.max(targetW / img.width, targetH / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const ox = (targetW - sw) / 2;
      const oy = (targetH - sh) / 2;
      ctx.drawImage(img, ox, oy, sw, sh);

      const raw = ctx.getImageData(0, 0, targetW, targetH);
      // Convert to single-channel luma
      const luma = new Uint8ClampedArray(targetW * targetH);
      for (let i = 0; i < raw.data.length; i += 4) {
        const r = raw.data[i], g = raw.data[i + 1], b = raw.data[i + 2];
        // Weighted luminance — boosts greens for the forest palette
        luma[i >> 2] = Math.round(r * 0.2 + g * 0.65 + b * 0.15);
      }
      imgData.current = { pixels: luma, w: targetW, h: targetH };
      dirty.current = true;
    };
    img.src = imageSrc;
  }, []);

  // ── Main render loop ───────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgData.current) {
      raf.current = requestAnimationFrame(render);
      return;
    }

    if (!dirty.current) {
      raf.current = requestAnimationFrame(render);
      return;
    }
    dirty.current = false;

    const ctx = canvas.getContext('2d')!;
    const { pixels, w, h } = imgData.current;
    const cw = canvas.width, ch = canvas.height;

    // Render at half resolution for perf, then scale up
    const SCALE = 2; // Each "pixel" = 2×2 screen px
    const gw = Math.ceil(cw / SCALE);
    const gh = Math.ceil(ch / SCALE);

    const out = ctx.createImageData(gw, gh);

    const mx = mouse.current.x / SCALE;
    const my = mouse.current.y / SCALE;
    const lensR = lensRadius / SCALE;
    const lensR2 = lensR * lensR;

    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        // Map grid cell to source image coords
        const srcX = Math.floor(gx / gw * w);
        const srcY = Math.floor(gy / gh * h);
        const luma = pixels[srcY * w + srcX] / 255;

        // Bayer threshold (0–1) for this pixel
        const bx = gx & 7, by = gy & 7;
        const bayer = BAYER8[by * 8 + bx];

        // Lens: how close is this pixel to the mouse?
        const dx = gx - mx, dy = gy - my;
        const dist2 = dx * dx + dy * dy;

        // inside lens: reduce threshold bias → finer dither (more lit pixels)
        // outside lens: full coarse dither
        let thresholdBias: number;
        if (dist2 < lensR2) {
          const t = Math.sqrt(dist2) / lensR; // 0 = center, 1 = edge
          const smooth = t * t * (3 - 2 * t); // smoothstep
          // Center: show 4-level detail; edge: coarse 2-level
          thresholdBias = (bayer - 0.5) * (0.18 + smooth * 0.45);
        } else {
          thresholdBias = (bayer - 0.5) * 0.65;
        }

        const [r, g, b] = quantize(luma, thresholdBias);
        const oi = (gy * gw + gx) * 4;
        out.data[oi]     = r;
        out.data[oi + 1] = g;
        out.data[oi + 2] = b;
        out.data[oi + 3] = 255;
      }
    }

    // Blit the low-res buffer scaled up (pixelated for the dither look)
    const tmp = document.createElement('canvas');
    tmp.width = gw; tmp.height = gh;
    tmp.getContext('2d')!.putImageData(out, 0, 0);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmp, 0, 0, cw, ch);
    ctx.restore();

    // ── Subtle lens glow around cursor (no ring, just soft light) ──────────
    if (mouse.current.active) {
      const mx2 = mouse.current.x, my2 = mouse.current.y;
      const grad = ctx.createRadialGradient(mx2, my2, 0, mx2, my2, lensRadius);
      grad.addColorStop(0,    'rgba(16,185,129,0.04)');
      grad.addColorStop(0.6,  'rgba(16,185,129,0.02)');
      grad.addColorStop(1,    'rgba(16,185,129,0)');
      ctx.beginPath();
      ctx.arc(mx2, my2, lensRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    raf.current = requestAnimationFrame(render);
  }, [lensRadius]);

  // ── Resize handler ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';

      // Load at 1/2 screen resolution (enough for dither art quality)
      loadImage(src, Math.ceil(window.innerWidth / 2), Math.ceil(window.innerHeight / 2));
      dirty.current = true;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [src, loadImage]);

  // ── Mouse & touch tracking ─────────────────────────────────────────────────
  useEffect(() => {
    const setPos = (x: number, y: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mouse.current.x = x * dpr;
      mouse.current.y = y * dpr;
      mouse.current.active = true;
      dirty.current = true;
    };

    const onMove = (e: MouseEvent) => setPos(e.clientX, e.clientY);
    const onLeave = () => { mouse.current.active = false; dirty.current = true; };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setPos(t.clientX, t.clientY);
    };
    const onTouchEnd = () => { mouse.current.active = false; dirty.current = true; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // ── Start RAF loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    raf.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf.current);
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden
    />
  );
}
