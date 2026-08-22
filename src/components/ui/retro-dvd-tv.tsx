"use client";

import React from "react";

export type RetroDvdTvProps = {
  /** Outer TV width (e.g. "35rem", "500px") */
  width?: string;
  /** Outer TV height (e.g. "25rem", "auto") */
  height?: string;
  /** Text to show on the bouncing logo (default: "DVD") */
  logoText?: string;
  /** Initial or static logo color */
  color?: string;
  /** Enable automatic color cycling on each collision cycle */
  colorCycle?: boolean;
  /** Speed of the bouncing animation in seconds (lower = faster, default 5) */
  speed?: number;
  className?: string;
};

const RetroDvdTv: React.FC<RetroDvdTvProps> = ({
  width = "min(24rem, 88vw)",
  height = "auto",
  logoText = "ECO",
  color = "#10b981",
  colorCycle = true,
  speed = 4.5,
  className = "",
}) => {
  return (
    <div
      className={`tv-root ${className}`}
      style={
        {
          "--tv-width": width,
          "--tv-height": height,
          "--logo-color": color,
          "--color-animate": colorCycle ? "running" : "paused",
          "--bounce-speed-h": `${speed}s`,
          "--bounce-speed-v": `${speed * 0.72}s`,
        } as React.CSSProperties
      }
    >
      <div className="tv">
        <div className="tv__frame">
          <div className="tv__screen">
            <div className="tv__screen-inner">
              {React.createElement(
                "marquee" as any,
                {
                  behavior: "alternate",
                  direction: "right",
                  scrollamount: "6",
                  className: "marquee-h",
                  style: { width: "100%", height: "100%", overflow: "hidden" },
                },
                React.createElement(
                  "marquee" as any,
                  {
                    behavior: "alternate",
                    direction: "down",
                    scrollamount: "5",
                    className: "marquee-v",
                    style: { width: "100%", height: "100%", overflow: "hidden" },
                  },
                  <span className="logo">{logoText}</span>
                )
              )}
            </div>
          </div>
        </div>
        <div className="tv__bottom">
          <div className="tv__controls">
            <button className="tv__button" aria-label="TV Channel Down">‹</button>
            <button className="tv__button" aria-label="TV Channel Up">›</button>
          </div>
          <div className="tv__speaker" />
        </div>
      </div>

      <style jsx>{`
        .tv-root {
          --shadow: drop-shadow(0px 2px 0px #ffffff0f)
            drop-shadow(0px -2px 0px #0000000f);
          width: var(--tv-width);
          height: var(--tv-height);
          display: grid;
          place-items: center;
          padding: 1rem;
          background: transparent;
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 100vw;
          box-sizing: border-box;
        }

        .tv {
          width: 100%;
          padding: 1.25rem;
          background: #141b20;
          border-radius: 1.5rem;
          border: 0.35rem solid #0d1215;
          display: grid;
          gap: 1rem;
          height: 100%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), inset 0 2px 4px rgba(255, 255, 255, 0.08);
          box-sizing: border-box;
        }

        .tv__frame {
          position: relative;
          border-radius: 1rem;
          background-color: #080c0e;
          padding: 1.25rem;
          filter: var(--shadow);
          flex: 1;
          box-sizing: border-box;
        }
        .tv__frame::after {
          content: "";
          border-radius: 5% / 100%;
          position: absolute;
          inset: 1rem 1.4rem;
          z-index: 1;
          animation: scanlines 0.5s linear infinite;
          background-image: repeating-linear-gradient(
            transparent,
            transparent 5px,
            rgba(0, 0, 0, 0.06) 5px,
            rgba(0, 0, 0, 0.06) 10px
          );
          box-shadow: inset 6px 5px 20px 11px rgba(0, 0, 0, 0.7);
          pointer-events: none;
        }

        .tv__screen {
          position: relative;
          border-radius: 100% / 5%;
          z-index: 1;
          padding: 0;
          overflow: hidden;
        }
        .tv__screen::after,
        .tv__screen::before {
          content: "";
          background: #091a13;
          border-radius: 5% / 100%;
          position: absolute;
          inset: 0;
          z-index: -1;
        }
        .tv__screen::after {
          inset: -0.6rem 0.7rem;
          border-radius: 100% / 5%;
        }

        .tv__screen-inner {
          width: 100%;
          height: 100%;
          min-height: 160px;
          aspect-ratio: 5 / 4;
          display: block;
        }

        .tv__bottom {
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          gap: 0.75rem;
        }

        .tv__controls {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .tv__button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1f272c;
          color: #8fa0a8;
          border: 1px solid #0d1215;
          border-radius: 50%;
          font-weight: bold;
          aspect-ratio: 1;
          width: 1.5rem;
          height: 1.5rem;
          filter: var(--shadow);
          cursor: pointer;
          transition: background 0.2s;
          font-size: 11px;
        }
        .tv__button:hover {
          background: #2e3940;
          color: #fff;
        }

        .tv__speaker {
          background-image: radial-gradient(#080c0e 0.15rem, transparent 0);
          background-size: 0.45rem 0.45rem;
          width: 5rem;
          padding: 1.25rem;
          filter: var(--shadow);
          border-radius: 0.5rem;
        }

        .logo {
          display: inline-block;
          text-align: center;
          font-size: 2rem;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.05em;
          color: var(--logo-color, #10b981);
          animation: colorChange 12s infinite;
          animation-play-state: var(--color-animate);
          animation-timing-function: steps(1, end);
          opacity: 0.95;
          user-select: none;
          text-transform: uppercase;
          text-shadow: 0 0 15px currentColor;
        }
        .logo::after {
          display: block;
          font-size: 0.35em;
          font-weight: bold;
          letter-spacing: 0.25em;
          background-color: var(--logo-color, #10b981);
          color: #080c0e;
          padding-block: 0.25em;
          border-radius: 50%;
          text-transform: uppercase;
          content: "ECOQUEST";
          margin-top: 0.2rem;
        }

        /* ── Mobile Phone Responsive Adjustments ── */
        @media (max-width: 640px) {
          .tv-root {
            padding: 0.5rem;
          }
          .tv {
            padding: 0.85rem;
            gap: 0.65rem;
            border-radius: 1.2rem;
            border-width: 0.25rem;
          }
          .tv__frame {
            padding: 0.85rem;
            border-radius: 0.75rem;
          }
          .tv__screen-inner {
            min-height: 130px;
          }
          .logo {
            font-size: 1.6rem;
          }
          .tv__speaker {
            width: 3.5rem;
            padding: 0.85rem;
          }
          .tv__button {
            width: 1.3rem;
            height: 1.3rem;
            font-size: 10px;
          }
        }

        @keyframes scanlines {
          to {
            background-position-y: 10px;
          }
        }

        @keyframes colorChange {
          0% {
            --logo-color: #10b981;
          }
          20% {
            --logo-color: #06b6d4;
          }
          40% {
            --logo-color: #f59e0b;
          }
          60% {
            --logo-color: #ec4899;
          }
          80% {
            --logo-color: #8b5cf6;
          }
          100% {
            --logo-color: #10b981;
          }
        }
      `}</style>
    </div>
  );
};

export { RetroDvdTv };
export default RetroDvdTv;
