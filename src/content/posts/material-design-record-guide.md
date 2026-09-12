---
title: "教材設計記錄：由學習目標到修訂"
pubDate: 2026-09-12
description: "這個專區的記錄格式：整理教材目標、設計取捨、試用觀察與下一版修改，方便日後重用。"
category: material-design
---

這個專區用來整理教材背後的設計思路，讓每次修改都有脈絡可循。本文同時記錄目前採用的 AI 協作流程，方便日後重現、審閱和發佈。本文是記錄格式說明，並非已完成的課堂試用報告。

## 背景：工具與分工

目前的製作環境包括以下三個訂閱：

- **ChatGPT Plus**：整理教材構想、拆解工作、撰寫或改寫提示語，以及在交接前整理上下文。
- **Claude Pro**：逐題審閱數學內容、答案和解題步驟，並檢查語文、難度和學生使用時的清晰度。
- **Google AI Pro（Gemini）**：按課題製作練習初稿，先提出題型、變數範圍、答案和教學步驟。

訂閱名稱是工作背景；每次記錄仍要寫清楚實際使用的模型、日期、提示語版本和輸入檔案，避免只憑名稱推測成果來源。

## 1. 教材背景與學習目標

記下教材名稱、適用年級、課題、預計課時及學生需要的先備知識。目標盡量寫成可觀察的表現，例如「能解釋百分率變化以哪個數值作基準」，方便之後判斷教材是否達到目的。

## 2. 想處理的學習難點

列出教材想回應的概念或常見錯誤，並註明依據來自作業、課堂觀察，還是設計時的假設。尚未驗證的想法先標示為待觀察。

## 3. 題目與活動如何安排

按學生的學習次序記錄：引入情境、概念探索、示範例題、引導練習、獨立應用及總結。說明題目難度如何遞進，以及為何採用圖像、操作或互動回饋。

如有使用 AI，可記下用途、提示詞要點，以及教師如何核對答案、數學表達與題目難度。

## AI 協作與交接流程

### 1. 從 Assessment repo 取用模板

