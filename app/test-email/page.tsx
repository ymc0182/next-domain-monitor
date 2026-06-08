'use client';

import { useState } from 'react';

export default function TestEmailPage() {
    const [targetEmail, setTargetEmail] = useState('');
    const [password, setPassword] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSendTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const res = await fetch('/api/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: targetEmail, password }), 
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('测试邮件已投递成功，请查收发件箱。');
                setPassword(''); 
            } else {
                setStatus('error');
                setMessage(data.error || '投递失败，接口拒绝了请求。');
            }
        } catch (err: any) {
            setStatus('error');
            setMessage('网络请求失败，请检查控制台。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 font-mono transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-6">
                
                <div className="flex flex-col gap-2 pb-6 border-b border-dashed border-neutral-200 dark:border-neutral-800">
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                        邮件投递测试
                    </h1>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        邮件发送测试接口，需强制验证密码。
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl p-5 md:p-8">
                    <form onSubmit={handleSendTest} className="space-y-5">
                        
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                接收邮箱 (TARGET EMAIL)
                            </label>
                            <input
                                type="email"
                                placeholder="admin@example.com"
                                value={targetEmail}
                                onChange={(e) => setTargetEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-500 text-neutral-900 dark:text-neutral-100 text-sm transition-colors"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                安全凭证 (ADMIN PASSWORD)
                            </label>
                            <input
                                type="password"
                                placeholder="请输入管理员密码进行鉴权"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-500 text-neutral-900 dark:text-neutral-100 text-sm transition-colors"
                                required
                            />
                        </div>

                        <div className="pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                            <button
                                type="submit"
                                disabled={loading || !targetEmail || !password}
                                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-neutral-50 dark:text-neutral-900 text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'AUTHENTICATING...' : '验证密码并发送'}
                            </button>
                        </div>
                    </form>

                    {status !== 'idle' && (
                        <div className={`mt-6 p-4 rounded-lg border border-dashed text-xs ${
                            status === 'success' 
                                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400'
                                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
                        }`}>
                            <div className="font-bold mb-1 uppercase">
                                {status === 'success' ? '[STATUS: ACCESS GRANTED]' : '[STATUS: ACCESS DENIED]'}
                            </div>
                            <div>{message}</div>
                        </div>
                    )}
                </div>
                
                <div className="text-left">
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors underline decoration-dashed underline-offset-4"
                    >
                        ← 返回主页
                    </button>
                </div>

            </div>
        </main>
    );
}