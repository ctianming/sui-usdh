"use client";

import { useState } from 'react';
import { useCurrentAccount, useSuiClient, useSuiClientQuery } from '@mysten/dapp-kit';
// ConnectButton is now managed by Navbar
// import { ConnectButton } from './ConnectButton'; 

export default function SuiInteraction() {
    const client = useSuiClient();
    const currentAccount = useCurrentAccount();
    const [loading, setLoading] = useState(false);
    const [actionResult, setActionResult] = useState<string | null>(null); // Renamed for clarity

    const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useSuiClientQuery(
        'getBalance',
        {
            owner: currentAccount?.address || '',
            coinType: '0x2::sui::SUI',
        },
        {
            enabled: !!currentAccount?.address,
        }
    );

    const formatBalance = (balance: bigint | string | undefined) => {
        if (balance === undefined || balance === null) return '0.0000';
        const bigintValue = typeof balance === 'string' ? BigInt(balance) : balance;
        return (Number(bigintValue) / 1_000_000_000).toFixed(4);
    };

    const handleGetLatestCheckpoint = async () => {
        if (!currentAccount) {
            setActionResult("请先连接钱包。");
            return;
        }
        try {
            setLoading(true);
            setActionResult(null);
            const latestCheckpoint = await client.getLatestCheckpointSequenceNumber();
            setActionResult(`最新区块序列号: ${latestCheckpoint}`);
        } catch (error) {
            setActionResult(`错误: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    const infoBlockClasses = "bg-gray-800/50 p-4 rounded-lg border border-gray-700/70 shadow-sm";
    const buttonBaseClasses = "w-full font-medium py-2.5 px-5 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 transform hover:scale-[1.03]";
    const primaryButtonClasses = `${buttonBaseClasses} bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg focus:ring-blue-500`;
    const secondaryButtonClasses = `${buttonBaseClasses} bg-gray-700/60 hover:bg-gray-600/80 text-gray-200 hover:text-white border border-gray-600/80 focus:ring-gray-500`;

    if (!currentAccount) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-400 text-base">请连接钱包以查看账户详情和交互。</p>
                {/* Optional: Add a placeholder or an icon here if desired */}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Removed main container bg/border, h2 title, and ConnectButton here */}

            <div className={infoBlockClasses}>
                <p className="text-sm text-blue-300/80 mb-1">钱包地址:</p>
                <p className="font-mono text-sm text-gray-200 break-all">{currentAccount.address}</p>
            </div>

            <div className={infoBlockClasses}>
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-blue-300/80">SUI 余额:</p>
                    <button
                        onClick={() => refetchBalance()}
                        className="text-xs bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={balanceLoading}
                    >
                        {balanceLoading ? "刷新中..." : "刷新"}
                    </button>
                </div>
                <p className="text-xl font-semibold text-white">
                    {balanceLoading && !balance ? "加载中..." : `${formatBalance(balance?.totalBalance)} SUI`}
                </p>
            </div>

            <div className="space-y-3 pt-2">
                <button
                    onClick={handleGetLatestCheckpoint}
                    className={primaryButtonClasses}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            查询中...
                        </span>
                    ) : "查询最新 Sui 区块"}
                </button>

                {actionResult && (
                    <div className={`${infoBlockClasses} mt-3 animate-fadeIn`}>
                        <p className="text-sm text-blue-300/80 mb-1">操作结果:</p>
                        <p className="font-mono text-sm text-gray-200 break-all">{actionResult}</p>
                    </div>
                )}
            </div>
        </div>
    );
} 