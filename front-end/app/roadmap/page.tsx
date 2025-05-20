"use client";

export default function Roadmap() {
    return (
        <div className="py-8">
            <h1 className="text-3xl font-bold mb-8">项目路线图</h1>

            <div className="max-w-3xl mx-auto">
                <div className="relative border-l-2 border-gray-700 ml-6 pb-8">
                    {/* 阶段一 */}
                    <div className="mb-12 ml-6">
                        <div className="flex items-center">
                            <div className="bg-blue-500 h-4 w-4 rounded-full absolute -left-2"></div>
                            <h2 className="text-xl font-semibold text-blue-400">阶段一：基础构建阶段</h2>
                        </div>
                        <div className="mt-2 ml-8">
                            <p className="text-gray-300 mb-2">2025 Q1-Q2</p>
                            <ul className="list-disc text-gray-300 pl-5 space-y-1">
                                <li>开发支持零知识证明的核心合约系统</li>
                                <li>构建跨平台节点客户端</li>
                                <li>建立初始预言机网络与验证者网络</li>
                            </ul>
                        </div>
                    </div>

                    {/* 阶段二 */}
                    <div className="mb-12 ml-6">
                        <div className="flex items-center">
                            <div className="bg-gray-500 h-4 w-4 rounded-full absolute -left-2"></div>
                            <h2 className="text-xl font-semibold">阶段二：验证网络阶段</h2>
                        </div>
                        <div className="mt-2 ml-8">
                            <p className="text-gray-300 mb-2">2025 Q3-Q4</p>
                            <ul className="list-disc text-gray-300 pl-5 space-y-1">
                                <li>测试网部署并招募早期算力提供者</li>
                                <li>实现基础资金单元功能与零知识审计</li>
                                <li>完成全面安全审计与形式化验证</li>
                            </ul>
                        </div>
                    </div>

                    {/* 阶段三 */}
                    <div className="ml-6">
                        <div className="flex items-center">
                            <div className="bg-gray-500 h-4 w-4 rounded-full absolute -left-2"></div>
                            <h2 className="text-xl font-semibold">阶段三：主网上线阶段</h2>
                        </div>
                        <div className="mt-2 ml-8">
                            <p className="text-gray-300 mb-2">2026 Q1-Q2</p>
                            <ul className="list-disc text-gray-300 pl-5 space-y-1">
                                <li>主网正式上线并开启公开铸造</li>
                                <li>拓展多链支持和跨链算力聚合</li>
                                <li>建立去中心化自治组织DAO</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-12 bg-black/30 border border-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">当前进度</h2>
                    <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: "15%" }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                        <span>0%</span>
                        <span>100%</span>
                    </div>
                    <p className="mt-4 text-gray-300">
                        我们目前处于阶段一的初期阶段，正在开发核心架构和概念验证。
                    </p>
                </div>
            </div>
        </div>
    );
} 