import React, { useState } from 'react';
import { motion } from 'motion/react';
import { catalog } from '../data';
import { Cuboid } from './Cuboid';
import { CartridgeLabel } from './CartridgeLabel';
import { ambientHum, playHoverSound, playClickSound } from '../audio';

interface GalleryProps {
  onSelectCartridge: (item: any) => void;
}

export function Gallery({ onSelectCartridge }: GalleryProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const isAnySelected = selectedIdx !== null;

  // Scene Scaling and Angle
  return (
    <div 
      className="relative w-full h-full flex items-center justify-center" 
      style={{ perspective: 2400 }}
      onClick={() => setSelectedIdx(null)}
    >
      
      {/* 3D Scene root - perfectly angled to view all cartridges inside the deep crate */}
      <div 
         className="relative w-0 h-0 transition-transform duration-[800ms] ease-in-out"
         style={{ 
           transformStyle: 'preserve-3d', 
           transform: isAnySelected
             ? `scale(1.05) rotateX(-22deg) rotateY(-40deg) translateY(80px) translateX(0px)`
             : `scale(1.05) rotateX(-22deg) rotateY(-40deg) translateY(80px) translateX(65px)`
         }}
         onMouseEnter={() => ambientHum.start()}
         onMouseLeave={() => ambientHum.stop()}
         onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            // distance to center of the crate
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            ambientHum.setVolume(dist);
         }}
      >
         {/* The Wooden Storage Crate */}
         <motion.div 
           style={{ transformStyle: 'preserve-3d' }}
           animate={{ y: isAnySelected ? 400 : 0 }}
           transition={{ type: 'spring', stiffness: 120, damping: 20 }}
         >
           <Crate />
         </motion.div>
         
         {/* Custom ambient light glow inside crate */}
         <motion.div 
            className="absolute bg-[#378b29] blur-[80px] pointer-events-none rounded-full"
            style={{ 
               width: 300, height: 200, 
               left: -150, top: -100, 
               transform: 'translateZ(-100px)'
            }} 
            animate={{ 
              y: isAnySelected ? 400 : 0,
              opacity: isAnySelected ? 0 : 0.3 
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
         />
         
         {/* Cartridges Stack */}
         {catalog.map((item, i) => {
           // Physical dimensions and positions
           const cw = 176;
           const ch = 240;
           const cd = 22;
           
           // Z spacing within crate length (from front to back)
           const zPos = 275 - (i * 50); 
           
           const isHovered = hoveredIdx === i;
           const isDragged = draggedIdx === i;
           
           // Calculate distance from dragged item
           let zOffset = 0;
           let yOffset = 0;
           if (draggedIdx !== null && !isDragged) {
             const dist = Math.abs(draggedIdx - i);
             if (dist === 1) {
               zOffset = (i < draggedIdx) ? 20 : -20; // push apart
               yOffset = -10;
             } else if (dist === 2) {
               zOffset = (i < draggedIdx) ? 10 : -10;
               yOffset = -2;
             }
           }
           
           // Resting y: -69 (bottom sits exactly on crate floor)
           // Hover y: -150 (rises up 81px, keeping the bottom 45px safely hidden inside the crate walls)
           const baseY = -69;
           const hoverY = -150;
           const isSelected = selectedIdx === i;
           
           return (
             <Cuboid 
                key={item.id}
                w={cw} h={ch} d={cd}
                className={`cursor-pointer group`}
                style={{ 
                  zIndex: isSelected ? 100 : isDragged ? 60 : (isHovered ? 50 : 40 - i), // Lift the selected/hovered/dragged item
                  pointerEvents: isSelected ? 'auto' : (isAnySelected ? 'none' : 'auto')
                }}
                transformTemplate={({ x, y, z, rotateX, rotateY, scale }: any) => {
                  return `translate3d(${x}, ${y}, ${z}) rotateY(${rotateY}) rotateX(${rotateX}) scale(${scale})`;
                }}
                onMouseEnter={() => {
                  if (hoveredIdx !== i) playHoverSound();
                  setHoveredIdx(i);
                }}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedIdx === i) {
                    playClickSound();
                    onSelectCartridge(item);
                  } else {
                    playClickSound();
                    setSelectedIdx(i);
                  }
                }}
                
                // physics interactions
                initial={{ x: 0, y: baseY, z: zPos, rotateX: 0, rotateY: 0 }}
                animate={{ 
                  y: isSelected ? -324 : ((isHovered || isDragged) ? hoverY : baseY + yOffset) + (isAnySelected ? 400 : 0),
                  x: isSelected ? 387 : 0,
                  z: isSelected ? 462 : ((isHovered || isDragged) ? zPos + 10 : zPos) + zOffset,
                  rotateX: isSelected ? 22 : isHovered ? Math.random() * 2 - 1 : 0, 
                  rotateY: isSelected ? 40 : 0,
                  scale: isSelected ? 1.8 : 1,
                }}
                whileHover={{ scale: isSelected ? 1.8 : 1.01 }}
                whileDrag={{ 
                  scale: 1.04, 
                  z: zPos + 100, 
                  rotateX: 12,  
                  rotateY: -3,
                  cursor: 'grabbing' 
                }}
                drag={!isSelected}
                dragSnapToOrigin
                dragElastic={0.2}
                onDragStart={() => setDraggedIdx(i)}
                onDragEnd={() => setDraggedIdx(null)}
                transition={{ 
                  type: 'spring',
                  stiffness: 180,
                  damping: 22,
                  mass: 1.2
                }}

                colors={{
                  front: '#0a0a0a',   
                  back: '#000000', 
                  right: '#050505', 
                  left: '#0c0c0c',  
                  top: '#111111',   
                  bottom: '#000000'
                }}
                faces={{
                   front: <CartridgeLabel item={item} index={i} isHovered={isHovered} />,
                   top: <CartridgeTop item={item} isHovered={isHovered} />,
                   left: <CartridgeSide item={item} />,
                   bottom: <div className={`w-full h-full bg-black transition-opacity duration-500 delay-100 ${isHovered ? 'shadow-[0_40px_30px_10px_rgba(0,0,0,0.9)] opacity-100' : 'opacity-0'}`} />
                }}
             />
           );
         })}

         {/* Floor Ambient Shadow */}
         <motion.div 
            className="absolute bg-[#020502] blur-[40px] pointer-events-none"
            style={{ 
               width: 440, height: 780, 
               left: -220, top: -390, 
               transform: `translate3d(-40px, 150px, -40px) rotateX(90deg)`,
            }} 
            animate={{ 
              y: isAnySelected ? 400 : 0,
              opacity: isAnySelected ? 0 : 0.8 
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
         />
      </div>
    </div>
  );
}

