"use client";
import { useEffect, useRef } from 'react';

export default function DigitalRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas to full screen
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Characters for the rain (include more tech-looking characters)
        const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'S', 'U', 'I', 'H', 'D'];

        // Configure rain
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = [];

        // Color palette (Blue gradients like Sui.io)
        const colors = [
            'rgba(56, 152, 255, opacity)', // Bright blue
            'rgba(8, 145, 178, opacity)',  // Cyan
            'rgba(79, 70, 229, opacity)',  // Indigo
            'rgba(67, 56, 202, opacity)',  // Deep blue
            'rgba(0, 187, 255, opacity)',  // Light blue
        ];

        // Initialize drop position for each column with variation
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * -100); // Random starting position above viewport
        }

        // Draw the digital rain
        const draw = () => {
            // Semi-transparent black to create fade effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Set text style
            ctx.font = `${fontSize}px monospace`;

            // Draw characters
            for (let i = 0; i < drops.length; i++) {
                // Select random character
                const text = chars[Math.floor(Math.random() * chars.length)];

                // Select random color from palette with varying opacity
                const opacity = Math.random() * 0.5 + 0.3; // Between 0.3 and 0.8
                const colorIndex = Math.floor(Math.random() * colors.length);
                const color = colors[colorIndex].replace('opacity', opacity.toString());
                ctx.fillStyle = color;

                // Vary font size slightly for more organic look
                const sizeVariation = Math.random() * 4 - 2; // Between -2 and 2
                ctx.font = `${fontSize + sizeVariation}px monospace`;

                // Draw text
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                // Add occasional glow effect for highlight characters
                if (Math.random() > 0.98) {
                    ctx.shadowColor = colors[colorIndex].replace('opacity', '1');
                    ctx.shadowBlur = 10;
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    ctx.shadowBlur = 0;
                }

                // Reset drop position if it's at the bottom or randomly
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                // Move drop down with varied speed
                drops[i] += Math.random() * 0.5 + 0.5;
            }
        };

        // Animation loop
        const animationFrame = { current: 0 };

        const animate = () => {
            draw();
            animationFrame.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrame.current);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none opacity-30"
            aria-hidden="true"
        />
    );
} 