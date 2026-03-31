import { memo } from "react";

// Optimized pyramid loader - reduced motion, CSS animations where possible
export const PyramidLoader = memo(function PyramidLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Mayan Temple Pyramid - static SVG with CSS animations */}
      <div className="relative w-64 h-52">
        <svg
          viewBox="0 0 260 200"
          className="w-full h-full animate-fade-in"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="pyramidGradientMain" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="pyramidShadow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="sunGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Base platform */}
          <rect
            x="20"
            y="175"
            width="220"
            height="12"
            rx="2"
            fill="url(#pyramidShadow)"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
          />

          {/* Pyramid levels - static rendering */}
          {[
            { y: 155, width: 180, height: 20 },
            { y: 135, width: 150, height: 20 },
            { y: 115, width: 120, height: 20 },
            { y: 95, width: 90, height: 20 },
            { y: 75, width: 60, height: 20 },
          ].map((level, i) => (
            <g key={i}>
              <rect
                x={130 - level.width / 2}
                y={level.y}
                width={level.width}
                height={level.height}
                fill="url(#pyramidGradientMain)"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
              />
              <line
                x1={130 - level.width / 2 + 5}
                y1={level.y + level.height / 2}
                x2={130 + level.width / 2 - 5}
                y2={level.y + level.height / 2}
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
            </g>
          ))}

          {/* Temple on top */}
          <g>
            <rect
              x="105"
              y="55"
              width="50"
              height="20"
              fill="url(#pyramidGradientMain)"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
            />
            <path
              d="M100 55 L130 30 L160 55 Z"
              fill="url(#pyramidGradientMain)"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
            />
            <rect
              x="122"
              y="60"
              width="16"
              height="15"
              fill="hsl(var(--background))"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              className="animate-pulse"
            />
          </g>

          {/* Central stairs */}
          <g>
            {[155, 135, 115, 95, 75].map((y, i) => (
              <rect
                key={`stair-${i}`}
                x="120"
                y={y}
                width="20"
                height="20"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="0.75"
                strokeOpacity="0.5"
              />
            ))}
          </g>

          {/* Sun/Moon behind pyramid */}
          <circle
            cx="130"
            cy="20"
            r="12"
            fill="url(#sunGlow)"
            filter="url(#glowFilter)"
            className="animate-pulse-slow"
          />

          {/* Sun rays - static */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line
              key={`ray-${i}`}
              x1={130 + Math.cos((angle * Math.PI) / 180) * 16}
              y1={20 + Math.sin((angle * Math.PI) / 180) * 16}
              x2={130 + Math.cos((angle * Math.PI) / 180) * 24}
              y2={20 + Math.sin((angle * Math.PI) / 180) * 24}
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          ))}

          {/* Decorative glyphs on sides */}
          <g opacity="0.6">
            <rect x="35" y="160" width="8" height="8" fill="hsl(var(--primary))" fillOpacity="0.5" />
            <rect x="47" y="160" width="8" height="8" fill="hsl(var(--primary))" fillOpacity="0.3" />
            <rect x="35" y="145" width="8" height="8" fill="hsl(var(--primary))" fillOpacity="0.3" />
            <rect x="217" y="160" width="8" height="8" fill="hsl(var(--primary))" fillOpacity="0.5" />
            <rect x="205" y="160" width="8" height="8" fill="hsl(var(--primary))" fillOpacity="0.3" />
            <rect x="217" y="145" width="8" height="8" fill="hsl(var(--primary))" fillOpacity="0.3" />
          </g>
        </svg>

        {/* Reduced mystical particles - CSS only */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/70 animate-float"
            style={{
              left: `${30 + i * 12}%`,
              bottom: "30%",
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}

        {/* Ground glow effect */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-4 bg-primary/20 blur-xl rounded-full animate-pulse-slow" />
      </div>

      {/* Loading text */}
      <p className="text-sm text-muted-foreground mt-4 animate-pulse">
        Consultando el calendario sagrado...
      </p>
    </div>
  );
});
