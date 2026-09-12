# Zach's Blog

用 Astro 架設的個人部落格，分享 AI 與數學學習的心得。

🌐 **線上版本**: https://ai-lish.github.io/zach-ai-blog/

## 主題

- AI 學習工具與應用
- HKDSE 數學考試技巧
- 教育科技與個人化學習
- 教材設計記錄：學習目標、活動設計、試用觀察與修訂

## 技術架構

- **Framework**: Astro
- **樣式**: Tailwind CSS 4.x
- **字體**: Playfair Display (標題) + Noto Sans HK (內文)
- **部署**: GitHub Pages

## 設計

See [DESIGN.md](./DESIGN.md) for complete design specification.

### 主要特色

- 🌙 深色模式（支援系統偏好）
- 📱 響應式設計
- 🎨 暖色系簡約風格
- ✨ 滑動動畫與閱讀進度條
- 🤝 社群分享按鈕

## 開發

```bash
npm install
npm run dev     # 本地開發
npm run build   # 構建生產版本
npm run preview # 預覽構建結果
```

## 內容

文章存放於 `src/content/posts/`，使用 Markdown 格式撰寫。

### 教材設計記錄

專頁路徑為 `/zach-ai-blog/material-design/`，首頁及導覽列均設有入口。
新增記錄時，在文章 frontmatter 加上 `category: material-design`，便會自動按日期列入專頁。
未填寫分類的既有文章仍歸入一般筆記。

```yaml
---
title: "教材名稱與設計重點"
pubDate: 2026-09-12
description: "這份教材想解決的學習問題。"
category: material-design
---
```

內文可參考 `src/content/posts/material-design-record-guide.md` 的大綱，依序記下背景、目標、設計取捨、資源連結、試用觀察與修訂。

---

Built with ❤️ by Zach Li
