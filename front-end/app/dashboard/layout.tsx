"use client";

import Navbar from "@/components/Navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
            <Navbar />
            <div className="pt-16 px-4 max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    );
} 