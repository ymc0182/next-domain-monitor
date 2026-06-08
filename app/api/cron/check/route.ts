import { NextResponse } from 'next/server';
import { MONITORED_DOMAINS } from '../../../../config/domain';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const expiringDomains: { domain: string; daysLeft: number; expireDate: string }[] = [];

    for (const domain of MONITORED_DOMAINS) {
        try {
            const res = await fetch(`https://rdap.org/domain/${domain}`, { cache: 'no-store' });
            if (!res.ok) continue;
            const data = await res.json();
            const expirationDateStr = data.events?.find((e: any) => e.eventAction === 'expiration')?.eventDate;
            console.log(`${domain} (${expirationDateStr})`);

            if (expirationDateStr) {
                const expireDate = new Date(expirationDateStr);
                const today = new Date();
                const daysLeft = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                if (daysLeft <= 30 && daysLeft > 0) {
                    expiringDomains.push({ domain, daysLeft, expireDate: expireDate.toLocaleString('en-CA',{ timeZone: 'Asia/Shanghai' }) });
                }
            }
        } catch (e) {
            console.error(`自动检测域名 ${domain} 出错:`, e);
        }
    }

    console.log(expiringDomains);

    if (expiringDomains.length > 0) {
        const emailHtmlBody = expiringDomains
            .map((d) => `
                <div style="padding:14px 0;border-top:1px solid rgba(127,127,127,.2);">
                    <div style="font-weight:600;">${d.domain}</div>
                    <div style="opacity:.7;font-size:14px;">到期时间：${d.expireDate}</div>
                    <div style="opacity:.7;font-size:14px;">剩余天数：<span style="opacity:1;font-weight:600;">${d.daysLeft} 天</span></div>
                </div>
            `)
            .join('');

        try {
            await resend.emails.send({
                from: `域名到期提醒 <${process.env.RESEND_API_EMAIL}>`,
                to: process.env.RESEND_TO_EMAIL!,
                subject: '您的域名即将到期，请及时续费！',
                html: `
                    <div style="max-width:600px;margin:0 auto;padding:24px 16px;line-height:1.6;">
                        <div style="font-size:18px;font-weight:600;margin-bottom:24px;">以下域名即将到期，请及时续费。</div>
                        ${emailHtmlBody}
                        <div style="margin-top:20px;opacity:.5;">此邮件由系统自动发送，请勿直接回复。</div>
                    </div>
                `,
            });
        } catch (mailError) {
            return NextResponse.json({ success: false, error: '邮件下发失败' }, { status: 500 });
        }
    }

    return NextResponse.json({ success: true, triggeredAlerts: expiringDomains.length });
}