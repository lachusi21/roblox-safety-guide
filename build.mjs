// 把 Artifact 片段（沒有 doctype / head / body）包成完整的獨立網頁，輸出到 public/。
// 這樣同一份原始檔可以同時發布成 Artifact，也可以架成靜態網站。

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const SITE_NAME = 'Roblox 安全指南';

const PAGES = [
  {
    src: 'roblox-guide-for-my-son.html',
    out: 'public/index.html',
    emoji: '🎮',
    description: '給 15 歲以下玩家的 Roblox 完整指南：這是什麼、玩什麼好、要知道的真實問題，以及 11 條安全須知。',
  },
  {
    src: 'roblox-safety-card.html',
    out: 'public/card.html',
    emoji: '🛡️',
    description: 'Roblox 安全須知 11 條，可直接列印貼在電腦旁，附一份親子約定欄。',
  },
];

const RESET = `html{color-scheme:light dark}
body{margin:0}
img{max-width:100%}
[hidden]{display:none!important}`;

const SWITCH_STYLE = `#site-switch{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;
padding:22px 20px 40px;font-family:inherit;font-size:13.5px}
#site-switch a{display:inline-flex;align-items:center;gap:6px;padding:8px 15px;border-radius:8px;
text-decoration:none;font-weight:700;color:var(--ink-soft,#576073);
background:var(--surface,#fff);border:1.5px solid var(--rule,#DDE2EB)}
#site-switch a:hover{color:var(--brand,#3B3FBF);border-color:var(--brand,#3B3FBF)}
#site-switch a[aria-current="page"]{color:var(--brand,#3B3FBF);border-color:var(--brand,#3B3FBF);
background:var(--brand-soft,#E9EAFA)}
#site-switch a:focus-visible{outline:3px solid var(--brand,#3B3FBF);outline-offset:2px}`;

/** 取得 <title> 的文字，當作頁面標題 */
function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : SITE_NAME;
}

/** emoji 直接當 favicon，不用額外的圖檔 */
function faviconDataUri(emoji) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** 兩頁之間的互相連結，只出現在網站版，Artifact 版不受影響 */
function siteSwitch(currentOut) {
  const links = [
    { href: './', label: '📖 完整指南', out: 'public/index.html' },
    { href: './card.html', label: '🖨️ 列印版安全卡', out: 'public/card.html' },
  ];
  const items = links
    .map((l) => {
      const current = l.out === currentOut ? ' aria-current="page"' : '';
      return `  <a href="${l.href}"${current}>${l.label}</a>`;
    })
    .join('\n');
  return `<nav id="site-switch" aria-label="站內導覽">\n${items}\n</nav>`;
}

async function buildPage(page) {
  const fragment = await readFile(page.src, 'utf8');
  const title = extractTitle(fragment);

  // 片段本身已經含有 <title> / <link rel=stylesheet> / <style>，
  // 這些都是合法的 head 內容，所以整段原封不動放進 <head>，
  // 再從 <body> 開始放實際的頁面內容。
  const headEnd = fragment.lastIndexOf('</style>');
  if (headEnd === -1) throw new Error(`${page.src}: 找不到 </style>，無法切出 head`);
  const head = fragment.slice(0, headEnd + '</style>'.length);
  const body = fragment.slice(headEnd + '</style>'.length).trim();

  const html = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${page.description}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="${faviconDataUri(page.emoji)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${page.description}">
<meta name="twitter:card" content="summary">
<style>${RESET}</style>
${head}
<style>${SWITCH_STYLE}</style>
</head>
<body>
${body}
${siteSwitch(page.out)}
</body>
</html>
`;

  await mkdir(dirname(page.out), { recursive: true });
  await writeFile(page.out, html, 'utf8');
  console.log(`  ${page.src}  ->  ${page.out}  (${(html.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log('building…');
  for (const page of PAGES) await buildPage(page);

  // GitHub Pages 預設會跑 Jekyll，這個檔案讓它直接輸出原始檔
  await writeFile('public/.nojekyll', '', 'utf8');

  // 找不到頁面時導回首頁
  await writeFile(
    'public/404.html',
    `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>找不到這一頁</title>
<style>
  html { color-scheme: light dark }
  body {
    margin: 0; min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 14px;
    background: #F1F4F9; color: #181C27;
    font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif;
    text-align: center; padding: 24px;
  }
  h1 { font-size: 26px; margin: 0; font-weight: 700 }
  p { margin: 0; color: #576073 }
  a { color: #3B3FBF; font-weight: 700 }
  @media (prefers-color-scheme: dark) {
    body { background: #0F1118; color: #ECEFF6 }
    p { color: #A0A8BB }
    a { color: #8D90FF }
  }
</style>
</head>
<body>
  <h1>找不到這一頁</h1>
  <p>連結可能打錯了。</p>
  <p><a href="./">回到 ${SITE_NAME}</a></p>
</body>
</html>
`,
    'utf8'
  );

  console.log('  public/404.html, public/.nojekyll');
  console.log('done.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
