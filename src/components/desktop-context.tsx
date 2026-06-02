'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type WidgetType = 'fact' | 'briefing' | 'weather' | 'news' | 'calendar' | 'garden';

export interface WidgetPosition {
  x: number;
  y: number;
}

interface DesktopContextType {
  isWidgetDockOpen: boolean;
  setIsWidgetDockOpen: (open: boolean) => void;
  desktopWidgets: WidgetType[];
  toggleWidget: (widgetId: WidgetType) => void;
  widgetPositions: Record<WidgetType, WidgetPosition>;
  updateWidgetPosition: (widgetId: WidgetType, pos: WidgetPosition) => void;
  widgetPinned: Record<WidgetType, boolean>;
  toggleWidgetPin: (widgetId: WidgetType) => void;
}

const DesktopContext = createContext<DesktopContextType | undefined>(undefined);

export function DesktopProvider({ children }: { children: React.ReactNode }) {
  const [isWidgetDockOpen, setIsWidgetDockOpen] = useState(false);
  const [desktopWidgets, setDesktopWidgets] = useState<WidgetType[]>([]);
  const [widgetPositions, setWidgetPositions] = useState<Record<WidgetType, WidgetPosition>>({} as any);
  const [widgetPinned, setWidgetPinned] = useState<Record<WidgetType, boolean>>({} as any);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on client-side mount
  useEffect(() => {
    const savedWidgets = localStorage.getItem('ecoquest_desktop_widgets');
    const savedPositions = localStorage.getItem('ecoquest_widget_positions');
    const savedPinned = localStorage.getItem('ecoquest_widget_pinned');

    if (savedWidgets) {
      try {
        setDesktopWidgets(JSON.parse(savedWidgets));
      } catch (e) {
        setDesktopWidgets(['fact', 'news']);
      }
    } else {
      // Default widgets
      setDesktopWidgets(['fact', 'news']);
    }

    if (savedPositions) {
      try {
        setWidgetPositions(JSON.parse(savedPositions));
      } catch (e) {}
    }

    if (savedPinned) {
      try {
        setWidgetPinned(JSON.parse(savedPinned));
      } catch (e) {}
    }

    setIsInitialized(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ecoquest_desktop_widgets', JSON.stringify(desktopWidgets));
  }, [desktopWidgets, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ecoquest_widget_positions', JSON.stringify(widgetPositions));
  }, [widgetPositions, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ecoquest_widget_pinned', JSON.stringify(widgetPinned));
  }, [widgetPinned, isInitialized]);

  const toggleWidget = (widgetId: WidgetType) => {
    setDesktopWidgets(prev =>
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const updateWidgetPosition = (widgetId: WidgetType, pos: WidgetPosition) => {
    setWidgetPositions(prev => ({
      ...prev,
      [widgetId]: pos
    }));
  };

  const toggleWidgetPin = (widgetId: WidgetType) => {
    setWidgetPinned(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }));
  };

  return (
    <DesktopContext.Provider value={{
      isWidgetDockOpen,
      setIsWidgetDockOpen,
      desktopWidgets,
      toggleWidget,
      widgetPositions,
      updateWidgetPosition,
      widgetPinned,
      toggleWidgetPin
    }}>
      {children}
    </DesktopContext.Provider>
  );
}

export function useDesktop() {
  const context = useContext(DesktopContext);
  if (!context) {
    throw new Error('useDesktop must be used within a DesktopProvider');
  }
  return context;
}
