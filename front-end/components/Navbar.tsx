"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from './ConnectButton';
import { HomeIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState('');

    const isDashboardPage = pathname === '/dashboard';
    const isMainPage = pathname === '/main';

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setScrolled(offset > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle intersection observer for sections (only on main page)
    useEffect(() => {
        if (isMainPage) {
            const sections = document.querySelectorAll('section[id]');
            const observerOptions = { root: null, rootMargin: '0px', threshold: 0.7 };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveLink(entry.target.id);
                });
            }, observerOptions);
            sections.forEach(section => observer.observe(section));
            return () => sections.forEach(section => observer.unobserve(section));
        }
    }, [isMainPage]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinkClasses = (sectionId: string) =>
        `nav-link text-sm font-medium transition-all duration-200 relative ${activeLink === sectionId
            ? 'text-white'
            : 'text-gray-300 hover:text-white'}`;

    const navLinkSpanClasses = (sectionId: string) =>
        `absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500/70 to-transparent transition-all duration-300 ${activeLink === sectionId ? 'w-full' : 'w-0'}`;

    const mobileNavLinkClasses = (sectionId: string) =>
        `block px-3 py-2.5 text-base font-medium rounded-md transition-colors duration-200 ${activeLink === sectionId
            ? 'text-white bg-blue-500/10'
            : 'text-gray-300 hover:text-white hover:bg-blue-500/10'}`;

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 
            ${scrolled || isDashboardPage
                ? 'glass-dark shadow-lg py-2 border-b border-[rgba(var(--color-primary),0.15)]'
                : isMainPage ? 'bg-transparent py-4' : 'glass-dark shadow-lg py-2 border-b border-[rgba(var(--color-primary),0.15)]' // Ensure other pages also have a bg if not scrolled
            }`}>
            {(scrolled || isDashboardPage || !isMainPage) && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Link href="/main" className="group relative font-blanka text-gradient-hero text-2xl tracking-wider">
                                USDH
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500/70 to-transparent transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        </div>
                        {isMainPage && (
                            <div className="hidden md:block ml-12">
                                <div className="flex items-center space-x-10">
                                    <a href="#about" className={navLinkClasses('about')}>
                                        About
                                        <span className={navLinkSpanClasses('about')}></span>
                                    </a>
                                    <a href="#features" className={navLinkClasses('features')}>
                                        Features
                                        <span className={navLinkSpanClasses('features')}></span>
                                    </a>
                                    <a href="#roadmap" className={navLinkClasses('roadmap')}>
                                        Roadmap
                                        <span className={navLinkSpanClasses('roadmap')}></span>
                                    </a>
                                    <div className="relative group">
                                        <button className="nav-link text-gray-300 hover:text-white text-sm font-medium flex items-center transition-all duration-200 relative">
                                            Resources
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500/70 to-transparent transition-all duration-300 group-hover:w-full"></span>
                                        </button>
                                        <div className="absolute left-0 mt-2 w-48 glass-dark rounded-md shadow-lg py-2 border border-blue-500/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform -translate-y-2 group-hover:translate-y-0">
                                            <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-blue-500/10 transition-colors duration-200">
                                                Documentation
                                            </a>
                                            <a href="https://clearskys-organization-1.gitbook.io/usdh/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-blue-500/10 transition-colors duration-200">
                                                Whitepaper
                                            </a>
                                            <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-blue-500/10 transition-colors duration-200">
                                                GitHub
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {isDashboardPage && (
                            <Link
                                href="/main"
                                className="hidden md:inline-flex items-center text-sm text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded-md transition-colors"
                                title="返回主页"
                            >
                                <ArrowUturnLeftIcon className="w-5 h-5" />
                            </Link>
                        )}
                        {isMainPage && (
                            <a
                                href="#"
                                className="hidden md:inline-flex text-gray-300 hover:text-white text-sm font-medium transition-all duration-200 relative group"
                            >
                                Community
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500/70 to-transparent transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        )}
                        {!isMainPage && (
                            <div className="relative z-[101]">
                                <ConnectButton />
                            </div>
                        )}
                    </div>

                    <div className="-mr-2 flex md:hidden"> {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-500/10 focus:outline-none transition-colors duration-300"
                            aria-expanded={isMenuOpen ? 'true' : 'false'}
                        >
                            <span className="sr-only">Open menu</span>
                            <div className="relative w-6 h-6">
                                <span className={`absolute block w-5 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-1.5' : 'translate-y-0'}`} style={{ top: '25%' }}></span>
                                <span className={`absolute block w-5 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} style={{ top: '45%' }}></span>
                                <span className={`absolute block w-5 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-0'}`} style={{ top: '65%' }}></span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={`md:hidden absolute w-full transform transition-all duration-300 ease-in-out ${isMenuOpen
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-4 pointer-events-none'
                    }`}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-dark border-b border-blue-500/10 shadow-lg">
                    {isDashboardPage && (
                        <Link href="/main" className={`${mobileNavLinkClasses('main')} flex items-center`}>
                            <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
                            返回主页
                        </Link>
                    )}
                    {isMainPage && (
                        <>
                            <a href="#about" className={mobileNavLinkClasses('about')}>
                                About
                            </a>
                            <a href="#features" className={mobileNavLinkClasses('features')}>
                                Features
                            </a>
                            <a href="#roadmap" className={mobileNavLinkClasses('roadmap')}>
                                Roadmap
                            </a>
                            <div className="px-3 py-2">
                                <button
                                    className="flex w-full justify-between text-base font-medium text-gray-300 hover:text-white transition-colors duration-200"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const submenu = document.getElementById('mobile-resources-menu');
                                        if (submenu) submenu.classList.toggle('hidden');
                                        const arrow = e.currentTarget.querySelector('svg');
                                        if (arrow) arrow.classList.toggle('rotate-180');
                                    }}
                                >
                                    Resources
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div id="mobile-resources-menu" className="hidden pl-4 pt-2 space-y-1 transition-all duration-300">
                                    <a href="#" className="block py-2 text-sm text-gray-400 hover:text-white transition-colors duration-200">
                                        Documentation
                                    </a>
                                    <a href="https://clearskys-organization-1.gitbook.io/usdh/" target="_blank" rel="noopener noreferrer" className="block py-2 text-sm text-gray-400 hover:text-white transition-colors duration-200">
                                        Whitepaper
                                    </a>
                                    <a href="#" className="block py-2 text-sm text-gray-400 hover:text-white transition-colors duration-200">
                                        GitHub
                                    </a>
                                </div>
                            </div>
                            <a href="#" className={`${mobileNavLinkClasses('community')} `}>
                                Community
                            </a>
                        </>
                    )}
                    {!isMainPage && (
                        <div className="mt-4 px-3">
                            <div className="relative z-[101]">
                                <ConnectButton />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
} 