先閱讀 [Assessment 的學生版模板](https://github.com/ai-lish/Assessments/blob/main/templates/student.html)，確認學生頁面的佈局、輸入方式、MathJax、回饋和 PDF 行為；再對照 [題目庫規格](https://github.com/ai-lish/Assessments/blob/main/question-bank.json)，把每一課的練習拆成可驗證的題型資料。正式匯出的位置和命名方式以 [exercises/README.md](https://github.com/ai-lish/Assessments/blob/main/exercises/README.md) 為準。

題目模板可分兩層使用。若要先建立考試題目的變式，參考 [auto_templates_exam.json](https://github.com/ai-lish/Assessments/blob/main/exam/mimic/auto_templates_exam.json) 的 `id`、`source_question_id`、`topic`、`template_text`、`var_specs` 和 `answer_template`；[generate.js](https://github.com/ai-lish/Assessments/blob/main/exam/mimic/generate.js) 會按變數範圍替換題目文字。要成為正式初中練習，則要再轉成 `question-bank.json` 的 canonical 題型，接上 `tool/generators.js` 和 `tool/validators.js`，最後由 `templates/student.html` 產生學生頁面。

例如，變式模板可以先用以下結構表達「指數律」題目：

```json
{
  "id": "s1-term3-p2-q07",
  "source_question_id": "2025S1Q07",
  "topic": "指數律",
  "template_text": "化簡 x^{a} · x^{b}",
  "var_specs": {
    "a": { "min": 2, "max": 12, "step": 1 },
    "b": { "min": 2, "max": 8, "step": 1 }
  },
  "answer_template": "x^({a}+{b})"
}
```

模板不是用來直接改成一份新練習的成品。題目內容應放進題目庫所需的資料欄位，學生版外殼則由 Assessment 的產生工具處理；這樣題目、判分器和學生頁面的責任可以分開審核。

### 2. Gemini 先做每課初稿，Claude 逐題審閱

每一課先交給 Gemini 產生初稿，最少包括年級、學期、課題、題型 key、難度、變數範圍、題目文字、正確答案、解題步驟、`generator` 和 `validator` 建議。初稿交給 Claude 後，Claude 要逐題核對：

- 計算、答案、單位和接受答案是否一致；
- 題目是否符合該課的學習目標、程度和題型輸入限制；
- 題目文字、LaTeX、圖像或互動要求是否能在學生模板中正常顯示；
- 解題步驟是否足夠讓學生理解，而不是只列最後答案。

Claude 的結果要分成「通過」、「必須修改」和「需要教師決定」，並保留題目編碼或題型 key，讓下一回合可以精準修改。

### 3. 回合增加後的交接界線

多個回合後，題目庫、模板、測試輸出和審閱意見會變得複雜；Gemini 未必能在一次回覆中完整掌握所有細節。當出現遺漏檔案、互相矛盾的版本、重複修改或無法確認整體狀態時，將目前成果、審閱清單和版本資訊交給 Codex，由 Codex 整理檔案、執行檢查，並按需要發佈到 GitHub。

這個交接不是重新開始。交接包應保留：目前分支或 PR、最後通過的題目清單、未解決問題、Assessment repo 的目標路徑、`sourcePreset`、`questionCodes`、`generatedAt` 和 `bankHash`。發佈腳本 [publish_exercise.cjs](https://github.com/ai-lish/Assessments/blob/main/scripts/publish_exercise.cjs) 會要求這些發佈資料，並拒絕不安全的目標路徑或檔名。

### 4. 改為線上 GitHub 審閱

發佈 PR 後，Claude 改在 GitHub 線上檢視實際 diff、題目庫欄位、模板引用和測試結果，逐項提出 review comment。Codex 按 comment 修改同一個分支，重新執行 Assessment 的檢查，再回覆修改位置和驗證結果；需要教師判斷的內容則保留為未決項目，不自行猜測。

### 5. 最終拆分與回寫 Assessment repo

完成審閱後，把成果拆成三層並更新 [Assessment repo](https://github.com/ai-lish/Assessments)：

1. **題目層**：把每課的題型、參數、答案、教學步驟和分類欄位整理到 `question-bank.json`（或其組裝來源），並使用既有的 `generator`／`validator` registry。
2. **模板層**：保留共用學生頁面於 `templates/student.html`；只有確實需要的互動、回饋或列印行為才修改模板。
3. **練習層**：按 `exercises/{學年}/{年級}/{學期}/` 的規則產生學生版 HTML，連同發佈包開 PR，讓題目定義和可派發檔案都有明確的審核記錄。

## 可交給任一 agent 的提示語

以下提示語以 Assessment repo 的實際模板和欄位為準；可把 `[方括號]` 內容替換後交給 Gemini、Claude 或 Codex。每次交接都附上檔案路徑和版本日期，不要只貼截圖或一段孤立題目。

```text
你是 ai-lish/Assessments 的教材及題型維護 agent，正在製作「[年級] [學期] [課題]」練習。

先閱讀並遵守：
1. question-bank.json 的 _schema_guide：正式題型資料欄位和 generator/validator contract；
2. templates/student.html：學生版外殼、輸入類型、MathJax、回饋和 PDF 行為；
3. tool/generators.js、tool/validators.js：可重用的產生和判分 registry；
4. 相關 preset：題型和題數的正式組合；
5. exam/mimic/auto_templates_exam.json、exam/mimic/generate.js：變式模板的欄位及變數替換方式；
6. scripts/gen_exercise_html.cjs、scripts/publish_exercise.cjs：生成學生版和建立發佈包的規則；
7. exercises/README.md、docs/question-codes.md：正式輸出路徑、命名、隨機題目規則和題目編碼格式。

工作要求：
- 只處理本回合指定的課題和檔案，不覆蓋其他題型；
- 先找出最相近的現有題型或變式模板，不要自行發明另一套資料結構；
- 把初稿拆成兩部分：A. 題目資料／題型 metadata；B. 可重用的變式模板。正式學生練習要將 A 接到 question-bank 的 generator／validator registry；
- 題目資料最少提供 key、name、category、difficulty、grade、term、topicKey、topicName、type、checkType、params_schema、answers、displayAnswer、steps、pdfText、schemaVersion、part、validator、generator、code 和 source；需要時再加入 defaultParams、options、answerSpec、figure 或 referenceAnswer；
- 變式模板提供穩定 id、source_question_id、topic、template_text、變數名稱、每個變數的 min/max/step，以及 answer_template；
- 用實際可驗證的整數／分數範圍產生參數，避免答案超出判分器可接受格式；
- 題目必須保留符合 docs/question-codes.md 的穩定 question code；
- JSON 內的 LaTeX 按 repo 規則轉義；不要把可執行 JavaScript 放進題目庫；
- 標示仍需教師決定的內容，不要自行補造來源、答案或課堂成效。

本次角色是：[Gemini 初稿／Claude 審閱／Codex 發佈]。
- Gemini：先產生變式模板和題目規格，列出每題的答案推導、參數邊界及可能風險。
- Claude：逐題核對題目與答案、隨機參數、解題步驟、難度、語文、LaTeX、圖形及 generator/validator 相容性，輸出「通過／必須修改／需要教師決定」清單。
- Codex：根據已通過清單修改正式檔案，執行 repo 指定測試；若要發佈，使用 scripts/publish_exercise.cjs 要求的 targetPath、fileName、sourcePreset、mode、questionCodes、generatedAt 和 bankHash，建立可審核的分支和 PR。

交接規則：多輪修改後若 Gemini 無法完整掌握檔案，交給 Codex 的內容必須包括目前工作樹或 PR、最後通過清單、review comments、未解決問題和版本資訊。PR 建立後，Claude 直接在線上 GitHub review，Codex 按 comment 修改並重新測試。

回覆格式：
1. 修改或新增的檔案；
2. 題目 key／question code／變式模板 id 對照表；
3. 題目層、模板層和練習層的資料流；
4. 未解決問題和需要教師決定的項目；
5. 執行過的檢查及結果；
6. 下一位 agent 可以直接接手的指示。
```

每次回合都將提示語版本、模型、日期和 review 結果寫回本記錄，並在正式更新 Assessment repo 前確認題目層、模板層和練習層沒有混在同一個檔案內。

## 4. 教材版本與資源

附上教材連結、版本日期及使用方式。若同時有學生版、教師版或答案，分別標明，方便下次備課時找到正確版本。

## 5. 試用觀察

實際使用後，再補充學生在哪一步停住、哪些提示有幫助，以及完成情況如何對應學習目標。未試用的教材可直接記為「待試用」，不預先填寫成效。

## 6. 修訂與下一步

每次修改記下日期、改了甚麼、修改原因及預期改善；下一次試用後再核對。保留仍未解決的問題，作為下一版的起點。

## 可複製的記錄大綱

```markdown
# 教材名稱

## 基本資料
- 年級／課題：
- 版本／日期：
- 狀態：設計中／待試用／已試用／修訂中
- 教材連結：

## 學習目標與先備知識

## 學習難點與依據

## 題目、活動與設計取捨

## AI 協助與人工核對（如適用）

## 試用觀察（未試用可填「待試用」）

## 修訂紀錄
- 日期：
- 修改內容與原因：
- 下次要觀察的表現：
```
