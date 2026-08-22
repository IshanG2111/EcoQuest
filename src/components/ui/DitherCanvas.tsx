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

// ── Multi-Theme 5-Tone Color Palettes ─────────────────────────────────────────
export const THEME_PALETTES: Record<string, [number, number, number][]> = {
  'the-verdant-grove': [
    [2,   8,   6  ], // #020806 near-black
    [4,   22,  16 ], // #041610 deep forest
    [6,   58,  40 ], // #063a28 dark emerald
    [16,  120, 80 ], // #107850 mid emerald
    [16,  185, 129], // #10b981 EcoQuest brand emerald
  ],
  'the-ember-hearth': [
    [10,  4,   2  ], // #0a0402 near-black
    [28,  10,  4  ], // #1c0a04 dark ember
    [67,  20,  7  ], // #431407 deep flame
    [194, 65,  12 ], // #c2410c orange red
    [251, 146, 60 ], // #fb923c bright ember glow
  ],
  'the-abyssal-tide': [
    [2,   6,   16 ], // #020610 abyss near-black
    [8,   32,  50 ], // #082032 deep ocean
    [12,  74,  110], // #0c4a6e midnight teal
    [2,   132, 199], // #0284c7 electric sea blue
    [56,  189, 248], // #38bdf8 luminous cyan
  ],
};

function quantizeChannel(val: number, bias: number, steps: number): number {
  const norm = val / 255;
  const stepped = Math.max(0, Math.min(1, norm + bias));
  const level = Math.round(stepped * (steps - 1));
  return Math.round((level / (steps - 1)) * 255);
}

function quantizeTheme(
  luma: number,
  thresholdBias: number,
  palette: [number, number, number][]
): [number, number, number] {
  const levels = palette.length - 1;
  const t = Math.max(0, Math.min(1, luma + thresholdBias));
  const idx = Math.min(levels, Math.floor(t * (levels + 1)));
  return palette[idx] || palette[levels];
}

interface DitherCanvasProps {
  src: string;
  /** 'rgb' preserves meticulously the underlying video/image colors; 'theme' applies 5-tone theme palette */
  colorMode?: 'rgb' | 'theme';
  /** Active theme ID when colorMode='theme' */
  theme?: string;
  /** Radius (px) of the finer-dither "reveal lens" around cursor. Default 200 */
  lensRadius?: number;
  className?: string;
}