function CartridgeTop({ item, isHovered }: { item: any, isHovered?: boolean }) {
  const glitchDelay = `${(item.id.length % 5) * 0.3}s`;
  return (
    <div className="w-full h-full flex flex-col items-center justify-between bg-[#0a0a0a] shadow-[inset_1.5px_1.5px_2px_rgba(255,255,255,0.1),inset_0_-2px_6px_rgba(0,0,0,0.9)] box-border px-[10px] relative overflow-hidden">
       
       <div className="absolute top-0 left-0 bottom-0 w-[1.5px] bg-gradient-to-b from-[rgba(255,245,235,0.8)] to-transparent pointer-events-none z-30 opacity-80" />
       
       <div className="absolute inset-0 opacity-[0.2] bg-[linear-gradient(90deg,transparent,rgba(0,0,0,0.8),transparent)] pointer-events-none" />

       <div className="w-[80%] mt-[2px] h-[4px] bg-[#020202] rounded-b-md shadow-[inset_0_2px_4px_rgba(0,0,0,1)] relative z-10" />
       
       {/* subtle noise */}
       <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.02)_50%,transparent_51%)] bg-[length:4px_100%] pointer-events-none" />
       
       <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 font-mono font-bold tracking-[0.1em] text-[10px] uppercase truncate w-full text-center drop-shadow-[0_2px_2px_rgba(0,0,0,1)] z-10 ${isHovered ? 'animate-glitch' : ''}`} style={{ animationDelay: glitchDelay }}>
          {item.title.replace(/_/g, ' ')}
       </span>
       
       <div className="w-full h-[6px] mb-[2px] bg-[#050505] rounded-t-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] relative z-10" />
    </div>
  )
}

function CartridgeSide({ item }: { item: any }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#080808] shadow-[inset_1.5px_1.5px_2px_rgba(255,255,255,0.1),inset_-2px_0_6px_rgba(0,0,0,0.8)] box-border relative overflow-hidden flex-col">
       <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[rgba(255,245,235,0.8)] to-transparent pointer-events-none z-30 opacity-80" />
       
       <div className="h-[80%] absolute left-[2px] w-[3px] bg-[#020202] rounded-full shadow-[inset_1px_0_2px_rgba(0,0,0,1)]" />
       <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)', backgroundSize: '3px 3px' }} />
       
       <span 
          className="text-[#333] text-[9px] font-mono font-bold tracking-[0.2em] uppercase origin-center whitespace-nowrap z-10"
          style={{ transform: 'rotate(-90deg)' }}
       >
          MX-CORE
       </span>
    </div>
  )
}

function Crate() {
  const fMat = '#030303'; // Base deep dark material
  const rMat = '#000000'; // Dark shadow
  const lMat = '#080808'; // Light edge
  
  const tEdge = '#0c0c0c'; // top rim

  return (
    <div className="absolute w-0 h-0" style={{ transformStyle: 'preserve-3d' }}>
      {/* Front Wall - Lower profile like a futuristic dock */}
      <Cuboid w={272} h={100} d={24} x={0} y={25} z={330} 
        colors={{ front: fMat, back: rMat, right: rMat, left: lMat, top: tEdge, bottom: rMat }} 
        faces={{ front: <Plaque /> }}
      />
      {/* Back Wall */}
      <Cuboid w={272} h={100} d={24} x={0} y={25} z={-330} 
        colors={{ front: lMat, back: rMat, right: rMat, left: lMat, top: tEdge, bottom: rMat }} 
      />
      {/* Left Wall */}
      <Cuboid w={24} h={100} d={636} x={-124} y={25} z={0} 
        colors={{ front: rMat, back: rMat, right: rMat, left: lMat, top: tEdge, bottom: rMat }} 
      />
      {/* Right Wall */}
      <Cuboid w={24} h={100} d={636} x={124} y={25} z={0} 
        colors={{ front: rMat, back: rMat, right: rMat, left: lMat, top: tEdge, bottom: rMat }} 
      />
      {/* Bottom Floor */}
      <Cuboid w={224} h={24} d={684} x={0} y={63} z={0} 
        colors={{ front: rMat, back: rMat, right: rMat, left: rMat, top: '#000000', bottom: rMat }} 
      />
      {/* Dock Glow Track */}
      <Cuboid w={176} h={6} d={636} x={0} y={48} z={0} 
        colors={{ front: '#000', back: '#000', right: '#000', left: '#000', top: '#1c1c1c', bottom: '#000' }} 
        faces={{
           top: (
              <div className="w-full h-full bg-[#050505] shadow-[0_0_20px_#378b29,inset_0_0_10px_#378b29] relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.1) 50%)', backgroundSize: '10px 100%' }} />
              </div>
           )
        }}
      />
    </div>
  )
}

function Plaque() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 pt-[10px] relative shadow-[inset_1.5px_1.5px_2px_rgba(255,255,255,0.08),inset_0_0_30px_rgba(0,0,0,1)]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[rgba(255,245,235,0.6)] to-transparent pointer-events-none opacity-80" />
        <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-[rgba(255,245,235,0.6)] to-transparent pointer-events-none opacity-80" />
        
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.01)_50%,transparent_51%)] bg-[length:4px_100%]" />
        {/* Tech nameplate */}
        <div className="bg-[#000] border border-[#222] shadow-[0_0_20px_rgba(55,139,41,0.05)] px-[32px] py-[6px] flex items-center justify-center relative rounded-[4px] z-10 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-[#378b29] opacity-5 tilt-shine" />
            <span 
              className="text-[#fff] font-sans tracking-[0.3em] text-[16px] leading-tight uppercase relative z-10 font-black" 
            >
               N-ARCHIVE <span className="font-light text-[#777]">PRO</span>
            </span>
            {/* Leds */}
            <div className="absolute top-[50%] -translate-y-1/2 left-[12px] w-[2px] h-[8px] bg-[#378b29] shadow-[0_0_8px_#378b29]" />
            <div className="absolute top-[50%] -translate-y-1/2 right-[12px] w-[2px] h-[8px] bg-[#378b29] shadow-[0_0_8px_#378b29]" />
        </div>
        
        <div className="w-[90%] h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent mt-3 z-10" />
    </div>
  )
}
