import { useEffect, useRef } from 'react';

export type OwlLogoState = 'idle' | 'trackingMouse' | 'focusingUser' | 'focusingPassword';

interface AnimatedOwlLogoProps {
  className?: string;
  state?: OwlLogoState;
}

const MAX_EYE_OFFSET = 2.25;
const USER_FIELD_LOOK = { x: 1.7, y: 1.05 };

export function AnimatedOwlLogo({ className, state = 'trackingMouse' }: AnimatedOwlLogoProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const stateRef = useRef<OwlLogoState>(state);

  const isPasswordFocused = state === 'focusingPassword';

  useEffect(() => {
    stateRef.current = state;

    if (state === 'focusingUser') {
      setEyeOffset(USER_FIELD_LOOK.x, USER_FIELD_LOOK.y);
      return;
    }

    if (state === 'focusingPassword') {
      setEyeOffset(0, 0);
      return;
    }

    const lastPointer = lastPointerRef.current;

    if (lastPointer) {
      trackPointer(lastPointer.x, lastPointer.y);
      return;
    }

    setEyeOffset(0, 0);
  }, [state]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }

      lastPointerRef.current = {
        x: event.clientX,
        y: event.clientY
      };

      if (stateRef.current === 'focusingUser' || stateRef.current === 'focusingPassword') {
        return;
      }

      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        const lastPointer = lastPointerRef.current;

        if (lastPointer && stateRef.current !== 'focusingUser' && stateRef.current !== 'focusingPassword') {
          trackPointer(lastPointer.x, lastPointer.y);
        }
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const setEyeOffset = (x: number, y: number) => {
    const svg = svgRef.current;

    if (!svg) {
      return;
    }

    svg.style.setProperty('--owl-eye-x', `${x}px`);
    svg.style.setProperty('--owl-eye-y', `${y}px`);
  };

  const trackPointer = (clientX: number, clientY: number) => {
    const svg = svgRef.current;

    if (!svg) {
      return;
    }

    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (!distance) {
      setEyeOffset(0, 0);
      return;
    }

    const strength = Math.min(1, distance / 280);

    setEyeOffset(
      (deltaX / distance) * MAX_EYE_OFFSET * strength,
      (deltaY / distance) * MAX_EYE_OFFSET * strength
    );
  };

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      role="img"
      aria-label="Coruja SINDATA"
      className={className}
    >
      <rect x="1.5" y="1.5" width="61" height="61" rx="12" fill="#ffffff" stroke="#155e75" strokeWidth="3" />

      <path
        d="M10 14L32 8L54 14"
        fill="none"
        stroke="#111111"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 14V18C16 21 24 23 32 23C40 23 48 21 48 18V14"
        fill="none"
        stroke="#111111"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M14 24C14 17 20 13 27 13H37C44 13 50 17 50 24V39C50 49 42 56 32 56C22 56 14 49 14 39V24Z"
        fill="none"
        stroke="#111111"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="28" r="7" fill="none" stroke="#111111" strokeWidth="3" />
      <circle cx="39" cy="28" r="7" fill="none" stroke="#111111" strokeWidth="3" />

      <g
        style={{
          opacity: isPasswordFocused ? 0 : 1,
          transform: 'translate(var(--owl-eye-x, 0px), var(--owl-eye-y, 0px))',
          transition: 'transform 140ms ease-out, opacity 120ms ease-out'
        }}
      >
        <circle cx="25" cy="28" r="1.8" fill="#111111" />
        <circle cx="39" cy="28" r="1.8" fill="#111111" />
      </g>

      <g
        style={{
          opacity: isPasswordFocused ? 1 : 0,
          transition: 'opacity 140ms ease-out'
        }}
      >
        <path d="M20.5 28C22.2 29.5 23.8 30.2 25 30.2C26.2 30.2 27.8 29.5 29.5 28" fill="none" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
        <path d="M34.5 28C36.2 29.5 37.8 30.2 39 30.2C40.2 30.2 41.8 29.5 43.5 28" fill="none" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
      </g>

      <path d="M32 30L34 33L32 35L30 33Z" fill="#111111" />

      <path
        d="M17 39L21 43L25 39L29 43"
        fill="none"
        stroke="#111111"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M34 40L37 43L40 40" fill="none" stroke="#111111" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 45L41 48L44 45" fill="none" stroke="#111111" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />

      <path d="M27 56V61" fill="none" stroke="#111111" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M37 56V61" fill="none" stroke="#111111" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}
