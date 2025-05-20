"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ConceptPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Fade-in effect after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Create subtle particle effect
  useEffect(() => {
    if (!particlesRef.current || isLoading) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = particlesRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    const particles: {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }[] = [];

    const PARTICLE_COUNT = 50;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(56, 152, 255, ${p.opacity})`);
        gradient.addColorStop(1, 'rgba(56, 152, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [isLoading]);

  // Handle iframe load completion
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Handle button click
  const handleEnterClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      router.push("/main");
    }, 800);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden flex items-center justify-center">
      {/* Unchained Animation Background */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-blue-400/30 border-t-blue-400/80 rounded-full animate-spin"></div>
        </div>
      )}

      <iframe
        src="https://my.spline.design/unchained-WLMKJl4DWqwkFQ7SRYPUuNku/"
        frameBorder="0"
        className="absolute inset-0 w-full h-full"
        onLoad={handleIframeLoad}
        title="Unchained Animation Background"
        style={{ width: '100vw', height: '100vh', position: 'absolute', left: 0, top: 0 }}
      />

      {/* Particles container */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none z-[5]"></div>

      {/* Content Area - Enhanced Minimalist Design */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4 transition-all duration-1000 ${fadeIn ? "opacity-100" : "opacity-0"
          } ${isAnimating ? "opacity-0 translate-y-4" : ""
          } transition-all duration-500`}
      >
        {/* Main Title with enhanced effect */}
        <h1 className="font-blanka text-gradient-hero text-5xl sm:text-7xl md:text-8xl mb-10 tracking-widest stagger-item">
          USDH
        </h1>

        {/* Subtitle with stagger animation */}
        <h2 className="text-base sm:text-lg mb-4 font-light max-w-3xl tracking-wider stagger-item">
          DECENTRALIZED COMPUTE-BACKED STABLECOIN SYSTEM
        </h2>

        {/* Short Description with stagger animation */}
        <p className="text-xs sm:text-sm text-gray-300 mb-12 max-w-xl text-spacing stagger-item">
          CONNECTING DISTRIBUTED COMPUTE RESOURCES WITH STABLECOIN TECHNOLOGY
          TO CREATE A MULTI-ASSET BACKED FINANCIAL ECOSYSTEM
        </p>

        {/* Enhanced Button */}
        <button
          onClick={handleEnterClick}
          className="btn-primary stagger-item"
          disabled={isAnimating}
        >
          ENTER SYSTEM →
        </button>
      </div>

      {/* Scroll indicator */}
      <div className={`scroll-indicator ${fadeIn ? 'opacity-70' : 'opacity-0'} transition-opacity duration-1000`}>
        <div className="mouse"></div>
        <p className="text-xs mt-2 opacity-60">Scroll to explore</p>
      </div>
    </div>
  );
}
