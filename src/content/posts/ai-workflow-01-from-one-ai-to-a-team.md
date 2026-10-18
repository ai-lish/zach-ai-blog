---
title: "一個數學老師的 AI 協作流程（一）：由一個 AI 到一隊 AI"
pubDate: 2026-10-18
description: "一位香港中學數學老師回顧如何由 Gemini 課堂小遊戲，逐步建立由多個 AI 與操作工具協作的工作流程。"
category: notes
series: ai-workflow
seriesPart: 1
---

## 本講重點

- 這套協作方式由製作課堂小遊戲開始，逐步加入派工、提示語交接、程式實作和審閱。
- 他認為，模型需要配合合適的操作軟件；工具的可靠程度和工作方式同樣重要。
- 現時由 Gemini 起初稿、Codex 實作、Claude 審閱，他本人保留合併及部署前的批准權。

## 引子：先有一個小遊戲

談起這套工作流程，他提到幾個不同的 AI 和操作工具。這支隊伍並非一開始便設計好，而是隨着實際工作逐步形成。回看這段經歷，起點不是一套大型系統，而是教學中一個很具體的嘗試：用 Gemini 製作課堂小遊戲，再放上 Google Sites。

以下按時間順序整理工具與分工轉變；其中 2026 年 5–6 月是他印象中的時間。

<picture>
  <source media="(max-width: 1023px)" srcset="/zach-ai-blog/images/ai-workflow/timeline-2025-2026-mobile.svg" />
  <img src="/zach-ai-blog/images/ai-workflow/timeline-2025-2026.svg" alt="由 2025 年 11 月至 2026 年 10 月的六個時段：由 Gemini 課堂小遊戲，逐步發展到 Claude 與 Codex 協作及更多教學工具。" loading="lazy" />
</picture>

## 從單一嘗試到工作交接

### 2025 年 11 月：在課堂中試用 Gemini

當時，他用一部 Mac mini（M2），嘗試在教學中用 Gemini 製作課堂小遊戲，再放上 Google Sites。這是整段時間線中最早的一步：工具先進入一件具體的教學工作，至於日後會有多少個角色加入，當時還未成為問題。

### 2026 年 3 月：開始派發工作

到了 2026 年 3 月，他用 MiniMax 驅動 OpenClaw，經 Discord 及 Telegram 派工作，並建立 GitHub repo。工作開始不只是向一個模型輸入提示語、取得回覆；他開始嘗試把任務交給工具處理，並把工作放進 repo。

### 2026 年 5–6 月：先寫提示語，再交給 Gemini

按他的印象，2026 年 5 至 6 月，他用免費版 Claude Chat 寫提示語，再交給 Gemini 更新小遊戲。這種做法已包含兩個不同角色：Claude Chat 協助把要求寫清楚，Gemini 按提示語修改遊戲。後來他繼續擴展的，正是這種把不同能力接起來的思路。

### 2026 年 6–7 月：由 Discord 工作 thread 轉用 Codex

2026 年 6 至 7 月，他開始用訂閱版 Codex 代替 Discord 的工作 thread，並用訂閱版 Claude Chat 作建議。轉用的原因包括 MiniMax 能力不夠、他想用更強的模型；其中令他最在意的，是工具會否弄壞既有成果。他用一句粵語總結當時的感受：「minimax經常整爛我啲嘢，codex未試過整爛。」

只用 Codex 的時期也有不順手之處。他覺得整體體感較差，但用量充足；遙距同步慢，有時甚至沒有反應。手機上的 Codex Remote 按工作資料夾分組，不按 App 內的 project 分組。幾個 project 共用一個資料夾時，手機只顯示一組，因此有些 session 不見了。另一個問題是，正在運行的 active session 在手機看不到，電腦則正常；原因仍未查明。

### 2026 年 9 月下旬：Claude 開始指揮多條 Codex thread

9 月下旬，他換了一部新 Mac mini。9 月 28 日開始用 Claude Code；9 月 29 日寫好 Claude 與 Codex 共用的操作手冊。最初，他仍然用 Claude Chat 手動轉發提示語，處理提示語不夠精細的問題。

之後他學會 Claude Code，並設定好 session，由一個 Claude 指揮多條 Codex thread。他形容這樣的安排效果良好。改變之處不只在於多添一個工具，而是 Claude 開始負責整理和指揮，Codex 則可以分別接手多條實作工作。

### 2026 年 10 月：工具種類擴展

10 月 4 日，他首次成功讓 Codex 經瀏覽器操作 Gemini 起稿；gpt-6-astra 亦從 10 月 4 日起作獨立審閱。Gemini 筆記本則從 9 月 29 日起用作共享資料。10 月 12 日，他試用 MiniMax 語音為教學影片配音；10 月 17 日則有第一個用 Manim 製作教學影片的例子。工作亦涉及 GitHub 和 Google Apps Script。

這些工作由 Claude Opus 5.5（high）指揮 Codex gpt-6-luna（max）共同操作，均成功。工具清單變長，但每一項都放在一個明確的工作位置：有的負責起稿，有的執行操作，有的審閱，也有的處理影片製作。

## 核心觀點：模型要配搭操作軟件

談到如何選工具，他把重點放在模型與軟件的配合上：「模型要配搭合適的操作軟件才會發揮最大作用。」他列出的組合是 GPT 配 Codex、Claude 配 Claude Code、MiniMax 配 Hermes／OpenClaw，以及 Gemini 配 Antigravity。

這個看法也解釋了為甚麼他會同時使用多套工具。模型提供能力，操作軟件則決定它怎樣接觸檔案、瀏覽器或其他工作環境。對他來說，單看模型名稱並不足以描述一項工作的流程，還要看模型透過甚麼軟件執行工作，以及結果交給誰檢查。

<img src="/zach-ai-blog/images/ai-workflow/model-software-pairs.svg" alt="四組模型與操作軟件配對：GPT 配 Codex、Claude 配 Claude Code、MiniMax 配 Hermes 或 OpenClaw、Gemini 配 Antigravity。" loading="lazy" />

## 現在的分工：起稿、實作、審閱和批准

現時的分工相當清楚：Gemini 起初稿；Codex 負責實作，也是唯一部署者；Claude 負責審閱和撰寫提示語。部署由 Codex 執行，但是否合併或部署仍要由他本人批准。

Claude 用量不足時，他改由 Codex 一條專門的 thread 查看 Claude 的工作階段記錄並接手，於是變成一條 Codex thread 協調多條 Codex thread。當時他亦會用雲端 Claude，因為雲端仍有額外付費用量；等 Claude 恢復額度，再由 Claude 回看這段期間的工作。

<img src="/zach-ai-blog/images/ai-workflow/division-of-labour.svg" alt="工作分工流程：Gemini 起初稿，Codex 實作，Claude 審閱，合併及部署前由本人批准；Claude 用量不足時，Codex thread 讀取 Claude 記錄並接手協調。" loading="lazy" />

## 下講預告

由一個 Gemini 小遊戲，到多個工具分工，這段經歷逐漸帶出另一個問題：工作成果應該以甚麼 repo 為正本，公開版本又如何跟進？下一講會談 private repo 做正本、public repo 做鏡像的安排。

## 帶走一句

「模型要配搭合適的操作軟件才會發揮最大作用。」
