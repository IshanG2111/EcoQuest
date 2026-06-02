import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface CuboidProps extends Omit<HTMLMotionProps<"div">, "color" | "colors"> {
  w: number;
  h: number;
  d: number;
  colors: {
    front: string;
    back: string;
    right: string;
    left: string;
    top: string;
    bottom: string;
  };
  faces?: {
    front?: React.ReactNode;
    back?: React.ReactNode;
    right?: React.ReactNode;
    left?: React.ReactNode;
    top?: React.ReactNode;
    bottom?: React.ReactNode;
  };
}

export function Cuboid({ 
  w, h, d,
  colors, faces = {}, 
  className = "", style = {},
  ...motionProps
}: CuboidProps) {
  return (
    <motion.div 
      className={`absolute origin-center select-none ${className}`}
      style={{ 
        width: w, height: h, 
        left: -w/2, top: -h/2, 
        transformStyle: 'preserve-3d',
        ...style
      }}
      {...motionProps}
    >
       {/* Front (+Z) */}
       <div className="absolute top-0 left-0 box-border border-b border-black/40 overflow-hidden" 
            style={{ width: w, height: h, transform: `translateZ(${d/2}px)`, backgroundColor: colors.front }}>
           <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '4px 4px' }} />
           {faces.front}
       </div>
       {/* Back (-Z) */}
       <div className="absolute top-0 left-0 box-border border-b border-black/40 overflow-hidden" 
            style={{ width: w, height: h, transform: `translateZ(${-d/2}px) rotateY(180deg)`, backgroundColor: colors.back }}>
           <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '4px 4px' }} />
           {faces.back}
       </div>
       
       {/* Right (+X) */}
       <div className="absolute top-0 box-border border-b border-black/40 overflow-hidden" 
            style={{ width: d, height: h, left: (w - d) / 2, transform: `translateX(${w/2}px) rotateY(90deg)`, backgroundColor: colors.right }}>
           <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '4px 4px' }} />
           {faces.right}
       </div>
       {/* Left (-X) */}
       <div className="absolute top-0 box-border border-b border-black/40 overflow-hidden" 
            style={{ width: d, height: h, left: (w - d) / 2, transform: `translateX(${-w/2}px) rotateY(-90deg)`, backgroundColor: colors.left }}>
           <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '4px 4px' }} />
           {faces.left}
       </div>
       
       {/* Top (-Y) */}
       <div className="absolute left-0 box-border overflow-hidden" 
            style={{ width: w, height: d, top: (h - d) / 2, transform: `translateY(${-h/2}px) rotateX(90deg)`, backgroundColor: colors.top }}>
           <div className="absolute inset-0 bg-white/10 pointer-events-none" />
           <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '4px 4px' }} />
           {faces.top}
       </div>
       {/* Bottom (+Y) */}
       <div className="absolute left-0 box-border overflow-hidden" 
            style={{ width: w, height: d, top: (h - d) / 2, transform: `translateY(${h/2}px) rotateX(-90deg)`, backgroundColor: colors.bottom }}>
           <div className="absolute inset-0 bg-black/50 pointer-events-none" />
           <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '4px 4px' }} />
           {faces.bottom}
       </div>
    </motion.div>
  );
}
