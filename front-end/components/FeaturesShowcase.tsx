"use client";
import { useState, useEffect } from 'react';
import Feature3DCard from './Feature3DCard';

export default function FeaturesShowcase() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        const section = document.getElementById('features-showcase');
        if (section) {
            observer.observe(section);
        }

        return () => {
            if (section) {
                observer.unobserve(section);
            }
        };
    }, []);

    const features = [
        {
            id: 1,
            image: '/images/USDH_1.png',
            title: 'Compute Power Backing',
            description: 'Stablecoin supported by distributed computing resources, providing real-world value assurance for your assets',
            link: '#compute-power'
        },
        {
            id: 2,
            image: '/images/USDH_2.png',
            title: 'USDH Stablecoin',
            description: '1:1 USD pegging, transparent reserve management and low transaction fees, providing a stable foundation for DeFi ecosystem',
            link: '#stablecoin'
        },
        {
            id: 3,
            image: '/images/FundUnit.png',
            title: 'Fund Units',
            description: 'Programmable fund management, customizable flow control and multi-signature authorization for flexible and secure fund operations',
            link: '#fund-units'
        }
    ];

    return (
        <section
            id="features-showcase"
            className="py-20 relative overflow-hidden"
        >
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent"></div>
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5"></div>

            {/* Glow effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className={`text-3xl md:text-5xl font-bold mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                            USDH Core Features
                        </span>
                    </h2>
                    <p className={`text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}>
                        Explore the innovative compute-backed stablecoin system, connecting distributed computing resources with decentralized finance
                    </p>
                </div>

                <div className={`feature-cards-grid transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                    }`}>
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            className="transition-all"
                            style={{
                                transitionDelay: `${index * 200 + 500}ms`,
                                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                                opacity: isVisible ? 1 : 0
                            }}
                        >
                            <Feature3DCard
                                image={feature.image}
                                title={feature.title}
                                description={feature.description}
                                link={feature.link}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
} 