"use client";
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

type Feature3DCardProps = {
    image: string;
    title: string;
    description: string;
    link?: string;
};

export default function Feature3DCard({ image, title, description, link }: Feature3DCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !isHovered) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();

        // Calculate mouse position relative to card center
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const offsetX = (e.clientX - cardCenterX) / (rect.width / 2);
        const offsetY = (e.clientY - cardCenterY) / (rect.height / 2);

        // Set transform with rotation and subtle movement
        setTransform(`
      perspective(1000px) 
      rotateY(${offsetX * 10}deg) 
      rotateX(${-offsetY * 10}deg) 
      translateZ(10px)
      scale3d(1.05, 1.05, 1.05)
    `);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTransform('perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale3d(1, 1, 1)');
    };

    const handleClick = () => {
        setIsFlipped(!isFlipped);
    };

    // Add floating animation
    useEffect(() => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        let startTime = Date.now();
        let requestId: number;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const amplitude = 10; // pixels to move up/down
            const period = 3000; // milliseconds for one complete cycle

            // Only apply floating if not being interacted with
            if (!isHovered) {
                const sinValue = Math.sin(elapsed * (2 * Math.PI) / period);
                const translateY = sinValue * amplitude;

                card.style.transform = transform
                    ? transform
                    : `perspective(1000px) translateY(${translateY}px)`;
            } else {
                card.style.transform = transform;
            }

            requestId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(requestId);
        };
    }, [isHovered, transform]);

    return (
        <div
            ref={cardRef}
            className={`feature-3d-card ${isFlipped ? 'is-flipped' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{
                transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
            }}
        >
            <div className="card-inner">
                <div className="card-front">
                    <div className="card-image">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                        />
                    </div>
                    <div className="card-content">
                        <h3 className="card-title">{title}</h3>
                        <p className="card-description">{description}</p>
                        {link && (
                            <a href={link} className="card-link">
                                Learn More <span className="arrow">→</span>
                            </a>
                        )}
                    </div>
                </div>
                <div className="card-back">
                    <div className="card-back-content">
                        <h3 className="card-title">{title}</h3>
                        <p className="card-back-description">Click card to see more details</p>
                        {link && (
                            <a href={link} className="card-back-button">
                                Explore Further
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 