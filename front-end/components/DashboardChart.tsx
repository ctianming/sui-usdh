"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    type ChartOptions // 显式导入 ChartOptions 类型
} from 'chart.js';

// 动态导入 Line 组件
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-t-blue-400 border-gray-800/50 animate-spin"></div>
                <p className="mt-3 text-sm text-gray-400">加载图表组件...</p>
            </div>
        </div>
    )
});

// 确保 Chart.js 组件在使用前已注册
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// 假数据生成器
const generateData = (baseValue: number, volatility: number, length: number) => {
    let lastValue = baseValue;
    return Array(length).fill(0).map(() => {
        const change = (Math.random() - 0.5) * volatility;
        lastValue = Math.max(0, lastValue + change);
        return parseFloat(lastValue.toFixed(2));
    });
};

interface DashboardChartProps {
    title: string;
    labels: string[];
    dataLabel: string;
    color: string;
    secondaryColor?: string;
    period?: string;
}

export default function DashboardChart({
    title,
    labels,
    dataLabel,
    color,
    secondaryColor,
    period = '7天'
}: DashboardChartProps) {
    const [chartData, setChartData] = useState<any>({
        labels: [],
        datasets: [
            {
                label: '',
                data: [],
                borderColor: '',
                backgroundColor: '',
                tension: 0.4,
            }
        ]
    });

    const [isLoading, setIsLoading] = useState(true);
    const [chartAvailable, setChartAvailable] = useState(false);
    const [simpleData, setSimpleData] = useState<number[]>([]);

    // 检查 Line 组件是否已加载
    useEffect(() => {
        if (Line) {
            setChartAvailable(true);
        } else {
            // 如果 Line 组件无法加载，则标记为不可用
            setChartAvailable(false);
            console.warn("Chart.js Line component could not be loaded.")
        }
    }, []);

    useEffect(() => {
        // 模拟数据加载
        const timer = setTimeout(() => {
            const data = generateData(
                dataLabel.includes('USDH') ? 150000 :
                    dataLabel.includes('抵押率') ? 170 :
                        dataLabel.includes('节点') ? 2400 :
                            dataLabel.includes('收益') ? 8.5 : 100,

                dataLabel.includes('USDH') ? 5000 :
                    dataLabel.includes('抵押率') ? 3 :
                        dataLabel.includes('节点') ? 50 :
                            dataLabel.includes('收益') ? 0.2 : 5,

                labels.length
            );

            setSimpleData(data);

            const primaryColor = color || 'rgb(56, 152, 255)';
            const secondaryColorValue = secondaryColor || primaryColor.replace('rgb', 'rgba').replace(')', ', 0.2)');

            setChartData({
                labels,
                datasets: [
                    {
                        label: dataLabel,
                        data,
                        borderColor: primaryColor,
                        backgroundColor: secondaryColorValue,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: primaryColor,
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2,
                    }
                ]
            });
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [title, labels, dataLabel, color, secondaryColor]);

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeOutQuart',
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: {
                    size: 13,
                    weight: 'normal',
                },
                bodyFont: {
                    size: 14,
                    weight: 'bold',
                },
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: function (context) {
                        let labelText = context.dataset.label || '';
                        if (labelText) {
                            labelText += ': ';
                        }
                        if (context.parsed.y !== null) {
                            labelText += dataLabel.includes('抵押率') || dataLabel.includes('收益')
                                ? context.parsed.y + '%'
                                : context.parsed.y.toLocaleString();
                        }
                        return labelText;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: 'rgba(160, 160, 160, 0.8)',
                    font: {
                        size: 10,
                    },
                    maxRotation: 0,
                },
            },
            y: {
                grid: {
                    color: 'rgba(160, 160, 160, 0.1)',
                },
                ticks: {
                    color: 'rgba(160, 160, 160, 0.8)',
                    font: {
                        size: 11,
                    },
                    callback: function (value) {
                        if (dataLabel.includes('USDH')) {
                            return (value as number) >= 1000 ? (value as number) / 1000 + 'K' : value;
                        }
                        return value;
                    }
                },
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        elements: {
            line: {
                borderWidth: 2,
            }
        },
    };

    // 创建简单的数据可视化组件来替代Chart.js
    const SimpleChart = ({ data, color }: { data: number[], color: string }) => {
        const maxVal = Math.max(...data, 0);
        const minVal = Math.min(...data, 0);
        const range = maxVal - minVal;

        return (
            <div className="relative h-64 flex items-end justify-between px-1 pt-2">
                {data.map((value, index) => {
                    const barHeight = range === 0 ? 50 : ((value - minVal) / range * 80);
                    return (
                        <div key={index} className="group relative flex flex-col items-center justify-end" style={{ height: '100%', flex: 1 }}>
                            <div
                                className="w-11/12 mx-auto rounded-t-sm transition-all duration-200 hover:opacity-80"
                                style={{
                                    height: `${Math.max(barHeight, 2)}%`, // Ensure minimum height for visibility
                                    backgroundColor: color,
                                    minHeight: '4px'
                                }}
                            ></div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 whitespace-nowrap">
                                {value.toLocaleString()}
                            </div>
                        </div>
                    );
                })}
                <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800/30 h-0"></div>
            </div>
        );
    };

    return (
        <div className="bg-gray-900/30 backdrop-blur-md rounded-xl border border-gray-800/70 overflow-hidden shadow-glow-sm">
            <div className="p-5 border-b border-gray-800/50">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">周期：</span>
                        <div className="bg-gray-800/50 rounded-md">
                            <select
                                className="bg-transparent text-sm py-1 px-2 pr-6 appearance-none focus:outline-none cursor-pointer text-gray-300"
                                defaultValue={period}
                            >
                                <option value="24小时">24小时</option>
                                <option value="7天">7天</option>
                                <option value="30天">30天</option>
                                <option value="90天">90天</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-5">
                <div className="h-64 relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full border-2 border-t-blue-400 border-gray-800/50 animate-spin"></div>
                                <p className="mt-3 text-sm text-gray-400">加载中...</p>
                            </div>
                        </div>
                    ) : chartAvailable ? (
                        <Line options={options} data={chartData} />
                    ) : (
                        <div>
                            <p className="text-xs text-center text-gray-500 mb-2">图表库加载失败，显示简易数据。</p>
                            <SimpleChart data={simpleData} color={color} />
                            <div className="flex justify-between mt-2">
                                {labels.map((label, i) => (
                                    labels.length <= 7 || i % Math.ceil(labels.length / (labels.length > 15 ? 7 : 5)) === 0 ? (
                                        <span key={i} className="text-xs text-gray-500">{label}</span>
                                    ) : null
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 