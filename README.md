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

推到 `main` 會同時觸發兩個 workflow：

- **`.github/workflows/github-pages.yml`** — 建置後部署到 GitHub Pages。不需要額外設定。
- **`.github/workflows/cloudflare-pages.yml`** — 建置後部署到 Cloudflare Pages。需要兩個 repository secret：

  | Secret | 從哪裡拿 |
  | --- | --- |
  | `CLOUDFLARE_API_TOKEN` | Cloudflare 主控台 → My Profile → API Tokens，權限選 `Cloudflare Pages: Edit` |
  | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 主控台右側欄，或網址列 `dash.cloudflare.com/<account-id>` |

  沒設定這兩個 secret 時，這個 workflow 會直接跳過而不是失敗。
  專案名稱在 workflow 的 `CF_PROJECT_NAME` 環境變數裡調整。

## 技術細節

- 純靜態，沒有任何執行期相依套件
- 字型走 Google Fonts（Noto Serif TC / Noto Sans TC / IBM Plex Mono）
- 支援淺色與深色主題，跟著系統設定切換
- 須知的勾選狀態存在瀏覽器 `localStorage`，不會上傳
- 安全卡有獨立的列印樣式，直接 Ctrl/⌘ + P 就能印
