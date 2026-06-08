import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        const correctPassword = process.env.DASHBOARD_PASSWORD;

        if (!correctPassword || password !== correctPassword) {
            return NextResponse.json(
                { error: '安全校验失败：管理密码错误或服务器未配置密码凭证' }, 
                { status: 401 }
            );
        }

        if (!email) {
            return NextResponse.json({ error: '未提供目标邮箱地址' }, { status: 400 });
        }

        const { data, error } = await resend.emails.send({
            from: `域名到期提醒 <${process.env.RESEND_FROM_EMAIL}>`,
            to: [email],
            subject: '【域名到期提醒】你有域名即将到期（测试）',
            html: `
                <div style="max-width:600px;margin:0 auto;padding:24px 16px;line-height:1.6;">
                    <div style="font-size:18px;font-weight:600;margin-bottom:24px;">以下域名即将到期，请及时续费。</div>

                    <div style="padding:14px 0;border-top:1px solid rgba(127,127,127,.2);">
                        <div style="font-weight:600;">qq.cm</div>
                        <div style="opacity:.7;font-size:14px;">到期时间：2026-06-10</div>
                        <div style="opacity:.7;font-size:14px;">剩余天数：<span style="opacity:1;font-weight:600;">2 天</span></div>
                    </div>

                    <div style="padding:14px 0;border-top:1px solid rgba(127,127,127,.2);">
                        <div style="font-weight:600;">baidu.com</div>
                        <div style="opacity:.7;font-size:14px;">到期时间：2026-07-08</div>
                        <div style="opacity:.7;font-size:14px;">剩余天数：<span style="opacity:1;font-weight:600;">30 天</span></div>
                    </div>

                    <div style="padding:14px 0;border-top:1px solid rgba(127,127,127,.2);">
                        <div style="font-weight:600;">example.com</div>
                        <div style="opacity:.7;font-size:14px;">到期时间：2026-07-15</div>
                        <div style="opacity:.7;font-size:14px;">剩余天数：<span style="opacity:1;font-weight:600;">37 天</span></div>
                    </div>

                    <div style="margin-top:20px;opacity:.5;">此邮件由系统自动发送，请勿直接回复。</div>
                </div>
            `,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, id: data?.id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || '服务器内部错误' }, { status: 500 });
    }
}