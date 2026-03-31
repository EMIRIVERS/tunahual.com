import { memo, useMemo } from "react";

// Lightweight CSS-based particles - no Framer Motion overhead
const particles = [
  { x: 15, y: 20, size: 3, delay: 0 },
  { x: 45, y: 30, size: 4, delay: 1 },
  { x: 75, y: 15, size: 2, delay: 2 },
  { x: 25, y: 60, size: 3, delay: 0.5 },
  { x: 85, y: 45, size: 4, delay: 1.5 },
  { x: 55, y: 70, size: 2, delay: 2.5 },
];

export const OptimizedParticles = memo(function OptimizedParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/20 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
});

// Lightweight glowing orbs - CSS only
export const OptimizedGlowingOrbs = memo(function OptimizedGlowingOrbs() {
  return (
    <>
      <div 
        className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"
        style={{ willChange: 'opacity' }}
      />
      <div 
        className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"
        style={{ animationDelay: '1s', willChange: 'opacity' }}
      />
    </>
  );
});