export default function DitherCanvas({
  src,
  colorMode = 'rgb',
  theme = 'the-verdant-grove',
  lensRadius = 220,
  className = '',
}: DitherCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });
  const raf = useRef(0);
  const isVideo = src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.mov');
  const palette = THEME_PALETTES[theme] || THEME_PALETTES['the-verdant-grove'];

  const rawPixelsRef = useRef<{
    data: Uint8ClampedArray;
    w: number;
    h: number;
  } | null>(null);
  const dirty = useRef(true);

  // ── Setup Video or Load Image ─────────────────────────────────────────────
  const loadSource = useCallback((sourceSrc: string, targetW: number, targetH: number) => {
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas');
    }
    const offscreen = offscreenRef.current;
    offscreen.width = targetW;
    offscreen.height = targetH;

    if (isVideo) {
      if (!videoRef.current) {
        const vid = document.createElement('video');
        vid.src = sourceSrc;
        vid.autoplay = true;
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.crossOrigin = 'anonymous';
        vid.play().catch(() => {});
        videoRef.current = vid;
      }
    } else {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const scale = Math.max(targetW / img.width, targetH / img.height);
        const sw = img.width * scale;
        const sh = img.height * scale;
        const ox = (targetW - sw) / 2;
        const oy = (targetH - sh) / 2;

        const ctx = offscreen.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(img, ox, oy, sw, sh);

        const raw = ctx.getImageData(0, 0, targetW, targetH);
        rawPixelsRef.current = { data: raw.data, w: targetW, h: targetH };
        dirty.current = true;
      };
      img.src = sourceSrc;
    }
  }, [isVideo]);

  // ── Real-Time Dither Render Loop ──────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      raf.current = requestAnimationFrame(render);
      return;
    }

    const ctx = canvas.getContext('2d')!;
    const cw = canvas.width;
    const ch = canvas.height;
    if (cw === 0 || ch === 0) {
      raf.current = requestAnimationFrame(render);
      return;
    }

    // Use consistent pixel grid scale (2px cell)
    const SCALE = 2;
    const gw = Math.ceil(cw / SCALE);
    const gh = Math.ceil(ch / SCALE);

    // If video, dynamically size offscreen canvas to match grid and capture full frame
    if (isVideo && videoRef.current) {
      const vid = videoRef.current;
      if (vid.readyState >= 2) {
        if (!offscreenRef.current) {
          offscreenRef.current = document.createElement('canvas');
        }
        const offscreen = offscreenRef.current;
        if (offscreen.width !== gw || offscreen.height !== gh) {
          offscreen.width = gw;
          offscreen.height = gh;
        }

        const offCtx = offscreen.getContext('2d', { willReadFrequently: true })!;
        const vw = vid.videoWidth || gw;
        const vh = vid.videoHeight || gh;
        const scale = Math.max(gw / vw, gh / vh);
        const sw = vw * scale;
        const sh = vh * scale;
        const ox = (gw - sw) / 2;
        const oy = (gh - sh) / 2;

        offCtx.drawImage(vid, ox, oy, sw, sh);
        const raw = offCtx.getImageData(0, 0, gw, gh);

        rawPixelsRef.current = {
          data: raw.data,
          w: gw,
          h: gh,
        };
        dirty.current = true;
      }
    }

    if (!dirty.current && !isVideo) {
      raf.current = requestAnimationFrame(render);
      return;
    }
    dirty.current = false;

    if (!rawPixelsRef.current) {
      raf.current = requestAnimationFrame(render);
      return;
    }

    const { data: raw, w, h } = rawPixelsRef.current;
    if (w !== gw || h !== gh) {
      raf.current = requestAnimationFrame(render);
      return;
    }

    const out = ctx.createImageData(gw, gh);

    const mx = mouse.current.x / SCALE;
    const my = mouse.current.y / SCALE;
    const lensR = lensRadius / SCALE;
    const lensR2 = lensR * lensR;

    for (let gy = 0; gy < gh; gy++) {
      const by = gy & 7;
      const by8 = by * 8;
      const rowOffset = gy * gw * 4;

      for (let gx = 0; gx < gw; gx++) {
        const pi = rowOffset + gx * 4;
        const origR = raw[pi];
        const origG = raw[pi + 1];
        const origB = raw[pi + 2];

        const bx = gx & 7;
        const bayer = BAYER8[by8 + bx];

        const dx = gx - mx, dy = gy - my;
        const dist2 = dx * dx + dy * dy;

        let thresholdBias: number;
        let colorSteps = 8;

        if (dist2 < lensR2) {
          const t = Math.sqrt(dist2) / lensR;
          const smooth = t * t * (3 - 2 * t);
          thresholdBias = (bayer - 0.5) * (0.12 + smooth * 0.35);
          colorSteps = 12;
        } else {
          thresholdBias = (bayer - 0.5) * 0.5;
          colorSteps = 8;
        }

        const oi = rowOffset + gx * 4;

        if (colorMode === 'rgb') {
          out.data[oi]     = quantizeChannel(origR, thresholdBias, colorSteps);
          out.data[oi + 1] = quantizeChannel(origG, thresholdBias, colorSteps);
          out.data[oi + 2] = quantizeChannel(origB, thresholdBias, colorSteps);
          out.data[oi + 3] = 255;
        } else {
          const luma = (origR * 0.25 + origG * 0.55 + origB * 0.2) / 255;
          const [r, g, b] = quantizeTheme(luma, thresholdBias, palette);
          out.data[oi]     = r;
          out.data[oi + 1] = g;
          out.data[oi + 2] = b;
          out.data[oi + 3] = 255;
        }
      }
    }

    const tmp = document.createElement('canvas');
    tmp.width = gw;
    tmp.height = gh;
    tmp.getContext('2d')!.putImageData(out, 0, 0);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmp, 0, 0, cw, ch);
    ctx.restore();

    // ── Subtle interactive light aura under cursor ────────────────────────
    if (mouse.current.active) {
      const mx2 = mouse.current.x, my2 = mouse.current.y;
      const grad = ctx.createRadialGradient(mx2, my2, 0, mx2, my2, lensRadius);
      grad.addColorStop(0,   'rgba(255, 200, 100, 0.04)');
      grad.addColorStop(0.6, 'rgba(255, 180, 80, 0.015)');
      grad.addColorStop(1,   'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(mx2, my2, lensRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    raf.current = requestAnimationFrame(render);
  }, [lensRadius, isVideo, colorMode, palette]);

  // Trigger re-render on theme/colorMode change
  useEffect(() => {
    dirty.current = true;
  }, [theme, colorMode]);

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

      const gw = Math.ceil(canvas.width / 2);
      const gh = Math.ceil(canvas.height / 2);
      loadSource(src, gw, gh);
      dirty.current = true;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current = null;
      }
    };
  }, [src, loadSource]);

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
