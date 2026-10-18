/**
 * 新增時段：在 AI_WORKFLOW_TIMELINE 加入一個 period，填寫 id、dateLabel、title、
 * 關聯講次 parts，並在 tabs 放入至少一個 tab。
 * 新增故事 tab：在相應時段的 tabs 陣列加入 title 和 paragraphs；paragraphs
 * 只放純文字字串，不放 HTML。元件會按陣列順序顯示任意數量的 tabs。
 */
export interface AiWorkflowEpisode {
  part: number;
  title: string;
}

export interface AiWorkflowTab {
  title: string;
  paragraphs: string[];
}

export interface AiWorkflowTimelinePeriod {
  id: string;
  dateLabel: string;
  title: string;
  parts: number[];
  tabs: AiWorkflowTab[];
}

export interface AiWorkflowSeries {
  id: string;
  title: string;
  episodes: AiWorkflowEpisode[];
}

export const AI_WORKFLOW_SERIES: AiWorkflowSeries = {
  id: 'ai-workflow',
  title: '一個數學老師的 AI 協作流程',
  episodes: [
    { part: 1, title: '由一個 AI 到一隊 AI' },
    { part: 2, title: 'private repo 做正本，public repo 做鏡像' },
    { part: 3, title: '由初稿到上線的五道關卡' },
    { part: 4, title: 'GitHub Actions 分鐘用完的應變' },
  ],
};

export const AI_WORKFLOW_TIMELINE: AiWorkflowTimelinePeriod[] = [
  {
    id: '2025-november',
    dateLabel: '2025 年 11 月',
    title: '課堂小遊戲起步',
    parts: [1],
    tabs: [
      {
        title: '概要',
        paragraphs: [
          '當時他使用一部 M2 Mac mini。',
          '他嘗試以 Gemini 製作課堂小遊戲，再放上 Google Sites。',
        ],
      },
    ],
  },
  {
    id: '2026-march',
    dateLabel: '2026 年 3 月',
    title: '開始派發工作',
    parts: [1],
    tabs: [
      {
        title: '概要',
        paragraphs: [
          '他開始以 MiniMax 驅動 OpenClaw，透過 Discord 及 Telegram 派發工作。',
          '同一階段，他建立了 GitHub repo。',
        ],
      },
    ],
  },
  {
    id: '2026-may-june',
    dateLabel: '2026 年 5–6 月',
    title: '提示語交接',
    parts: [1],
    tabs: [
      {
        title: '概要',
        paragraphs: [
          '按他的印象，當時他以免費版 Claude Chat 撰寫提示語。',
          '寫好的提示語再交給 Gemini 更新課堂小遊戲。',
        ],
      },
    ],
  },
  {
    id: '2026-june-july',
    dateLabel: '2026 年 6–7 月',
    title: '改用訂閱版 Codex',
    parts: [1],
    tabs: [
      {
        title: '概要',
        paragraphs: [
          '他開始用訂閱版 Codex 代替 Discord 的工作 thread，並用訂閱版 Claude Chat 作建議。',
          '他想用能力更強的模型；MiniMax 經常弄壞他的東西，而 Codex 未試過。',
        ],
      },
    ],
  },
  {
    id: '2026-september',
    dateLabel: '2026 年 9 月下旬',
    title: 'Claude Code 加入協作',
    parts: [1],
    tabs: [
      {
        title: '概要',
        paragraphs: [
          '他換了一部新 Mac mini，並於 9 月 28 日開始用 Claude Code；9 月 29 日寫好 Claude 與 Codex 共用的操作手冊。',
          '最初由 Claude Chat 手動轉發提示語；之後他學會 Claude Code 並設定好 session，由一個 Claude 指揮多條 Codex thread，效果良好。',
        ],
      },
    ],
  },
  {
    id: '2026-october',
    dateLabel: '2026 年 10 月',
    title: '工具和分工擴展',
    parts: [1],
    tabs: [
      {
        title: '概要',
        paragraphs: [
          '9 月 29 日起，他用 Gemini 筆記本作共享資料；10 月 4 日首次由 Codex 經瀏覽器操作 Gemini 起稿，gpt-6-astra 亦從當日起獨立審閱。',
          '10 月 12 日，他試用 MiniMax 語音為教學影片配音；10 月 17 日首次用 Manim 製作教學影片。',
          '這段期間亦涉及 GitHub 及 Google Apps Script；Claude Opus 5.5（high）指揮 Codex gpt-6-luna（max）共同操作，均成功。',
        ],
      },
    ],
  },
];
