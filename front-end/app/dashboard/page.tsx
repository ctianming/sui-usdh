"use client";

import Link from "next/link";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
    return (
        <div className="py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">USDH项目仪表盘</h1>
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-gray-300 hover:text-white"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    返回概念页
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link href="/about" className="block">
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6 h-full hover:border-gray-600 transition-all">
                        <h2 className="text-xl font-semibold mb-4">项目介绍</h2>
                        <p className="text-gray-400 mb-6">了解USDH的理念、架构和技术创新</p>
                        <div className="flex justify-end">
                            <span className="inline-flex items-center text-blue-400 hover:text-blue-300">
                                查看详情 <ArrowRightIcon className="w-4 h-4 ml-1" />
                            </span>
                        </div>
                    </div>
                </Link>

                <Link href="/docs" className="block">
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6 h-full hover:border-gray-600 transition-all">
                        <h2 className="text-xl font-semibold mb-4">功能演示</h2>
                        <p className="text-gray-400 mb-6">体验USDH的核心功能和交互方式</p>
                        <div className="flex justify-end">
                            <span className="inline-flex items-center text-blue-400 hover:text-blue-300">
                                查看详情 <ArrowRightIcon className="w-4 h-4 ml-1" />
                            </span>
                        </div>
                    </div>
                </Link>

                <Link href="/roadmap" className="block">
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6 h-full hover:border-gray-600 transition-all">
                        <h2 className="text-xl font-semibold mb-4">路线图</h2>
                        <p className="text-gray-400 mb-6">查看项目开发计划和未来愿景</p>
                        <div className="flex justify-end">
                            <span className="inline-flex items-center text-blue-400 hover:text-blue-300">
                                查看详情 <ArrowRightIcon className="w-4 h-4 ml-1" />
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="bg-black/40 border border-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">黑客松演示版本</h2>
                <p className="text-gray-300 mb-4">
                    本项目正在参与黑客松竞赛，目前展示的是概念验证版本。
                    完整功能将在后续开发中逐步实现。
                </p>
                <div className="flex flex-wrap gap-4 mt-6">
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-700 
                                rounded-md text-sm text-white bg-black/70 hover:bg-black transition-all"
                    >
                        查看源代码
                    </a>
                    <a
                        href="#"
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-700 
                                rounded-md text-sm text-white bg-black/70 hover:bg-black transition-all"
                    >
                        预约演示
                    </a>
                </div>
            </div>
        </div>
    );
} 