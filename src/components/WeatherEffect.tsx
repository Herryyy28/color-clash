import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CloudRain, CloudFog, Sun, Sparkles } from 'lucide-react';
import { sounds } from '../audio';

export type WeatherType = 'rain' | 'fog' | 'clear';

interface WeatherEffectProps {
  isPaused?: boolean;
  initialWeather?: WeatherType;
  cycleIntervalSeconds?: number;
  className?: string;
  showBadge?: boolean;
  onWeatherChange?: (weather: WeatherType) => void;
}

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  thickness: number;
}

interface Splash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface FogParticle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  opacity: number;
  phase: number;
}

interface SunMote {
  x: number;
  y: number;
  radius: number;
  vy: number;
  vx: number;
  opacity: number;
  phase: number;
}

const WEATHER_META: Record<
  WeatherType,
  { label: string; icon: React.ReactNode; desc: string; banner: string }
> = {
  rain: {
    label: 'Rain',
    icon: <CloudRain className="w-3.5 h-3.5 text-sky-200 animate-pulse" />,
    desc: 'Cool Downpours',
    banner: '🌧️ Rain Showers',
  },
  fog: {
    label: 'Fog',
    icon: <CloudFog className="w-3.5 h-3.5 text-sky-100 animate-pulse" />,
    desc: 'Battlefield Mist',
    banner: '🌫️ Morning Mist',
  },
  clear: {
    label: 'Clear',
    icon: <Sun className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '8s' }} />,
    desc: 'High Visibility',
    banner: '☀️ Clear Skies',
  },
};

