域名到期状态监控，每天 UTC 00:00 定时巡检域名状态，即将到期时用 Resend API发送邮件提醒。

# 开始使用

## 安装 Resend

```
//https://resend.com

npm install resend
```

## 配置域名

将 `/config/domain.json` 中的域名修改为你的域名。

```
export const MONITORED_DOMAINS = [
    'jb18.cm',
    'baidu.com',
    'qq.com',
    'google.com',
];
```

## 环境变量

在 Vercel 控制台中设置环境变量，或在部署时设置 Environment Variables。

本地在根目录创建 `.env.local` 文件。

```
//是否开启访问密码（可选）
NEXT_PUBLIC_REQUIRE_AUTH=true

//访问密码（可选）
DASHBOARD_PASSWORD=1234

//Resend 密钥
RESEND_API_KEY=re_xxx

//Resend 设置的域名邮箱，邮箱前缀可随意设置，如此处的 notice
RESEND_FROM_EMAIL=notice@xxx.com

//收件人邮箱
RESEND_TO_EMAIL=your_real_email@xxx.com

//定时路由密钥
CRON_SECRET=my_local_secret_xxx
```

## 测试邮件

在本地运行开发环境

```
npm run dev
```

浏览器打开 `/test-email` 可测试发送会返回错误信息，测试页面必须设置 `DASHBOARD_PASSWORD` 访问密码环境变量。