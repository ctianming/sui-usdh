"use client";
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import DigitalRain from '@/components/DigitalRain';
import FeaturesShowcase from '@/components/FeaturesShowcase';
import Image from 'next/image';

// Section components
const HeroSection = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className="relative min-h-screen flex items-center">
            <div className="absolute inset-0 bg-gradient-to-b from-black to-blue-950/30 z-0"></div>

            {/* Animated background effect */}
            <div className="absolute inset-0 opacity-20 z-0">
                <div className="relative w-full h-full overflow-hidden">
                    <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent animate-pulse-slow"></div>
                    <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-400/10 via-transparent to-transparent animate-pulse-slow animation-delay-1000"></div>
                </div>
            </div>

            {/* Floating elements in background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute h-64 w-64 rounded-full bg-gradient-to-r from-blue-500/5 to-cyan-400/5 blur-3xl -top-10 -right-10 animate-float"></div>
                <div className="absolute h-96 w-96 rounded-full bg-gradient-to-r from-indigo-500/5 to-purple-400/5 blur-3xl -bottom-20 -left-20 animate-float animation-delay-1000"></div>
                <div className="absolute h-32 w-32 rounded-full border border-blue-500/10 top-1/4 right-1/4 animate-float animation-delay-2000"></div>
                <div className="absolute h-16 w-16 rounded-full border border-cyan-500/20 bottom-1/3 left-1/3 animate-float animation-delay-3000"></div>
            </div>

            <div className="container mx-auto px-6 z-10">
                <div className={`max-w-4xl transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient-hero">
                        USDH: BACKED BY REAL<br /> COMPUTE POWER
                    </h1>
                    <p className="text-xl md:text-2xl mb-10 text-gray-300">
                        The world's first stablecoin collateralized by distributed computing resources,
                        creating a new paradigm in digital assets
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="#features-showcase" className="btn-primary group">
                            LEARN MORE
                            <span className="ml-2 inline-block transition-transform group-hover:translate-y-1">
                                ↓
                            </span>
                        </a>
                        <a href="https://clearskys-organization-1.gitbook.io/usdh/" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                            WHITEPAPER
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
};

const MetricsSection = () => {
    const [counters, setCounters] = useState({
        supply: 0,
        ratio: 0,
        nodes: 0
    });

    const targetValues = {
        supply: 148243,
        ratio: 172,
        nodes: 2437
    };

    useEffect(() => {
        // Animate counter values when section is visible
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    const duration = 2000; // Animation duration in ms
                    const steps = 60; // Total animation steps
                    const interval = duration / steps;

                    let currentStep = 0;

                    const timer = setInterval(() => {
                        currentStep++;
                        const progress = currentStep / steps;

                        setCounters({
                            supply: Math.floor(targetValues.supply * progress),
                            ratio: Math.floor(targetValues.ratio * progress),
                            nodes: Math.floor(targetValues.nodes * progress)
                        });

                        if (currentStep >= steps) {
                            clearInterval(timer);
                            setCounters(targetValues);
                        }
                    }, interval);
                }
            },
            { threshold: 0.3 }
        );

        const section = document.getElementById('metrics-section');
        if (section) {
            observer.observe(section);
        }

        return () => {
            if (section) {
                observer.unobserve(section);
            }
        };
    }, []);

    return (
        <section id="metrics-section" className="py-24 relative">
            {/* Enhanced background with gradient and grid */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-black"></div>
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5"></div>

            {/* Decorative elements */}
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Section heading with background decoration */}
                <div className="relative mb-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white inline-block">
                        <span className="relative z-10">System Metrics</span>
                        <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0"></span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Total Supply Card */}
                    <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm p-8 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all duration-500 hover:shadow-glow transform hover:-translate-y-1 group overflow-hidden">
                        {/* Background glow effect */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-gray-400 text-sm font-medium tracking-wider">TOTAL SUPPLY</h3>
                            <div className="flex items-center bg-green-500/20 text-green-400 text-xs py-1 px-3 rounded-full">
                                <span className="mr-1 text-xs">↑</span>
                                <span>2.5% 24h</span>
                            </div>
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-baseline">
                            <span className="mr-2">{counters.supply.toLocaleString()}</span>
                            <span className="text-blue-400 text-xl">USDH</span>
                        </div>
                        <div className="relative h-2 w-full bg-gray-800/50 rounded-full overflow-hidden mb-2">
                            <div className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full" style={{ width: '72%' }}></div>
                            <div className="absolute top-0 h-full w-full opacity-30">
                                <div className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-blue-400/10 to-transparent"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Total Cap: 1,000,000</span>
                            <span>72% of Max</span>
                        </div>
                    </div>

                    {/* Collateral Ratio Card */}
                    <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm p-8 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all duration-500 hover:shadow-glow transform hover:-translate-y-1 group overflow-hidden">
                        {/* Background glow effect */}
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-gray-400 text-sm font-medium tracking-wider">COLLATERAL RATIO</h3>
                            <div className="flex items-center bg-blue-500/20 text-blue-400 text-xs py-1 px-3 rounded-full">
                                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2 pulse-effect"></span>
                                <span>Healthy</span>
                            </div>
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-4">
                            <span className="relative">
                                {counters.ratio}%
                                <span className="absolute -top-2 -right-2 text-xs text-green-400">+4%</span>
                            </span>
                        </div>
                        <div className="relative h-2 w-full bg-gray-800/50 rounded-full overflow-hidden mb-2">
                            <div className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full" style={{ width: '82%' }}></div>
                            <div className="absolute top-0 h-full w-full opacity-30">
                                <div className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="text-gray-500 text-xs">Min Required: 150%</div>
                            <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">+22% Buffer</div>
                        </div>
                    </div>

                    {/* Node Count Card */}
                    <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm p-8 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all duration-500 hover:shadow-glow transform hover:-translate-y-1 group overflow-hidden">
                        {/* Background glow effect */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-gray-400 text-sm font-medium tracking-wider">NODE COUNT</h3>
                            <div className="bg-purple-500/20 text-purple-400 text-xs py-1 px-3 rounded-full">28 Countries</div>
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {counters.nodes.toLocaleString()}
                            <span className="ml-2 text-xs text-purple-400 align-top">Nodes</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1 mb-2">
                            <div className="h-2 rounded-full bg-blue-500/70 animate-pulse-slow"></div>
                            <div className="h-2 rounded-full bg-cyan-500/70 animate-pulse-slow animation-delay-1000"></div>
                            <div className="h-2 rounded-full bg-indigo-500/70 animate-pulse-slow animation-delay-2000"></div>
                            <div className="h-2 rounded-full bg-purple-500/70 animate-pulse-slow animation-delay-3000"></div>
                            <div className="h-2 rounded-full bg-gray-700 animate-pulse-slow animation-delay-4000"></div>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-blue-400">CPU</span>
                            <span className="text-cyan-400">GPU</span>
                            <span className="text-indigo-400">TPU</span>
                            <span className="text-purple-400">FPGA</span>
                            <span className="text-gray-500">Other</span>
                        </div>
                    </div>
                </div>

                {/* Additional metric row */}
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gray-900/30 backdrop-blur-sm p-4 rounded-lg border border-gray-800 flex items-center">
                        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-blue-500/10 mr-3">
                            <span className="text-blue-400 text-xl">⚡</span>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">API TRANSACTIONS</div>
                            <div className="text-white font-bold">62.3M / day</div>
                        </div>
                    </div>
                    <div className="bg-gray-900/30 backdrop-blur-sm p-4 rounded-lg border border-gray-800 flex items-center">
                        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-green-500/10 mr-3">
                            <span className="text-green-400 text-xl">↗</span>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">WEEKLY GROWTH</div>
                            <div className="text-white font-bold">+8.7%</div>
                        </div>
                    </div>
                    <div className="bg-gray-900/30 backdrop-blur-sm p-4 rounded-lg border border-gray-800 flex items-center">
                        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-purple-500/10 mr-3">
                            <span className="text-purple-400 text-xl">👥</span>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">ACTIVE USERS</div>
                            <div className="text-white font-bold">16,482</div>
                        </div>
                    </div>
                    <div className="bg-gray-900/30 backdrop-blur-sm p-4 rounded-lg border border-gray-800 flex items-center">
                        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-cyan-500/10 mr-3">
                            <span className="text-cyan-400 text-xl">🔄</span>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">AVERAGE APY</div>
                            <div className="text-white font-bold">5.23%</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
};

const Footer = () => (
    <footer className="pt-16 pb-8 bg-black border-t border-gray-800">
        <div className="container mx-auto px-6">
            {/* Newsletter Subscription - Typeform Integration */}
            <div className="max-w-4xl mx-auto mb-16 relative group">
                {/* Background with gradient animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-blue-900/30 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-10"></div>
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
                </div>

                {/* Border with animated glow effect */}
                <div className="absolute inset-0 rounded-xl border border-blue-500/20 group-hover:border-blue-500/40 transition-colors duration-500"></div>

                {/* Content */}
                <div className="relative p-8 backdrop-blur-sm flex flex-col items-center text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Stay Updated</h2>
                    <p className="text-gray-300 max-w-2xl mb-8 text-lg">
                        Subscribe to receive updates about USDH development, new features, and ecosystem news.
                    </p>

                    {/* Typeform Button */}
                    <a
                        href="https://form.typeform.com/to/s59e1qpO"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 rounded-full text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                    >
                        <span className="relative z-10">Join Our Community</span>

                        {/* Button effects */}
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-fuchsia-600/80 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-purple-400 opacity-70 animate-pulse"></span>
                    </a>

                    {/* Optional tag line */}
                    <p className="mt-4 text-gray-400 text-sm">No spam, only important updates and announcements</p>
                </div>

                {/* Decorative dots */}
                <div className="absolute top-6 left-6 grid grid-cols-3 gap-1">
                    <div className="w-1 h-1 rounded-full bg-blue-400/50"></div>
                    <div className="w-1 h-1 rounded-full bg-blue-400/30"></div>
                    <div className="w-1 h-1 rounded-full bg-blue-400/10"></div>
                </div>
                <div className="absolute bottom-6 right-6 grid grid-cols-3 gap-1">
                    <div className="w-1 h-1 rounded-full bg-blue-400/10"></div>
                    <div className="w-1 h-1 rounded-full bg-blue-400/30"></div>
                    <div className="w-1 h-1 rounded-full bg-blue-400/50"></div>
                </div>
            </div>

            {/* Enhanced Explore Ecosystem Button */}
            <div className="flex justify-center my-12">
                <a
                    href="#ecosystem"
                    className="group relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 rounded-full text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glow overflow-hidden"
                >
                    <span className="relative z-10">Explore Complete Ecosystem</span>

                    {/* Enhanced button effects */}
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-fuchsia-600/80 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

                    {/* Arrow icon with animation */}
                    <span className="ml-3 bg-purple-400/30 rounded-full w-10 h-10 flex items-center justify-center relative z-10 group-hover:bg-purple-400/50 transition-colors">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </span>
                </a>
            </div>

            {/* Bottom footer with improved buttons */}
            <div className="pt-8 mt-8 border-t border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="mb-4 md:mb-0">
                        <p className="text-gray-500 text-sm">© 2025 USDH. All rights reserved.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        <a
                            href="#"
                            className="text-white bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2 rounded-lg text-sm transition-colors duration-300 border border-gray-700 hover:border-purple-500/50 hover:shadow-sm hover:shadow-purple-500/30 flex items-center"
                        >
                            <span className="mr-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="text-white bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2 rounded-lg text-sm transition-colors duration-300 border border-gray-700 hover:border-purple-500/50 hover:shadow-sm hover:shadow-purple-500/30 flex items-center"
                        >
                            <span className="mr-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 8.5V16.5C20 17.3284 19.3284 18 18.5 18H5.5C4.67157 18 4 17.3284 4 16.5V8.5M20 8.5C20 7.67157 19.3284 7 18.5 7H5.5C4.67157 7 4 7.67157 4 8.5M20 8.5V8C20 6.89543 19.1046 6 18 6H6C4.89543 6 4 6.89543 4 8V8.5M12 12H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </span>
                            Terms of Service
                        </a>
                        <a
                            href="#"
                            className="text-white bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2 rounded-lg text-sm transition-colors duration-300 border border-gray-700 hover:border-purple-500/50 hover:shadow-sm hover:shadow-purple-500/30 flex items-center"
                        >
                            <span className="mr-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 12L11 14L15 10M12 3L4 7.8V9.5C4 13.5287 5.55625 17.362 8.41742 20.2232C9.80617 21.612 11.8774 21.612 13.2661 20.2232C16.1273 17.362 17.6835 13.5287 17.6835 9.5V7.8L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            Trademark Policy
                        </a>
                        <a
                            href="#"
                            className="text-white bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2 rounded-lg text-sm transition-colors duration-300 border border-gray-700 hover:border-purple-500/50 hover:shadow-sm hover:shadow-purple-500/30 flex items-center"
                        >
                            <span className="mr-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            Security
                        </a>
                    </div>
                </div>

                {/* Social links with enhanced styling */}
                <div className="flex justify-center space-x-4">
                    <a href="#" className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800/50 hover:border hover:border-purple-500/30 group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                    </a>
                    <a href="#" className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800/50 hover:border hover:border-purple-500/30 group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                    </a>
                    <a href="#" className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800/50 hover:border hover:border-purple-500/30 group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                        </svg>
                    </a>
                    <a href="#" className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800/50 hover:border hover:border-purple-500/30 group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </footer>
);

const AboutSection = () => (
    <section id="about" className="py-20 bg-gradient-to-b from-black to-blue-950/20">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">ABOUT USDH</h2>

            <div className="max-w-4xl mx-auto mb-16">
                <p className="text-xl text-gray-300 mb-6">
                    USDH (Hashrate-backed USD) is an innovative stablecoin built on the Sui blockchain
                    that leverages distributed computing resources as its primary collateral.
                </p>
                <p className="text-xl text-gray-300">
                    By connecting the growing market of cloud computing with decentralized finance,
                    USDH creates a new class of asset-backed stablecoins with intrinsic utility and value.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-900/30 backdrop-blur-sm p-8 rounded-lg hover:bg-gray-900/50 transition-all">
                    <h3 className="text-2xl font-bold mb-4 text-center text-blue-400">PRICE STABILITY</h3>
                    <p className="text-gray-300 text-center">
                        Advanced pegging algorithms and multi-asset reserve management
                    </p>
                </div>

                <div className="bg-gray-900/30 backdrop-blur-sm p-8 rounded-lg hover:bg-gray-900/50 transition-all">
                    <h3 className="text-2xl font-bold mb-4 text-center text-cyan-400">REAL COLLATERAL</h3>
                    <p className="text-gray-300 text-center">
                        Backed by verifiable computing resources with real-world utility
                    </p>
                </div>

                <div className="bg-gray-900/30 backdrop-blur-sm p-8 rounded-lg hover:bg-gray-900/50 transition-all">
                    <h3 className="text-2xl font-bold mb-4 text-center text-purple-400">TRANSPARENCY</h3>
                    <p className="text-gray-300 text-center">
                        Zero-knowledge proofs for privacy with verifiability
                    </p>
                </div>
            </div>
        </div>
    </section>
);

export default function MainPage() {
    // For scroll animation
    const [visible, setVisible] = useState(false);
    const sectionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setVisible(true);

        if (typeof window !== 'undefined') {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('appear');
                        }
                    });
                },
                {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0.1,
                }
            );

            const sections = document.querySelectorAll('.fade-in-section');
            sections.forEach((section) => {
                observer.observe(section);
            });

            return () => {
                sections.forEach((section) => {
                    observer.unobserve(section);
                });
            };
        }
    }, []);

    return (
        <main className={`min-h-screen transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`} ref={sectionsRef}>
            {/* Digital Rain Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <DigitalRain />
            </div>

            <Navbar />

            <HeroSection />

            <div className="fade-in-section">
                <MetricsSection />
            </div>

            <div className="fade-in-section">
                <AboutSection />
            </div>

            <div className="fade-in-section">
                <FeaturesShowcase />
            </div>

            <Footer />
        </main>
    );
} 