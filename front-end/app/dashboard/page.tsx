"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRightIcon, ArrowLeftIcon, ChartBarIcon, CubeIcon, RectangleStackIcon, BoltIcon, DocumentTextIcon, UsersIcon } from "@heroicons/react/24/outline";
import { CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid";
import SuiInteraction from "@/components/SuiInteraction";
// import { ConnectButton } from "@/components/ConnectButton"; // ConnectButton 由 Navbar 管理
import DashboardChart from "@/components/DashboardChart";

// 统计数据卡片组件 - 样式更新
const StatsCard = ({ icon: Icon, title, value, change, changeType, gradFrom, gradTo }) => (
    <div className={`relative rounded-xl overflow-hidden p-px transition-all duration-300 ease-in-out hover:shadow-blue-500/30 hover:shadow-xl 
                    bg-gradient-to-br ${gradFrom ? gradFrom : 'from-gray-800/80'} ${gradTo ? gradTo : 'to-gray-900/90'} 
                    border border-transparent hover:border-blue-500/30 group`}>
        {/* 内发光效果 */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
                background: `radial-gradient(circle at center, rgba(56, 152, 255, 0.15) 0%, transparent 70%)`,
            }}></div>

        <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-[11px] h-full px-6 py-5">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-blue-200/70 font-medium">{title}</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
                    {change && (
                        <div className="flex items-center mt-1.5">
                            {changeType === 'increase' ? (
                                <ArrowTrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
                            ) : (
                                <ArrowTrendingDownIcon className="h-4 w-4 text-red-400 mr-1" />
                            )}
                            <p className={`text-xs font-medium ${changeType === 'increase' ? 'text-green-300' : 'text-red-300'}`}>
                                {change}
                            </p>
                        </div>
                    )}
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/30 shadow-md">
                    <Icon className="h-6 w-6 text-blue-300" />
                </div>
            </div>
        </div>
    </div>
);

// 活动列表项组件 (样式稍作调整以适应新容器)
const ActivityItem = ({ type, user, amount, time, status }) => {
    const getStatusColor = () => {
        switch (status) {
            case '成功': return 'text-green-400';
            case '处理中': return 'text-yellow-400';
            case '失败': return 'text-red-400';
            default: return 'text-gray-500';
        }
    };

    const getTypeIcon = () => {
        let iconClass = "h-5 w-5 ";
        switch (type) {
            case '抵押': return <CubeIcon className={iconClass + "text-blue-400"} />;
            case '提供算力': return <BoltIcon className={iconClass + "text-purple-400"} />;
            case '交易': return <CurrencyDollarIcon className={iconClass + "text-teal-400"} />;
            case '治理': return <UsersIcon className={iconClass + "text-orange-400"} />;
            default: return <DocumentTextIcon className={iconClass + "text-gray-500"} />;
        }
    };

    return (
        <div className="flex items-center justify-between py-3.5 px-4 hover:bg-gray-800/40 transition-colors duration-150 rounded-md">
            <div className="flex items-center">
                <div className="p-2.5 rounded-lg bg-gray-700/50 border border-gray-600/70 shadow-sm">{getTypeIcon()}</div>
                <div className="ml-3.5">
                    <p className="text-sm font-medium text-gray-100">{type}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[100px] sm:max-w-[120px]" title={user}>{user}</p>
                </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
                <p className="text-sm font-medium text-gray-100">{amount}</p>
                <div className="flex items-center justify-end mt-0.5 space-x-1.5">
                    <p className="text-xs text-gray-500">{time}</p>
                    <span className={`text-xs font-semibold ${getStatusColor()}`}>• {status}</span>
                </div>
            </div>
        </div>
    );
};

// 可视化指标卡片 - 样式更新
const MetricCard = ({ title, value, description, color, percent }) => (
    <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/80 p-5 rounded-lg border border-gray-700/60 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:border-gray-600/80">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-200/80">{title}</h3>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${color ? color : 'bg-gray-700 text-gray-200'} shadow-sm`}>
                {value}
            </span>
        </div>
        <p className="text-xs text-gray-400 mb-3 leading-relaxed h-10 line-clamp-2">{description}</p>
        <div className="w-full bg-gray-700/50 h-2.5 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${color ? color.replace('text-', 'bg-').replace('bg-opacity-80', '') : 'bg-blue-500'}`}
                style={{ width: `${percent}%` }}
            ></div>
        </div>
    </div>
);

