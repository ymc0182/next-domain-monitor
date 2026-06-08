import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const { password } = await request.json();
		const CORRECT_PASSWORD = process.env.DASHBOARD_PASSWORD;

		if (!CORRECT_PASSWORD) {
			return NextResponse.json({ error: '服务端未配置 DASHBOARD_PASSWORD 环境变量' }, { status: 500 });
		}

		if (password === CORRECT_PASSWORD) {
			const response = NextResponse.json({ success: true });
			response.cookies.set('auth_token', 'authenticated', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7,
				path: '/',
				sameSite: 'lax',
			});
			return response;
		}

		return NextResponse.json({ error: '密码错误，拒绝访问' }, { status: 401 });
	} catch (error) {
		return NextResponse.json({ error: '无效请求' }, { status: 400 });
	}
}