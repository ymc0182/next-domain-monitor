'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const isAuthRequired = process.env.NEXT_PUBLIC_REQUIRE_AUTH !== 'false';

    useEffect(() => {
        if (!isAuthRequired) {
            router.push('/');
        }
    }, [isAuthRequired, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.refresh(); 
                router.push('/');
                return;
            }

            const contentType = res.headers.get('content-type');
            let errorMessage = '验证失败';

            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                errorMessage = data.error || errorMessage;
            } else {
                errorMessage = `服务器异常 (${res.status})`;
            }
            setError(errorMessage);
        } catch (err: any) {
            setError('网络连接失败，请检查控制台');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-mono flex items-center justify-center p-6 transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl px-6 py-8">
                
                <div className="text-center mb-8 border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-6">
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                        域名状态监控
                    </h1>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                        {isAuthRequired ? '系统已锁定，请验证访问权限。' : '免密模式，正在跳转...'}
                    </p>
                </div>

                {isAuthRequired ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <input
                                type="password"
                                placeholder="输入访问密码"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-500 text-neutral-900 dark:text-neutral-100 text-sm transition-colors"
                                required
                            />
                            {error && (
                                <p className="text-[11px] text-red-600 dark:text-red-400 font-medium px-1">
                                    {error}
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-neutral-50 dark:text-neutral-900 text-sm font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '验证中...' : '验证并登入'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4 text-center py-4">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200/40 dark:border-green-900/30 animate-pulse">
                            自动重定向中
                        </div>
                        <div className="text-xs text-neutral-400 dark:text-neutral-600">
                            已检测到免密凭证，系统正在进入主控制台。
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}