export default function Dashboard() {
    const [activeSection, setActiveSection] = useState('overview');
    const [mounted, setMounted] = useState(false);

    // 添加挂载状态以防止hydration错误
    useEffect(() => {
        setMounted(true);
    }, []);

    // 为图表准备的日期标签
    const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Shorter labels for charts
    const monthLabels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);

    if (!mounted) return null;

    const navButtonClasses = (sectionName: string) =>
        `px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm hover:shadow-md ` +
        `${activeSection === sectionName
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
            : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white'}`;

    // Common card container class for consistent styling
    const cardContainerBase = "bg-gray-900/70 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-xl overflow-hidden transition-all duration-300 hover:border-gray-600/80 hover:shadow-blue-500/20";

    return (
        <div className="min-h-screen pt-24 pb-12 relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-black">
            {/* 精致的背景网格 */}
            <div className="absolute inset-0 z-0 opacity-5"
                style={{
                    backgroundImage: `radial-gradient(circle at 25px 25px, rgba(56, 152, 255, 0.3) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(128, 0, 128, 0.2) 2%, transparent 0%)`,
                    backgroundSize: `100px 100px`,
                }}></div>

            {/* 背景辉光 */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl opacity-60 animate-pulse-slow-blue"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-700/20 rounded-full blur-3xl opacity-50 animate-pulse-slow-purple animation-delay-2000"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="mb-10 pb-6 border-b border-gray-700/50">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-transparent bg-clip-text">
                        USDH 仪表盘
                    </h1>
                    <p className="text-gray-400 mt-2 text-base">探索和管理您的USDH资产、算力贡献和系统交互。</p>
                </div>

                {/* 快捷导航 - 新样式 */}
                <div className="mb-10">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-2 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-md">
                        {[
                            { id: 'overview', label: '总览' },
                            { id: 'assets', label: '我的资产' },
                            { id: 'mining', label: '算力挖矿' },
                            { id: 'market', label: '市场' },
                            { id: 'governance', label: '治理' }
                        ].map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={navButtonClasses(section.id)}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeSection === 'overview' && (
                    <div className="space-y-8">
                        {/* 统计数据卡片区 - 使用更新的 StatsCard */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatsCard
                                icon={CurrencyDollarIcon}
                                title="总供应量 (USDH)"
                                value="148,243"
                                change="+5.2% wk"
                                changeType="increase"
                                gradFrom="from-blue-700/60"
                                gradTo="to-indigo-800/70"
                            />
                            <StatsCard
                                icon={RectangleStackIcon}
                                title="当前抵押率 (%)"
                                value="172"
                                change="+2.5% wk"
                                changeType="increase"
                                gradFrom="from-green-700/60"
                                gradTo="to-teal-800/70"
                            />
                            <StatsCard
                                icon={BoltIcon}
                                title="活跃算力节点"
                                value="2,437"
                                change="+23 today"
                                changeType="increase"
                                gradFrom="from-purple-700/60"
                                gradTo="to-violet-800/70"
                            />
                            <StatsCard
                                icon={ChartBarIcon}
                                title="系统收益率 (%)"
                                value="8.64"
                                change="-0.32% wk"
                                changeType="decrease"
                                gradFrom="from-red-700/60"
                                gradTo="to-orange-800/70"
                            />
                        </div>

                        {/* 图表展示区 - 更新容器样式 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={cardContainerBase}>
                                <DashboardChart
                                    title="USDH 供应量趋势 (k)"
                                    labels={weekDayLabels}
                                    dataLabel="USDH供应量"
                                    color="rgb(59, 130, 246)" // blue-500
                                    secondaryColor="rgba(59, 130, 246, 0.1)"
                                />
                            </div>
                            <div className={cardContainerBase}>
                                <DashboardChart
                                    title="系统抵押率变化 (%)"
                                    labels={weekDayLabels}
                                    dataLabel="抵押率 (%)"
                                    color="rgb(16, 185, 129)" // emerald-500
                                    secondaryColor="rgba(16, 185, 129, 0.1)"
                                />
                            </div>
                        </div>

                        {/* Sui钱包交互区 - 更新容器样式 */}
                        <div className={cardContainerBase}>
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4 text-white">Sui钱包交互</h2>
                                <SuiInteraction />
                            </div>
                        </div>

                        {/* 指标和活动区 - 更新容器样式 */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className={`lg:col-span-2 ${cardContainerBase}`}>
                                <div className="p-5 border-b border-gray-700/60">
                                    <h2 className="text-lg font-semibold text-white">关键指标</h2>
                                </div>
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* MetricCard instances would go here, they need styling update too */}
                                    {/* Example for one, assuming MetricCard is updated similarly to StatsCard */}
                                    <MetricCard
                                        title="稳定币储备利用率 (%)"
                                        value="72"
                                        description="当前储备池中已激活使用的稳定币比例"
                                        color="bg-blue-500/80"
                                        percent={72}
                                    />
                                    <MetricCard
                                        title="算力资源利用率 (%)"
                                        value="86"
                                        description="网络中注册算力资源的平均使用率"
                                        color="bg-purple-500/80"
                                        percent={86}
                                    />
                                    <MetricCard
                                        title="储备健康指数 (%)"
                                        value="93"
                                        description="系统储备与流通USDH的健康比率指标"
                                        color="bg-green-500/80"
                                        percent={93}
                                    />
                                    <MetricCard
                                        title="节点地理分布多样性 (%)"
                                        value="78"
                                        description="系统中节点地理分布的多样化程度"
                                        color="bg-orange-500/80"
                                        percent={78}
                                    />
                                </div>
                            </div>

                            <div className={cardContainerBase}>
                                <div className="px-5 py-4 border-b border-gray-700/60 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-white">最近活动</h2>
                                    <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                        查看全部
                                    </button>
                                </div>
                                <div className="p-1 divide-y divide-gray-800/60">
                                    {/* ActivityItem instances would go here, their container has consistent padding now */}
                                    <ActivityItem
                                        type="抵押"
                                        user="0x7a3b...5d9f"
                                        amount="5,000 USDT"
                                        time="10分钟前"
                                        status="成功"
                                    />
                                    <ActivityItem
                                        type="提供算力"
                                        user="0x2c4d...8e1a"
                                        amount="2 GPU 节点"
                                        time="32分钟前"
                                        status="处理中"
                                    />
                                    <ActivityItem
                                        type="交易"
                                        user="0x9f3c...1d45"
                                        amount="1,200 USDH"
                                        time="1小时前"
                                        status="成功"
                                    />
                                    <ActivityItem
                                        type="治理"
                                        user="0x3a5f...7c2d"
                                        amount="投票 #37"
                                        time="3小时前"
                                        status="成功"
                                    />
                                    <ActivityItem
                                        type="提供算力"
                                        user="0x6b2e...4a9c"
                                        amount="1 TPU 节点"
                                        time="5小时前"
                                        status="失败"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 快速操作区 - 更新容器样式 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1: 抵押与流动性 */}
                            <div className={`${cardContainerBase} group/actioncard flex flex-col`}>
                                <div className="p-6 flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-white flex items-center">
                                            <span className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 mr-3 shadow-sm">
                                                <CurrencyDollarIcon className="h-6 w-6 text-blue-300" />
                                            </span>
                                            抵押与流动性
                                        </h3>
                                        <ArrowRightIcon className="w-5 h-5 text-gray-500 group-hover/actioncard:text-blue-400 transition-all duration-300 transform group-hover/actioncard:translate-x-1" />
                                    </div>
                                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                                        通过抵押USDT/USDC获取USDH稳定币，或通过算力资源支持系统获得奖励。
                                    </p>
                                </div>
                                <div className="p-6 pt-0 space-y-3">
                                    <Link
                                        href="#"
                                        className="block bg-gradient-to-r from-blue-500/80 to-indigo-600/80 hover:from-blue-500 hover:to-indigo-600 border border-transparent hover:border-blue-400/50 p-3.5 rounded-lg transition-all duration-300 flex justify-between items-center shadow-md hover:shadow-lg text-sm transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-60"
                                    >
                                        <span className="font-medium text-white">抵押资产</span>
                                        <ArrowRightIcon className="w-4 h-4 text-blue-100" />
                                    </Link>
                                    <Link
                                        href="#"
                                        className="block bg-gray-700/50 hover:bg-gray-600/70 border border-gray-600/60 hover:border-gray-500/80 p-3.5 rounded-lg transition-all duration-300 flex justify-between items-center shadow-sm hover:shadow-md text-sm transform hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-gray-400"
                                    >
                                        <span className="text-gray-200 group-hover/actioncard:text-white transition-colors">领取奖励</span>
                                        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover/actioncard:text-gray-200 transition-colors" />
                                    </Link>
                                    <Link
                                        href="#"
                                        className="block bg-gray-700/50 hover:bg-gray-600/70 border border-gray-600/60 hover:border-gray-500/80 p-3.5 rounded-lg transition-all duration-300 flex justify-between items-center shadow-sm hover:shadow-md text-sm transform hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-gray-400"
                                    >
                                        <span className="text-gray-200 group-hover/actioncard:text-white transition-colors">赎回USDH</span>
                                        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover/actioncard:text-gray-200 transition-colors" />
                                    </Link>
                                </div>
                            </div>

                            {/* Card 2: 算力资源 */}
                            <div className={`${cardContainerBase} group/actioncard flex flex-col`}>
                                <div className="p-6 flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-white flex items-center">
                                            <span className="p-2 rounded-lg bg-purple-600/20 border border-purple-500/30 mr-3 shadow-sm">
                                                <BoltIcon className="h-6 w-6 text-purple-300" />
                                            </span>
                                            算力资源
                                        </h3>
                                        <ArrowRightIcon className="w-5 h-5 text-gray-500 group-hover/actioncard:text-purple-400 transition-all duration-300 transform group-hover/actioncard:translate-x-1" />
                                    </div>
                                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                                        注册并提供您的闲置算力资源，参与去中心化算力网络并获取持续收益。
                                    </p>
                                </div>
                                <div className="p-6 pt-0 space-y-3">
                                    <Link
                                        href="#"
                                        className="block bg-gradient-to-r from-purple-500/80 to-violet-600/80 hover:from-purple-500 hover:to-violet-600 border border-transparent hover:border-purple-400/50 p-3.5 rounded-lg transition-all duration-300 flex justify-between items-center shadow-md hover:shadow-lg text-sm transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-60"
                                    >
                                        <span className="font-medium text-white">提供算力</span>
                                        <ArrowRightIcon className="w-4 h-4 text-purple-100" />
                                    </Link>
                                    <Link
                                        href="#"
                                        className="block bg-gray-700/50 hover:bg-gray-600/70 border border-gray-600/60 hover:border-gray-500/80 p-3.5 rounded-lg transition-all duration-300 flex justify-between items-center shadow-sm hover:shadow-md text-sm transform hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-gray-400"
                                    >
                                        <span className="text-gray-200 group-hover/actioncard:text-white transition-colors">我的算力资源</span>
                                        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover/actioncard:text-gray-200 transition-colors" />
                                    </Link>
                                    <Link
                                        href="#"
                                        className="block bg-gray-700/50 hover:bg-gray-600/70 border border-gray-600/60 hover:border-gray-500/80 p-3.5 rounded-lg transition-all duration-300 flex justify-between items-center shadow-sm hover:shadow-md text-sm transform hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-gray-400"
                                    >
                                        <span className="text-gray-200 group-hover/actioncard:text-white transition-colors">性能统计</span>
                                        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover/actioncard:text-gray-200 transition-colors" />
                                    </Link>
                                </div>
                            </div>

                            {/* Card 3: 市场与交易 */}
                            <div className={`${cardContainerBase} group/actioncard flex flex-col`}>
                                <div className="p-6 flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-white flex items-center">
                                            <span className="p-2 rounded-lg bg-green-600/20 border border-green-500/30 mr-3 shadow-sm">
                                                <ChartBarIcon className="h-6 w-6 text-green-300" />
                                            </span>
                                            市场与交易
                                        </h3>
                                        <ArrowRightIcon className="w-5 h-5 text-gray-500 group-hover/actioncard:text-green-400 transition-all duration-300 transform group-hover/actioncard:translate-x-1" />
                                    </div>
                                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                                        在去中心化交易市场中交易USDH、算力资产和衍生品，优化您的投资组合。
                                    </p>
                                </div>
                                <div className="p-6 pt-0 space-y-3">
                                    <Link
                                        href="#"
                                        className="block bg-gradient-to-r from-green-500/80 to-teal-600/80 hover:from-green-500 hover:to-teal-600 border border-transparent hover:border-green-400/50 p-3.5 rounded-lg transition-all duration-300 flex justify-between items-center shadow-md hover:shadow-lg text-sm transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-60"
                                    >
                                        <span className="font-medium text-white">交易市场</span>
                                        <ArrowRightIcon className="w-4 h-4 text-green-100" />
                                    </Link>
                                    <Link
                                        href="#"
                                        className="block bg-gray-700/50 hover:bg-gray-600/70 border border-gray-600/60 hover:border-gray-500/80 p-3.5 rounded-lg transition-all duration-300 flex justify-between items-center shadow-sm hover:shadow-md text-sm transform hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-gray-400"
                                    >
                                        <span className="text-gray-200 group-hover/actioncard:text-white transition-colors">算力期货</span>
                                        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover/actioncard:text-gray-200 transition-colors" />
                                    </Link>
                                    <Link
                                        href="#"
                                        className="block bg-gray-700/50 hover:bg-gray-600/70 border border-gray-600/60 hover:border-gray-500/80 p-3.5 rounded-lg transition-all duration-300 flex justify-between items-center shadow-sm hover:shadow-md text-sm transform hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-gray-400"
                                    >
                                        <span className="text-gray-200 group-hover/actioncard:text-white transition-colors">收益率产品</span>
                                        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover/actioncard:text-gray-200 transition-colors" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(activeSection !== 'overview') && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="bg-gray-900/40 backdrop-blur-lg p-8 rounded-xl border border-gray-800/70 shadow-glow text-center max-w-md">
                            <h3 className="text-xl font-semibold mb-4">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} 模块</h3>
                            <p className="text-gray-400 mb-6">该功能模块正在开发中，敬请期待...</p>
                            <button
                                onClick={() => setActiveSection('overview')}
                                className="px-5 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-100 rounded-md transition-colors"
                            >
                                返回总览
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 