export const WeatherEffect: React.FC<WeatherEffectProps> = ({
  isPaused = false,
  initialWeather = 'rain',
  cycleIntervalSeconds = 22,
  className = '',
  showBadge = true,
  onWeatherChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherType>(initialWeather);
  const [badgeNotice, setBadgeNotice] = useState<string | null>(WEATHER_META[initialWeather].banner);

  // Manual or automatic cycle forward
  const cycleNextWeather = useCallback(() => {
    setCurrentWeather((prev) => {
      const sequence: WeatherType[] = ['rain', 'fog', 'clear'];
      const nextIndex = (sequence.indexOf(prev) + 1) % sequence.length;
      const nextWeather = sequence[nextIndex];
      onWeatherChange?.(nextWeather);
      return nextWeather;
    });
  }, [onWeatherChange]);

  // Periodic weather cycling effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      cycleNextWeather();
    }, cycleIntervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [isPaused, cycleIntervalSeconds, cycleNextWeather]);

  // Toast / Badge notice whenever weather changes
  useEffect(() => {
    setBadgeNotice(WEATHER_META[currentWeather].banner);
    const timer = setTimeout(() => {
      setBadgeNotice(null);
    }, 3600);

    return () => clearTimeout(timer);
  }, [currentWeather]);

  // Particle simulation and rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 640);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initial particle pools
    const rainDrops: RainDrop[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * (width + 60) - 30,
      y: Math.random() * height,
      speed: Math.random() * 5 + 9,
      length: Math.random() * 10 + 10,
      opacity: Math.random() * 0.35 + 0.25,
      thickness: Math.random() * 0.8 + 0.8,
    }));

    const splashes: Splash[] = [];

    const fogParticles: FogParticle[] = Array.from({ length: 9 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 100 + 80,
      vx: Math.random() * 0.3 + 0.15,
      vy: (Math.random() - 0.5) * 0.08,
      opacity: Math.random() * 0.12 + 0.08,
      phase: Math.random() * Math.PI * 2,
    }));

    const sunMotes: SunMote[] = Array.from({ length: 22 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 1,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -(Math.random() * 0.3 + 0.1),
      opacity: Math.random() * 0.45 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    let frame = 0;

    const render = () => {
      if (isPaused) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      frame++;

      // 1. RAIN EFFECT
      if (currentWeather === 'rain') {
        ctx.lineCap = 'round';
        for (let i = 0; i < rainDrops.length; i++) {
          const drop = rainDrops[i];
          ctx.beginPath();
          ctx.strokeStyle = `rgba(186, 230, 253, ${drop.opacity})`;
          ctx.lineWidth = drop.thickness;

          const slantX = 1.8;
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + slantX, drop.y + drop.length);
          ctx.stroke();

          drop.x += slantX * 0.6;
          drop.y += drop.speed;

          // Splash on floor
          if (drop.y > height - 12 || Math.random() < 0.012) {
            if (splashes.length < 24) {
              splashes.push({
                x: drop.x,
                y: Math.min(height - 4, drop.y),
                radius: 1,
                maxRadius: Math.random() * 4 + 2.5,
                opacity: 0.4,
              });
            }
            drop.y = -drop.length;
            drop.x = Math.random() * (width + 60) - 30;
          }
        }

        // Ripples / splashes
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(147, 197, 253, ${s.opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          s.radius += 0.4;
          s.opacity -= 0.035;
          if (s.opacity <= 0 || s.radius >= s.maxRadius) {
            splashes.splice(i, 1);
          }
        }
      }

      // 2. FOG EFFECT
      else if (currentWeather === 'fog') {
        for (let i = 0; i < fogParticles.length; i++) {
          const fog = fogParticles[i];
          fog.x += fog.vx;
          fog.y += Math.sin(frame * 0.02 + fog.phase) * 0.2;

          if (fog.x - fog.radius > width) {
            fog.x = -fog.radius;
            fog.y = Math.random() * height;
          }

          const grad = ctx.createRadialGradient(
            fog.x,
            fog.y,
            0,
            fog.x,
            fog.y,
            fog.radius
          );
          grad.addColorStop(0, `rgba(224, 242, 254, ${fog.opacity * 1.25})`);
          grad.addColorStop(0.5, `rgba(186, 230, 253, ${fog.opacity * 0.75})`);
          grad.addColorStop(1, 'rgba(186, 230, 253, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(fog.x, fog.y, fog.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. CLEAR / SUNNY EFFECT
      else if (currentWeather === 'clear') {
        for (let i = 0; i < sunMotes.length; i++) {
          const mote = sunMotes[i];
          mote.x += mote.vx + Math.sin(frame * 0.02 + mote.phase) * 0.15;
          mote.y += mote.vy;

          if (mote.y < -5) {
            mote.y = height + 5;
            mote.x = Math.random() * width;
          }

          const alpha = mote.opacity * (0.6 + 0.4 * Math.sin(frame * 0.05 + mote.phase));
          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
          ctx.fill();
        }

        // Gentle warm sunlight sheen at top
        const sunGrad = ctx.createLinearGradient(0, 0, 0, height * 0.3);
        sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.05)');
        sunGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, width, height * 0.3);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentWeather, isPaused]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* HTML5 Canvas overlay for 60fps subtle atmospheric animations */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ pointerEvents: 'none' }}
      />

      {/* Atmospheric Weather Control / Interactive Status Pill (Top-Right on Arena) */}
      {showBadge && (
        <div className="absolute top-2 right-2 z-20 pointer-events-auto flex flex-col items-end gap-1 select-none">
          {/* Clickable Weather Toggle Badge */}
          <button
            onClick={() => {
              sounds.playClick();
              cycleNextWeather();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1e5ecc]/95 via-[#2b72f5]/90 to-[#1e5ecc]/95 hover:from-[#256cf0] hover:to-[#387bf8] active:scale-95 border border-sky-300/80 shadow-[0_4px_14px_rgba(30,95,220,0.4)] backdrop-blur-md cursor-pointer transition text-left"
            title="Current Arena Weather (Tap to change atmosphere)"
          >
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] border border-white/80 flex items-center justify-center shrink-0 shadow-sm">
              {WEATHER_META[currentWeather].icon}
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black text-white tracking-wide drop-shadow-sm">
                {WEATHER_META[currentWeather].label}
              </span>
              <span className="text-[8px] font-bold text-sky-200">Atmosphere</span>
            </div>
          </button>

          {/* Banner notification when weather shifts */}
          {badgeNotice && (
            <div className="pointer-events-none animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#174eb6]/90 via-[#2167ec]/85 to-[#174eb6]/90 border border-sky-300/80 shadow-md backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5 text-yellow-300 shrink-0" />
                <span className="text-[9px] font-extrabold text-white tracking-wide">
                  {badgeNotice}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
