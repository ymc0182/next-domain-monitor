import { MONITORED_DOMAINS } from '../config/domain';

interface DomainInfo {
  domain: string;
  expireDate: string;
  regDate: string;
  age: string;
  registrar: string;
  dns: string[];
  rdapStatus: string[]; 
  daysLeft: number | string;
  status: 'success' | 'warning' | 'danger' | 'unknown';
}

async function getDomainData(domain: string): Promise<DomainInfo> {
    try {
        const res = await fetch(`https://rdap.org/domain/${domain}`, { 
         next: { revalidate: 43200 }
        });

        if (!res.ok) throw new Error('RDAP 接口响应失败');
        const data = await res.json();
        
        const events = data.events || [];
        const registrationEvent = events.find((e: any) => e.eventAction === 'registration');
        const expirationEvent = events.find((e: any) => e.eventAction === 'expiration');
        
        const rdapStatus = data.status || ['未知状态'];
        
        if (expirationEvent && registrationEvent) {
            const expireDate = new Date(expirationEvent.eventDate);
            const regDate = new Date(registrationEvent.eventDate);
            const today = new Date();
            
            const diffTime = expireDate.getTime() - today.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            const ageDiff = today.getTime() - regDate.getTime();
            const ageDays = Math.floor(ageDiff / (1000 * 60 * 60 * 24));
            const ageText = ageDays > 365 
                ? `${(ageDays / 365).toFixed(1)} 年` 
                : `${ageDays} 天`;

            const registrarEntity = data.entities?.find((e: any) => e.roles?.includes('registrar'));
            let registrar = '未知注册商';
            if (registrarEntity?.vcardArray?.[1]) {
                const fnProp = registrarEntity.vcardArray[1].find((prop: any) => prop[0] === 'fn');
                if (fnProp) registrar = fnProp[3];
            } else if (registrarEntity?.handle) {
                registrar = registrarEntity.handle;
            }

            const dnsServers = data.nameservers?.map((ns: any) => ns.ldhName?.toLowerCase()) || [];
            
            let status: 'success' | 'warning' | 'danger' = 'success';
            if (daysLeft <= 30) status = 'danger';
            else if (daysLeft <= 90) status = 'warning';

            return {
                domain,
                expireDate: expireDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }),
                regDate: regDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }),
                age: ageText,
                registrar,
                dns: dnsServers,
                rdapStatus,
                daysLeft,
                status
            };
        }
        
        return { domain, expireDate: '无数据', regDate: '未知', age: '-', registrar: '未知', dns: [], rdapStatus: ['无状态数据'], daysLeft: '-', status: 'unknown' };
    } catch (error) {
        return { domain, expireDate: '查询失败', regDate: '未知', age: '-', registrar: '未知', dns: [], rdapStatus: ['查询异常'], daysLeft: '-', status: 'unknown' };
    }
}

export default async function HomePage() {
    const domainList = await Promise.all(MONITORED_DOMAINS.map(getDomainData));

    const totalCount = domainList.length;
    const successCount = domainList.filter((d) => d.status === 'success').length;
    const warningCount = domainList.filter((d) => d.status === 'warning').length;
    const dangerCount = domainList.filter((d) => d.status === 'danger').length;

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 font-mono transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-6">
                
                <div className="flex flex-col gap-5 pb-6 border-b border-dashed border-neutral-200 dark:border-neutral-800">
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                            👀域名状态监控
                        </h1>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                            自动化域名生命周期监控与状态跟踪系统。
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg p-3 bg-white dark:bg-neutral-900/50">
                            <div className="text-xs text-neutral-400 dark:text-neutral-500">监控总数</div>
                            <div className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">{totalCount}</div>
                        </div>
                        <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg p-3 bg-white dark:bg-neutral-900/50">
                            <div className="text-xs text-neutral-400 dark:text-neutral-500">时间充足</div>
                            <div className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{successCount}</div>
                        </div>
                        <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg p-3 bg-white dark:bg-neutral-900/50">
                            <div className="text-xs text-neutral-400 dark:text-neutral-500">需要续费</div>
                            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{warningCount}</div>
                        </div>
                        <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg p-3 bg-white dark:bg-neutral-900/50">
                            <div className="text-xs text-neutral-400 dark:text-neutral-500">急需续费</div>
                            <div className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{dangerCount}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {domainList.map((item) => (
                        <div 
                            key={item.domain}
                            className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl p-5 flex flex-col justify-between transition-colors"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="text-lg font-bold uppercase text-neutral-800 dark:text-neutral-100 tracking-tight">
                                            {item.domain}
                                        </div>
                                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                            已注册 {item.age}
                                        </div>
                                    </div>
                                
                                    <div className="shrink-0">
                                        {item.status === 'success' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200/40 dark:border-green-900/30">
                                                正常
                                            </span>
                                        )}
                                        {item.status === 'warning' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/30">
                                                续费
                                            </span>
                                        )}
                                        {item.status === 'danger' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/40 dark:border-red-900/30 animate-pulse">
                                                急需续费
                                            </span>
                                        )}
                                        {item.status === 'unknown' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-700">
                                                未知
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                        剩余 {item.daysLeft} 天
                                    </span>
                                    
                                    {item.rdapStatus.map((statusStr, idx) => (
                                        <span 
                                            key={idx} 
                                            className="inline-flex items-center px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-transparent text-xs text-neutral-400 dark:text-neutral-500"
                                        >
                                            {statusStr}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-4 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800/60 text-xs space-y-1.5 text-neutral-500 dark:text-neutral-400">
                                    <div className="flex justify-between items-center">
                                        <span>注册时间</span>
                                        <span className="font-mono text-neutral-600 dark:text-neutral-400">{item.regDate}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span>到期时间</span>
                                        <span className="font-mono text-neutral-600 dark:text-neutral-400">{item.expireDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 -mx-5 -mb-5 p-4 rounded-b-xl space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                                <div className="flex justify-between items-start gap-4">
                                    <span className="shrink-0 text-neutral-400 dark:text-neutral-500">注册商</span>
                                    <span className="text-neutral-600 dark:text-neutral-400 truncate text-right max-w-[180px]">
                                        {item.registrar}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-start gap-4">
                                    <span className="shrink-0 text-neutral-400 dark:text-neutral-500">DNS</span>
                                    {item.dns.length > 0 ? (
                                        <div className="flex flex-col gap-0.5 text-[11px] text-neutral-600 dark:text-neutral-400 text-right items-end">
                                            {item.dns.map((ns, idx) => (
                                                <div key={idx} className="truncate max-w-[210px] font-mono">{ns}</div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-neutral-400 dark:text-neutral-600 italic text-[11px]">无</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}