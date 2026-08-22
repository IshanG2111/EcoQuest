"use client";

import React, { useEffect, useRef, useLayoutEffect } from "react";

export type RetroDvdTvProps = {
  width?: string;
  logoText?: string;
  color?: string;
  colorCycle?: boolean;
  speed?: number;
  className?: string;
};

const PALETTE = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#3b82f6",
  "#84cc16",
];

// Fixed logo size (matches inline style below) — avoids offsetWidth=0 bug with SSR/styled-jsx
const LOGO_W = 80;
const LOGO_H = 52;

const RetroDvdTv: React.FC<RetroDvdTvProps> = ({
  width = "min(24rem, 88vw)",
  logoText = "ECO",
  color = "#10b981",
  colorCycle = true,
  speed = 2.5,
  className = "",
}) => {
  const screenRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const stateRef = useRef({
    x: 24,
    y: 18,
    vx: speed,
    vy: speed * 0.85,
    colorIdx: 0,
    col: color,
    initialized: false,
  });

  // Apply color to the logo element
  const applyColor = (col: string) => {
    const el = logoRef.current;
    if (!el) return;
    el.style.color = col;
    el.style.textShadow = `0 0 18px ${col}, 0 0 36px ${col}55`;
    const badge = el.querySelector<HTMLElement>("[data-badge]");
    if (badge) badge.style.background = col;
  };

  useLayoutEffect(() => {
    applyColor(color);
  }, [color]);

  useEffect(() => {
    const screen = screenRef.current;
    const logo = logoRef.current;
    if (!screen || !logo) return;

    const state = stateRef.current;

    // Re-randomize start position & direction each mount so it never looks static
    if (!state.initialized) {
      state.x = 24 + Math.random() * 40;
      state.y = 18 + Math.random() * 30;
      // Randomize direction
      state.vx = speed * (Math.random() > 0.5 ? 1 : -1);
      state.vy = speed * 0.85 * (Math.random() > 0.5 ? 1 : -1);
      state.initialized = true;
    }

    applyColor(state.col);

    const tick = () => {
      const sw = screen.offsetWidth;
      const sh = screen.offsetHeight;

      // Use hardcoded dims — avoids styled-jsx hydration bug where offsetWidth=0
      const lw = LOGO_W;
      const lh = LOGO_H;

      const maxX = Math.max(0, sw - lw);
      const maxY = Math.max(0, sh - lh);

      if (sw === 0 || sh === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      state.x += state.vx;
      state.y += state.vy;

      let bounced = false;

      if (state.x <= 0) {
        state.x = 0;
        state.vx = Math.abs(state.vx);
        bounced = true;
      } else if (state.x >= maxX) {
        state.x = maxX;
        state.vx = -Math.abs(state.vx);
        bounced = true;
      }

      if (state.y <= 0) {
        state.y = 0;
        state.vy = Math.abs(state.vy);
        bounced = true;
      } else if (state.y >= maxY) {
        state.y = maxY;
        state.vy = -Math.abs(state.vy);
        bounced = true;
      }

      if (bounced && colorCycle) {
        state.colorIdx = (state.colorIdx + 1) % PALETTE.length;
        state.col = PALETTE[state.colorIdx];
        applyColor(state.col);
      }

      logo.style.transform = `translate(${state.x}px, ${state.y}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, colorCycle]);

  return (
    <div
      className={className}
      style={{ width, maxWidth: "100vw", display: "grid", placeItems: "center", padding: "1rem", boxSizing: "border-box" }}
    >
      {/* TV Shell */}
      <div style={{
        width: "100%",
        padding: "1.25rem",
        background: "#141b20",
        borderRadius: "1.5rem",
        border: "0.35rem solid #0d1215",
        display: "grid",
        gap: "1rem",
        boxShadow: "0 20px 50px rgba(0,0,0,0.85), inset 0 2px 4px rgba(255,255,255,0.08)",
        boxSizing: "border-box",
      }}>

        {/* Screen Frame */}
        <div style={{
          position: "relative",
          borderRadius: "1rem",
          background: "#060b0d",
          overflow: "hidden",
        }}>
          {/* CRT Scanlines */}
          <div style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            borderRadius: "1rem",
            backgroundImage: "repeating-linear-gradient(transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)",
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.85), inset 4px 0 18px rgba(0,0,0,0.5), inset -4px 0 18px rgba(0,0,0,0.5)",
          }} />

          {/* Physics bounce area */}
          <div
            ref={screenRef}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "5 / 4",
              minHeight: "160px",
              overflow: "hidden",
              background: "#030a07",
            }}
          >
            {/* The bouncing logo — moved by transform each frame */}
            <div
              ref={logoRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${LOGO_W}px`,
                height: `${LOGO_H}px`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
                willChange: "transform",
                color: color,
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              <span style={{
                display: "block",
                fontSize: "2rem",
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: "inherit",
                textTransform: "uppercase",
                fontFamily: "system-ui, -apple-system, sans-serif",
                whiteSpace: "nowrap",
              }}>
                {logoText}
              </span>
              <span
                data-badge
                style={{
                  display: "block",
                  fontSize: "0.44rem",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  color: "#030a07",
                  padding: "0.2em 0.5em",
                  borderRadius: "2px",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  whiteSpace: "nowrap",
                  background: color,
                }}
              >
                ECOQUEST
              </span>
            </div>
          </div>
        </div>

        {/* TV Bottom Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {["‹", "›"].map((ch, i) => (
              <button
                key={i}
                aria-label={i === 0 ? "TV Channel Down" : "TV Channel Up"}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "#1f272c", color: "#8fa0a8",
                  border: "1px solid #0d1215", borderRadius: "50%",
                  fontWeight: "bold", width: "1.5rem", height: "1.5rem",
                  cursor: "pointer", fontSize: "11px",
                }}
              >{ch}</button>
            ))}
          </div>
          <div style={{
            backgroundImage: "radial-gradient(#080c0e 0.15rem, transparent 0)",
            backgroundSize: "0.45rem 0.45rem",
            width: "5rem", padding: "1.25rem", borderRadius: "0.5rem",
          }} />
        </div>
      </div>
    </div>
  );
};

export { RetroDvdTv };
export default RetroDvdTv;
