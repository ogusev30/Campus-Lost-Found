export type ItemType = "lost" | "found";
export type ItemStatus = "open" | "claimed" | "returned" | "closed";
export type ClaimStatus = "pending" | "accepted" | "rejected";

export const CATEGORIES = [
  "Electronics",
  "Wallet / Money",
  "Keys",
  "Bag",
  "Clothing",
  "Books",
  "ID / Cards",
  "Accessories",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface Item {
  id: string;
  owner_id: string;
  type: ItemType;
  title: string;
  description: string;
  category: Category;
  location: string;
  item_date: string;
  image_url: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  message: string;
  status: ClaimStatus;
  created_at: string;
}

export interface OwnerClaimView {
  claim_id: string;
  item_id: string;
  claimant_id: string;
  claimant_name: string | null;
  claimant_email: string | null;
  message: string;
  status: ClaimStatus;
  created_at: string;
}

export interface ItemMatch {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  score: number;
  dismissed_by_lost_owner: boolean;
  dismissed_by_found_owner: boolean;
  created_at: string;
}

export type NotificationType =
  | "match_found"
  | "claim_accepted"
  | "item_returned"
  | "achievement_unlocked";

export interface NotificationPayload {
  itemId?: string;
  itemTitle?: string;
  matchedItemId?: string;
  matchedItemTitle?: string;
  score?: number;
  achievementId?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  payload: NotificationPayload;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface LeaderboardRow {
  user_id: string;
  name: string | null;
  points: number;
}
