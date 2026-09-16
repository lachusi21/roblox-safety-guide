# Roblox 安全指南

給 15 歲以下孩子與家長的 Roblox 指南，兩頁靜態網站。

| 頁面 | 內容 |
| --- | --- |
| `index.html` | 完整指南：Roblox 是什麼、推薦哪些遊戲、平台的真實爭議、11 條安全須知（可勾選） |
| `card.html` | 列印版安全卡：11 條須知 + 出事三步驟 + 親子約定欄，A4 一頁 |

## 原始檔與建置

原始檔是兩個 HTML 片段（沒有 `doctype` / `head` / `body`），因為同一份內容也會發布成 Claude Artifact：

```
roblox-guide-for-my-son.html   →  public/index.html
roblox-safety-card.html        →  public/card.html
```

`build.mjs` 負責補上完整的 HTML 骨架（charset、viewport、favicon、OG 標籤）、產生 `404.html` 與 `.nojekyll`，並在兩頁之間加上互相連結。

```bash
node build.mjs        # 輸出到 public/
```

`public/` 是產生出來的，不進版控。

## 本機預覽

```bash
node build.mjs && npx serve public
```

## 部署

推到 `main` 會觸發兩條各自獨立的部署：

- **GitHub Pages** — 由 [.github/workflows/github-pages.yml](.github/workflows/github-pages.yml) 建置並部署，不需要額外設定。
  網址：<https://lachusi21.github.io/roblox-safety-guide/>

- **Cloudflare Workers（靜態資產）** — 在 Cloudflare 主控台連接這個 repo 之後由 Cloudflare 自己建置，不經過 GitHub Actions、也不需要 API token。
  設定值：建置指令 `node build.mjs`，輸出目錄 `public`，其餘由 [wrangler.jsonc](wrangler.jsonc) 決定。

  > 舊的 Cloudflare Pages「Connect to Git」流程已經從主控台移除，
  > 現在的入口是 **Compute (Workers & Pages) → Create → Continue with GitHub**。

## 技術細節

- 純靜態，沒有任何執行期相依套件
- 字型走 Google Fonts（Noto Serif TC / Noto Sans TC / IBM Plex Mono）
- 支援淺色與深色主題，跟著系統設定切換
- 須知的勾選狀態存在瀏覽器 `localStorage`，不會上傳
- 安全卡有獨立的列印樣式，直接 Ctrl/⌘ + P 就能印

## 分享縮圖（OG image）

`assets/og.source.html` 是縮圖的版面，用 `assets/render-og.mjs` 截成 `assets/og.png`（1200×630 @2x）。
PNG 進版控，CI 只負責複製到 `public/og.png`，不需要在 CI 跑瀏覽器。

改了版面之後重新產圖：

```bash
npm install --no-save playwright
node assets/render-og.mjs
```

用的是系統上已安裝的 Chrome（`channel: 'chrome'`），不會另外下載 Chromium。
