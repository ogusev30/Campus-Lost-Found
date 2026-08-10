"use client";

import { useState, useTransition, type SVGProps } from "react";
import Link from "next/link";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { formatMessage, cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { AchievementId } from "@/lib/achievements/definitions";
import type { Notification } from "@/lib/types/database.types";

function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

function messageFor(notification: Notification, dict: Dictionary): string {
  const payload = notification.payload;
  switch (notification.type) {
    case "match_found":
      return formatMessage(dict.notifications.matchFound, {
        itemTitle: payload.itemTitle ?? "",
        score: payload.score ?? 0,
      });
    case "claim_accepted":
      return formatMessage(dict.notifications.claimAccepted, {
        itemTitle: payload.itemTitle ?? "",
      });
    case "item_returned":
      return formatMessage(dict.notifications.itemReturned, {
        itemTitle: payload.itemTitle ?? "",
      });
    case "achievement_unlocked": {
      const achievementId = payload.achievementId as AchievementId | undefined;
      const name = achievementId ? dict.achievements.items[achievementId].title : "";
      return formatMessage(dict.notifications.achievementUnlocked, { achievementName: name });
    }
    default:
      return "";
  }
}

export function NotificationBell({
  notifications,
  dict,
}: {
  notifications: Notification[];
  dict: Dictionary;
}) {
  const [items, setItems] = useState(notifications);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const unreadCount = items.filter((notification) => !notification.read).length;

  function handleOpenNotification(notification: Notification) {
    if (!notification.read) {
      setItems((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );
      startTransition(() => {
        markNotificationRead(notification.id);
      });
    }
    setOpen(false);
  }

  function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    startTransition(() => {
      markAllNotificationsRead();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={dict.notifications.title}
        className="relative flex h-8 w-8 items-center justify-center rounded-flyer border-2 border-ink/10 text-ink transition-colors hover:border-ink/30"
      >
        <BellIcon className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-paper-dark bg-brick px-1 font-display text-[10px] font-bold text-paper">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 max-w-[90vw] rounded-flyer border-2 border-ink bg-paper-dark p-3 shadow-flyer">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-display text-sm font-bold text-ink">{dict.notifications.title}</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="font-display text-xs font-semibold text-ink-faint hover:text-brick"
                >
                  {dict.notifications.markAllRead}
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-faint">{dict.notifications.empty}</p>
            ) : (
              <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
                {items.map((notification) => {
                  const content = (
                    <div
                      className={cn(
                        "rounded-flyer border-2 px-2.5 py-2 text-sm transition-colors",
                        notification.read
                          ? "border-transparent text-ink-faint"
                          : "border-ink/10 bg-mustard/10 text-ink",
                      )}
                    >
                      {messageFor(notification, dict)}
                    </div>
                  );

                  return (
                    <li key={notification.id}>
                      {notification.link ? (
                        <Link
                          href={notification.link}
                          onClick={() => handleOpenNotification(notification)}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => handleOpenNotification(notification)}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
