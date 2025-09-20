import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { Award, Flame, Star } from 'lucide-react';
import { userProgress } from '@/lib/user-data';
import { cn } from '@/lib/utils';
import './profile-card.css';

const DEFAULT_BEHIND_GRADIENT =
  'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(var(--primary), 0.5) 4%,hsla(var(--primary), 0.3) 10%,hsla(var(--accent), 0.2) 50%,transparent 100%),radial-gradient(35% 52% at 55% 20%,hsla(var(--secondary), 0.8) 0%,transparent 100%),radial-gradient(100% 100% at 50% 50%,hsla(var(--accent), 0.8) 1%,transparent 76%),conic-gradient(from 124deg at 50% 50%,hsl(var(--primary)) 0%,hsl(var(--secondary)) 40%,hsl(var(--secondary)) 60%,hsl(var(--primary)) 100%)';

const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,hsla(var(--secondary), 0.5) 0%,hsla(var(--accent), 0.2) 100%)';

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20
};

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

const round = (value: number, precision = 3) => parseFloat(value.toFixed(precision));

const adjust = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));

const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

interface ProfileCardProps {
  avatarUrl?: string;
  iconUrl?: string;
  grainUrl?: string;
  behindGradient?: string;
  innerGradient?: string;
  showBehindGradient?: boolean;
  className?: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  avatarUrl = 'public/img/8d80ac310f8cc213371c3ea847a46860.jpg',
  iconUrl = '/tva-logo.svg',
  grainUrl,
  behindGradient,
  innerGradient,
  showBehindGradient = true,
  className = '',
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = 'Javi A. Torres',
  title = 'Software Engineer',
  handle = 'javicodes',
  status = 'Online',
  contactText = 'Contact',
  showUserInfo = true,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stats = [
    {
      title: 'Eco Points',
      value: userProgress.points.toLocaleString(),
      icon: Star,
      color: 'text-yellow-400',
    },
    {
      title: 'Daily Streak',
      value: `${userProgress.streak} Days`,
      icon: Flame,
      color: 'text-orange-400',
    },
    {
      title: 'Badges Earned',
      value: userProgress.badges.length,
      icon: Award,
      color: 'text-blue-400',
    },
  ];

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  }

  const handlePointerEnter = useCallback(() => {
    if (flipTimeoutRef.current) {
        clearTimeout(flipTimeoutRef.current);
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (flipTimeoutRef.current) {
        clearTimeout(flipTimeoutRef.current);
    }
    flipTimeoutRef.current = setTimeout(() => {
      setIsFlipped(false);
    }, 2000);
  }, []);


  const animationHandlers = useMemo(() => {
    if (!enableTilt) return null;

    let rafId: number | null = null;

    const updateCardTransform = (offsetX: number, offsetY: number, card: HTMLElement, wrap: HTMLDivElement) => {
      const width = card.clientWidth;
      const height = card.clientHeight;

      const percentX = clamp((100 / width) * offsetX);
      const percentY = clamp((100 / height) * offsetY);

      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        '--pointer-from-top': `${percentY / 100}`,
        '--pointer-from-left': `${percentX / 100}`,
        '--rotate-x': `${round(-(centerX / 5))}deg`,
        '--rotate-y': `${round(centerY / 4)}deg`
      };

      Object.entries(properties).forEach(([property, value]) => {
        wrap.style.setProperty(property, value);
      });
    };

    const createSmoothAnimation = (duration: number, startX: number, startY: number, card: HTMLElement, wrap: HTMLDivElement) => {
      const startTime = performance.now();
      const targetX = wrap.clientWidth / 2;
      const targetY = wrap.clientHeight / 2;

      const animationLoop = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = clamp(elapsed / duration);
        const easedProgress = easeInOutCubic(progress);

        const currentX = adjust(easedProgress, 0, 1, startX, targetX);
        const currentY = adjust(easedProgress, 0, 1, startY, targetY);

        updateCardTransform(currentX, currentY, card, wrap);

        if (progress < 1) {
          rafId = requestAnimationFrame(animationLoop);
        }
      };

      rafId = requestAnimationFrame(animationLoop);
    };

    return {
      updateCardTransform,
      createSmoothAnimation,
      cancelAnimation: () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    };
  }, [enableTilt]);

  const handlePointerMove = useCallback(
    (event: PointerEvent | MouseEvent) => {
      const card = cardRef.current;
      const wrap = wrapRef.current;

      if (!card || !wrap || !animationHandlers) return;
      if (isFlipped) return;

      const rect = card.getBoundingClientRect();
      animationHandlers.updateCardTransform(event.clientX - rect.left, event.clientY - rect.top, card, wrap);
    },
    [animationHandlers, isFlipped]
  );

  const handlePointerEnterTilt = useCallback(() => {
    const card = cardRef.current;
    const wrap = wrapRef.current;

    if (!card || !wrap || !animationHandlers) return;

    animationHandlers.cancelAnimation();
    wrap.classList.add('active');
    card.classList.add('active');
  }, [animationHandlers]);

  const handlePointerLeaveTilt = useCallback(
    (event: PointerEvent | MouseEvent) => {
      const card = cardRef.current;
      const wrap = wrapRef.current;

      if (!card || !wrap || !animationHandlers) return;

      animationHandlers.createSmoothAnimation(
        ANIMATION_CONFIG.SMOOTH_DURATION,
        event.offsetX,
        event.offsetY,
        card,
        wrap
      );
      wrap.classList.remove('active');
      card.classList.remove('active');
    },
    [animationHandlers]
  );

  const handleDeviceOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      const card = cardRef.current;
      const wrap = wrapRef.current;

      if (!card || !wrap || !animationHandlers) return;

      const { beta, gamma } = event;
      if (!beta || !gamma) return;

      animationHandlers.updateCardTransform(
        card.clientHeight / 2 + gamma * mobileTiltSensitivity,
        card.clientWidth / 2 + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
        card,
        wrap
      );
    },
    [animationHandlers, mobileTiltSensitivity]
  );

  useEffect(() => {
    if (!enableTilt || !animationHandlers) return;

    const card = cardRef.current;
    const wrap = wrapRef.current;

    if (!card || !wrap) return;

    const pointerMoveHandler = handlePointerMove;
    const pointerEnterHandler = handlePointerEnterTilt;
    const pointerLeaveHandler = handlePointerLeaveTilt;
    const deviceOrientationHandler = handleDeviceOrientation;

    const handleClick = () => {
      if (!enableMobileTilt || location.protocol !== 'https:') return;
      if (typeof window.DeviceMotionEvent !== 'undefined' && typeof (window.DeviceMotionEvent as any).requestPermission === 'function') {
        (window.DeviceMotionEvent as any).requestPermission()
          .then((state: string) => {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', deviceOrientationHandler);
            }
          })
          .catch((err: Error) => console.error(err));
      } else {
        window.addEventListener('deviceorientation', deviceOrientationHandler);
      }
    };

    card.addEventListener('pointerenter', pointerEnterHandler);
    card.addEventListener('pointermove', pointerMoveHandler);
    card.addEventListener('pointerleave', pointerLeaveHandler);
    card.addEventListener('click', handleClick);

    const initialX = wrap.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;

    animationHandlers.updateCardTransform(initialX, initialY, card, wrap);
    animationHandlers.createSmoothAnimation(ANIMATION_CONFIG.INITIAL_DURATION, initialX, initialY, card, wrap);

    return () => {
      card.removeEventListener('pointerenter', pointerEnterHandler);
      card.removeEventListener('pointermove', pointerMoveHandler);
      card.removeEventListener('pointerleave', pointerLeaveHandler);
      card.removeEventListener('click', handleClick);
      window.removeEventListener('deviceorientation', deviceOrientationHandler);
      animationHandlers.cancelAnimation();
    };
  }, [
    enableTilt,
    enableMobileTilt,
    animationHandlers,
    handlePointerMove,
    handlePointerEnterTilt,
    handlePointerLeaveTilt,
    handleDeviceOrientation
  ]);
  
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.addEventListener('mouseenter', handlePointerEnter);
    wrap.addEventListener('mouseleave', handlePointerLeave);
    
    return () => {
        wrap.removeEventListener('mouseenter', handlePointerEnter);
        wrap.removeEventListener('mouseleave', handlePointerLeave);
        if (flipTimeoutRef.current) {
            clearTimeout(flipTimeoutRef.current);
        }
    }
  }, [handlePointerEnter, handlePointerLeave]);

  const cardStyle = useMemo(
    () => ({
      '--icon': iconUrl ? `url(${iconUrl})` : 'none',
      '--grain': grainUrl ? `url(${grainUrl})` : 'none',
      '--behind-gradient': showBehindGradient ? (behindGradient ?? DEFAULT_BEHIND_GRADIENT) : 'none',
      '--inner-gradient': innerGradient ?? DEFAULT_INNER_GRADIENT
    } as React.CSSProperties),
    [iconUrl, grainUrl, showBehindGradient, behindGradient, innerGradient]
  );


  return (
    <div ref={wrapRef} className={`pc-card-wrapper ${className}`.trim()} style={cardStyle}>
      <section ref={cardRef} className={cn("pc-card", { 'is-flipped': isFlipped })}>
        {/* Front */}
        <div className="pc-card-face pc-card-face-front">
          <div className="pc-inside">
            <div className="pc-shine" />
            <div className="pc-glare" />
            <div className="pc-content pc-avatar-content">
              <img
                className="avatar"
                src={avatarUrl}
                alt={`${name || 'User'} avatar`}
                loading="lazy"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {showUserInfo && (
                <div className="pc-user-info">
                  <div className="pc-user-details">
                    <div className="pc-mini-avatar">
                      <img
                        src={miniAvatarUrl || avatarUrl}
                        alt={`${name || 'User'} mini avatar`}
                        loading="lazy"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = '0.5';
                          target.src = avatarUrl;
                        }}
                      />
                    </div>
                    <div className="pc-user-text">
                      <div className="pc-handle">@{handle}</div>
                      <div className="pc-status">{status}</div>
                    </div>
                  </div>
                  <button
                    className="pc-contact-btn"
                    onClick={handleFlip}
                    style={{ pointerEvents: 'auto' }}
                    type="button"
                    aria-label={`Contact ${name || 'user'}`}
                  >
                    {contactText}
                  </button>
                </div>
              )}
            </div>
            <div className="pc-content">
              <div className="pc-details">
                <h3>{name}</h3>
                <p>{title}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Back */}
        <div className="pc-card-face pc-card-face-back">
          <div className="pc-stats-header">
            <h3>Eco Stats</h3>
          </div>
          <ul className="pc-stats-list">
             {stats.map(stat => (
                <li key={stat.title}>
                    <div className="pc-stat-label">
                        <stat.icon className={cn("h-5 w-5", stat.color)} />
                        <span>{stat.title}</span>
                    </div>
                    <span className="pc-stat-value">{stat.value}</span>
                </li>
             ))}
          </ul>
          <div className="pc-stats-badges">
             <h4>Badges</h4>
             <div className="pc-badges-grid">
                {userProgress.badges.slice(0, 5).map((badge) => (
                    <div key={badge.name} className="pc-badge" title={badge.name}>
                        <div className="pc-badge-icon-wrapper">
                            <badge.icon className="h-6 w-6 text-accent" />
                        </div>
                    </div>
                ))}
             </div>
          </div>
           <button className="pc-back-btn" onClick={handleFlip}>
            Return
          </button>
        </div>
      </section>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);

export default ProfileCard;
