"use client";

import { ConnectButton as SuiConnectButton } from '@mysten/dapp-kit';
import { ReactNode } from 'react';

export function ConnectButton() {
    return (
        <div className="z-50 relative">
            <SuiConnectButton>
                {({ connected, connecting, connect, disconnect, account }) => (
                    <button
                        onClick={connected ? disconnect : connect}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                        disabled={connecting}
                    >
                        {connecting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                连接中...
                            </span>
                        ) : connected && account ? (
                            <span className="flex items-center">
                                <span className="relative mr-2">
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></span>
                                </span>
                                {account.address.slice(0, 4)}...{account.address.slice(-4)}
                            </span>
                        ) : (
                            <span>连接钱包</span>
                        )}
                    </button>
                )}
            </SuiConnectButton>
        </div>
    );
} 