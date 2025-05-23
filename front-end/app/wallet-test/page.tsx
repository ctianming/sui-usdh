"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@/components/ConnectButton';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';

export default function WalletTestPage() {
    const currentAccount = useCurrentAccount();
    const [showDetails, setShowDetails] = useState(false);

    // 查询当前账户的 Sui 余额
    const { data: balance, isLoading: balanceLoading } = useSuiClientQuery(
        'getBalance',
        {
            owner: currentAccount?.address || '',
            coinType: '0x2::sui::SUI',
        },
        {
            enabled: !!currentAccount?.address,
        }
    );

    // 格式化显示 Sui 余额
    const formatBalance = (balance: bigint | string | undefined) => {
        if (!balance) return '0';
        const bigintValue = typeof balance === 'string' ? BigInt(balance) : balance;
        return (Number(bigintValue) / 1_000_000_000).toFixed(4);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
            <div className="mb-8">
                <Link href="/main" className="text-blue-400 hover:underline">
                    返回主页
                </Link>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-8 text-center text-white">Sui 钱包连接测试</h1>

                <div className="flex justify-center mb-8">
                    <div className="relative z-50"> {/* 确保按钮在最上层 */}
                        <ConnectButton />
                    </div>
                </div>

                {currentAccount ? (
                    <div className="mt-6 space-y-4">
                        <div className="p-4 bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">钱包已连接</span>
                                <span className="bg-green-600 text-xs px-2 py-1 rounded-full text-white">已连接</span>
                            </div>

                            <div className="mt-2">
                                <p className="text-sm text-gray-400">地址:</p>
                                <p className="font-mono text-xs break-all text-white">{currentAccount.address}</p>
                            </div>

                            <div className="mt-2">
                                <p className="text-sm text-gray-400">余额:</p>
                                <p className="text-xl font-bold text-white">
                                    {balanceLoading ? "加载中..." : `${formatBalance(balance?.totalBalance)} SUI`}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="mt-3 text-xs bg-blue-900 hover:bg-blue-800 text-blue-300 px-3 py-1.5 rounded transition-colors w-full"
                            >
                                {showDetails ? "隐藏详情" : "显示详情"}
                            </button>

                            {showDetails && (
                                <div className="mt-3 bg-gray-800 p-3 rounded text-xs text-gray-300">
                                    <pre className="overflow-auto max-h-32">
                                        {JSON.stringify(currentAccount, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-700 p-4 rounded-lg text-center text-gray-300">
                        请连接您的 Sui 钱包以继续
                    </div>
                )}
            </div>
        </div>
    );
} 