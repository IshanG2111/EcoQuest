'use client';

import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { Pin, PinOff, X, GripHorizontal } from 'lucide-react';
import { useDesktop, WidgetType } from '@/components/desktop-context';
import { cn } from '@/lib/utils';

interface WidgetShellProps {
  id: WidgetType;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  defaultX?: number;
  defaultY?: number;
}

export function WidgetShell({ id, title, children, onClose, defaultX = 100, defaultY = 100 }: WidgetShellProps) {
  const { widgetPositions, updateWidgetPosition, widgetPinned, toggleWidgetPin } = useDesktop();
  const nodeRef = useRef<HTMLDivElement>(null);

  const isPinned = widgetPinned[id] || false;
  const position = widgetPositions[id] || { x: defaultX, y: defaultY };

  const handleStop = (e: any, data: any) => {
    updateWidgetPosition(id, { x: data.x, y: data.y });
  };

  // Inject onClose prop if children is a valid React element
  const childWithProps = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, { onClose })
    : children;

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".widget-shell-drag-handle, .handle, .enw-titlebar"
      bounds="parent"
      position={position}
      onStop={handleStop}
      disabled={isPinned}
    >
      <div
        ref={nodeRef}
        className={cn(
          "absolute transition-shadow duration-300 select-none group/shell pointer-events-auto",
          isPinned ? "z-10" : "z-20 hover:shadow-xl hover:shadow-black/25"
        )}
      >
        {/* Widget Top Titlebar Tab */}
        <div className="absolute -top-8 left-0 right-0 h-8 flex items-center justify-between px-3 bg-black/90 backdrop-blur-sm border-t border-l border-r border-primary/40 rounded-t-md opacity-0 pointer-events-none group-hover/shell:opacity-100 group-hover/shell:pointer-events-auto transition-all duration-200 z-50 text-white shadow-md">
          <div className="flex items-center gap-2 handle cursor-move widget-shell-drag-handle flex-grow h-full">
            {!isPinned && (
              <GripHorizontal className="w-4 h-4 text-primary/75 group-hover/shell:text-primary transition-colors mr-0.5" />
            )}
            <span className="font-body text-sm tracking-wider text-primary uppercase leading-none">{title}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => toggleWidgetPin(id)}
              className="text-foreground/70 hover:text-primary transition-all flex items-center gap-1 font-code text-[9px] font-bold px-1.5 py-0.5 rounded border border-primary/20 bg-primary/5 hover:border-primary/40"
              title={isPinned ? "Unpin widget" : "Pin widget to desktop"}
            >
              {isPinned ? <PinOff size={10} className="text-accent" /> : <Pin size={10} />}
              <span>{isPinned ? 'UNPIN' : 'PIN'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-foreground/70 hover:text-destructive transition-all flex items-center gap-1 font-code text-[9px] font-bold px-1.5 py-0.5 rounded border border-primary/20 bg-primary/5 hover:border-destructive/40"
              title="Close widget"
            >
              <X size={10} />
              <span>CLOSE</span>
            </button>
          </div>
        </div>

        {/* Widget Border Wrapper */}
        <div
          className={cn(
            "relative rounded-lg border-2 bg-card/90 backdrop-blur-sm overflow-hidden",
            isPinned 
              ? "border-primary/20 shadow-sm" 
              : "border-primary/50 shadow-md ring-1 ring-primary/10"
          )}
        >
          {childWithProps}
        </div>
      </div>
    </Draggable>
  );
}
