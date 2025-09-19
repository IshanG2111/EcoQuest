
'use client';
import React, { useState } from 'react';
import { RefreshCw, Sun, Cloud, CloudRain, X } from 'lucide-react';
import './PixelWeatherWidget.css';

interface PixelWeatherWidgetProps {
  theme?: 'forest' | 'ocean' | 'city';
  onClose?: () => void;
}

const weatherIcons: { [key: string]: any } = {
    clear: Sun,
    clouds: Cloud,
    rain: CloudRain,
};

// Mock weather data for different themes
const getMockWeather = (theme: string) => {
  const weatherOptions: { [key: string]: { code: string; temp: number; facts: { headline: string; }[] } } = {
    forest: { code: 'clear', temp: 22, facts: [{ headline: 'Forests produce 28% of the oxygen we breathe' }] },
    ocean: { code: 'clouds', temp: 18, facts: [{ headline: 'Oceans absorb 30% of CO2 from the atmosphere' }] },
    city: { code: 'rain', temp: 25, facts: [{ headline: 'Green roofs can reduce building energy use by 30%' }] },
  };
  return weatherOptions[theme] || weatherOptions.forest;
};

const PixelLayer = ({ className, weatherCode }: { className: string, weatherCode: string }) => {
    return <div className={`pixel-layer ${className} ${weatherCode}`}></div>;
}

export function PixelWeatherWidget({ theme = 'forest', onClose }: PixelWeatherWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const weather = getMockWeather(theme);

  const toggleExpand = (e: React.MouseEvent) => {
    // Prevent closing when clicking inside the widget to expand/collapse
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('button')) {
        return;
    }
    setExpanded(!expanded);
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Cycle through facts for mock refresh
    setFactIndex(prev => (prev + 1) % weather.facts.length);
  };

  const weatherCode = weather.code;
  const Icon = weatherIcons[weatherCode] || Sun;

  return (
    <div
      role="region"
      aria-label={`Pixel weather widget for ${theme}`}
      tabIndex={0}
      className={`pixel-weather-widget ${theme} ${expanded ? 'expanded' : 'compact'} font-body`}
      onClick={toggleExpand}
    >
      <div className="pixel-scene">
        <div className={`scene-bg ${weatherCode}`}></div>
        {weatherCode === 'rain' && <PixelLayer className="rain" weatherCode={weatherCode} />}
        {weatherCode === 'snow' && <PixelLayer className="snow" weatherCode={weatherCode} />}
        <div className="scene-fg"></div>
      </div>
      
      <div className="overlay">
        <div className="topline">
          <Icon className="w-6 h-6" />
          <div className="temp">{Math.round(weather.temp)}°</div>
          <div className="label">{theme}</div>
        </div>
        <div className="microfact">
            {weather.facts[factIndex]?.headline || 'Environmental fact loading...'}
        </div>
      </div>

       <div className="controls">
            {onClose && (
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="widget-button" aria-label="Close">
                    <X size={14} />
                </button>
            )}
            <button onClick={handleRefresh} className="widget-button" aria-label="Refresh">
                <RefreshCw size={14} />
            </button>
        </div>
    </div>
  );
}
