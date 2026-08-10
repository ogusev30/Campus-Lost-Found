export type AchievementId =
  | "firstPin"
  | "prolificReporter"
  | "fullCircle"
  | "greatFinder"
  | "trustedOwner";

export interface AchievementStats {
  itemsReported: number;
  itemsReturned: number;
  claimsAccepted: number;
  hasLostReport: boolean;
  hasFoundReport: boolean;
}

interface AchievementDef {
  id: AchievementId;
  threshold: number;
  current: (stats: AchievementStats) => number;
}

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
];
