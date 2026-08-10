export type AchievementId =
  | "firstPin"
  | "prolificReporter"
  | "fullCircle"
  | "greatFinder"
  | "trustedOwner"
  | "sortItChampion"
  | "memoryMaster";

export interface AchievementStats {
  itemsReported: number;
  itemsReturned: number;
  claimsAccepted: number;
  hasLostReport: boolean;
  hasFoundReport: boolean;
  sortItBestScore: number;
  memoryCardsCompleted: boolean;
}

interface AchievementDef {
  id: AchievementId;
  threshold: number;
  current: (stats: AchievementStats) => number;
}

export const SORT_IT_WIN_SCORE = 10;

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "firstPin",
    threshold: 1,
    current: (stats) => Math.min(stats.itemsReported, 1),
  },
  {
    id: "prolificReporter",
    threshold: 5,
    current: (stats) => Math.min(stats.itemsReported, 5),
  },
  {
    id: "fullCircle",
    threshold: 2,
    current: (stats) =>
      (stats.hasLostReport ? 1 : 0) + (stats.hasFoundReport ? 1 : 0),
  },
  {
    id: "greatFinder",
    threshold: 3,
    current: (stats) => Math.min(stats.itemsReturned, 3),
  },
  {
    id: "trustedOwner",
    threshold: 3,
    current: (stats) => Math.min(stats.claimsAccepted, 3),
  },
  {
    id: "sortItChampion",
    threshold: SORT_IT_WIN_SCORE,
    current: (stats) => Math.min(stats.sortItBestScore, SORT_IT_WIN_SCORE),
  },
  {
    id: "memoryMaster",
    threshold: 1,
    current: (stats) => (stats.memoryCardsCompleted ? 1 : 0),
  },
];
