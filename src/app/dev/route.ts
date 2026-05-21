import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

const DENIED_HTML = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Zugang verweigert</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f1117; color: #e2e8f0;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 24px;
    }
    .box {
      background: #1a1d27; border: 1px solid #2a2e42;
      border-radius: 16px; padding: 40px; max-width: 420px; width: 100%;
      text-align: center;
    }
    .icon { font-size: 40px; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    p { font-size: 13.5px; color: #8892a4; line-height: 1.6; margin-bottom: 24px; }
    label { display: block; text-align: left; font-size: 11.5px; font-weight: 600;
      color: #8892a4; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
    form { text-align: left; }
    .row { display: flex; gap: 8px; }
    input {
      flex: 1; padding: 10px 14px; background: #0f1117;
      border: 1px solid #2a2e42; border-radius: 10px;
      color: #e2e8f0; font-size: 13px; outline: none;
      font-family: 'SF Mono', monospace;
    }
    input:focus { border-color: #4f8ef7; }
    button {
      padding: 10px 18px; background: #4f8ef7; color: white;
      border: none; border-radius: 10px; font-size: 13px;
      font-weight: 600; cursor: pointer; white-space: nowrap;
    }
    button:hover { background: #3b7de8; }
  </style>
</head>
<body>
  <div class="box">
    <div class="icon">🔐</div>
    <h1>Interner Bereich</h1>
    <p>Diese Seite ist nur für interne Nutzung zugänglich. Bitte gib den Zugangscode ein.</p>
    <form method="GET" action="/dev">
      <label>Zugangscode</label>
      <div class="row">
        <input type="password" name="key" placeholder="••••••••" autofocus />
        <button type="submit">Öffnen</button>
      </div>
    </form>
  </div>
</body>
</html>`;

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  const validKey = process.env.DEV_GUIDE_KEY;

  if (!validKey || key !== validKey) {
    return new NextResponse(DENIED_HTML, {
      status: key ? 401 : 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const html = readFileSync(join(process.cwd(), 'public', 'dev', 'index.html'), 'utf-8');
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
