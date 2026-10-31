/**
 * 想法階段的 id 與顯示文字集中在這裏。
 * 新增一項想法更新時，按日期順序在 idea.log 末端加入 stage、date 和 summary，並把 idea.status 設為最新階段；
 * 如需新增階段，在 IDEA_STAGE_IDS 加入 id，再在 IDEA_STAGES 加入對應顯示文字。
 */
export const IDEA_STAGE_IDS = ['concept', 'build', 'update', 'done'] as const;

export type IdeaStageId = (typeof IDEA_STAGE_IDS)[number];

export const IDEA_STAGES = [
  { id: IDEA_STAGE_IDS[0], label: '構思' },
  { id: IDEA_STAGE_IDS[1], label: '實作' },
  { id: IDEA_STAGE_IDS[2], label: '更新' },
  { id: IDEA_STAGE_IDS[3], label: '完結' },
] as const;

export type IdeaStage = (typeof IDEA_STAGES)[number];
