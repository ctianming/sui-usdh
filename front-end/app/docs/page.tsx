"use client";

export default function Docs() {
    return (
        <div className="py-8">
            <h1 className="text-3xl font-bold mb-8">功能演示</h1>

            <div className="bg-black/30 border border-gray-800 rounded-lg p-5 mb-8">
                <p className="flex items-center text-yellow-300 mb-4">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    <span>注意：以下功能演示为黑客松阶段的概念展示，尚未实现完整功能。</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-black/40 border border-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">USDH铸造</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">抵押资产</label>
                            <select className="w-full bg-black/50 border border-gray-700 rounded p-2 text-gray-300">
                                <option>ETH</option>
                                <option>BTC</option>
                                <option>SOL</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">抵押数量</label>
                            <input type="number" placeholder="0.00" className="w-full bg-black/50 border border-gray-700 rounded p-2 text-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">抵押率</label>
                            <div className="flex space-x-2">
                                <button className="flex-1 bg-black/70 border border-gray-700 rounded p-2 text-gray-300">150%</button>
                                <button className="flex-1 bg-black/70 border border-gray-700 rounded p-2 text-gray-300">200%</button>
                                <button className="flex-1 bg-black/70 border border-gray-700 rounded p-2 text-gray-300">250%</button>
                            </div>
                        </div>
                        <div className="border-t border-gray-700 pt-4 mt-4">
                            <div className="flex justify-between">
                                <span className="text-gray-400">将铸造:</span>
                                <span className="font-semibold">0.00 USDH</span>
                            </div>
                        </div>
                        <button disabled className="w-full mt-4 bg-blue-900/50 text-blue-300 border border-blue-900/50 py-2 rounded opacity-70 cursor-not-allowed">
                            铸造 USDH (即将推出)
                        </button>
                    </div>
                </div>

                <div className="bg-black/40 border border-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">资金单元</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">单元名称</label>
                            <input type="text" placeholder="输入单元名称" className="w-full bg-black/50 border border-gray-700 rounded p-2 text-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">金额</label>
                            <input type="number" placeholder="0.00" className="w-full bg-black/50 border border-gray-700 rounded p-2 text-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">流向控制</label>
                            <select className="w-full bg-black/50 border border-gray-700 rounded p-2 text-gray-300">
                                <option>自由流动</option>
                                <option>限定用途</option>
                                <option>多签授权</option>
                            </select>
                        </div>
                        <div className="flex items-center mt-2">
                            <input type="checkbox" id="privacy" className="mr-2" />
                            <label htmlFor="privacy" className="text-sm text-gray-300">启用隐私保护</label>
                        </div>
                        <button disabled className="w-full mt-4 bg-blue-900/50 text-blue-300 border border-blue-900/50 py-2 rounded opacity-70 cursor-not-allowed">
                            创建资金单元 (即将推出)
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">算力资源市场</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-black/60">
                                <th className="border border-gray-700 p-3 text-left text-sm">资源ID</th>
                                <th className="border border-gray-700 p-3 text-left text-sm">类型</th>
                                <th className="border border-gray-700 p-3 text-left text-sm">规格</th>
                                <th className="border border-gray-700 p-3 text-left text-sm">性能评分</th>
                                <th className="border border-gray-700 p-3 text-left text-sm">价格/小时</th>
                                <th className="border border-gray-700 p-3 text-left text-sm">可用性</th>
                                <th className="border border-gray-700 p-3 text-left text-sm">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-black/40 hover:bg-black/60">
                                <td className="border border-gray-700 p-3 text-sm">HR-1024</td>
                                <td className="border border-gray-700 p-3 text-sm">GPU</td>
                                <td className="border border-gray-700 p-3 text-sm">NVIDIA A100</td>
                                <td className="border border-gray-700 p-3 text-sm">98/100</td>
                                <td className="border border-gray-700 p-3 text-sm">2.5 USDH</td>
                                <td className="border border-gray-700 p-3 text-sm text-green-400">即时</td>
                                <td className="border border-gray-700 p-3 text-sm">
                                    <button disabled className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded text-xs opacity-70 cursor-not-allowed">租用</button>
                                </td>
                            </tr>
                            <tr className="bg-black/30 hover:bg-black/60">
                                <td className="border border-gray-700 p-3 text-sm">HR-2048</td>
                                <td className="border border-gray-700 p-3 text-sm">GPU</td>
                                <td className="border border-gray-700 p-3 text-sm">RTX4090</td>
                                <td className="border border-gray-700 p-3 text-sm">92/100</td>
                                <td className="border border-gray-700 p-3 text-sm">1.2 USDH</td>
                                <td className="border border-gray-700 p-3 text-sm text-green-400">即时</td>
                                <td className="border border-gray-700 p-3 text-sm">
                                    <button disabled className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded text-xs opacity-70 cursor-not-allowed">租用</button>
                                </td>
                            </tr>
                            <tr className="bg-black/40 hover:bg-black/60">
                                <td className="border border-gray-700 p-3 text-sm">HR-3072</td>
                                <td className="border border-gray-700 p-3 text-sm">CPU</td>
                                <td className="border border-gray-700 p-3 text-sm">64核 AMD</td>
                                <td className="border border-gray-700 p-3 text-sm">95/100</td>
                                <td className="border border-gray-700 p-3 text-sm">0.8 USDH</td>
                                <td className="border border-gray-700 p-3 text-sm text-yellow-400">2小时后</td>
                                <td className="border border-gray-700 p-3 text-sm">
                                    <button disabled className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded text-xs opacity-70 cursor-not-allowed">预订</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-center text-gray-400 mt-12 mb-8">
                更多功能正在开发中，敬请期待。
            </div>
        </div>
    );
} 