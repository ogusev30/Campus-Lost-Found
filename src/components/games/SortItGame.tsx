"use client";

import { useEffect, useRef, useState } from "react";
import { FlyerCard } from "@/components/ui/FlyerCard";
import { Button } from "@/components/ui/Button";
import { saveGameScore } from "@/lib/actions/games";
import { formatMessage, cn } from "@/lib/utils";
import { CATEGORIES, type Category } from "@/lib/types/database.types";
import type { Dictionary, SortItItem } from "@/lib/i18n/dictionary";

const ROUND_SECONDS = 30;
const OPTION_COUNT = 4;

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffled<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function nextRound(items: SortItItem[], lastName: string | null) {
  let item = pickRandom(items);
  if (items.length > 1) {
    while (item.name === lastName) item = pickRandom(items);
  }

  const distractors = shuffled(
    CATEGORIES.filter((category) => category !== item.category),
  ).slice(0, OPTION_COUNT - 1);

  const options = shuffled([item.category, ...distractors]);
  return { item, options };
}

export function SortItGame({
  dict,
  categories,
}: {
  dict: Dictionary["games"]["sortIt"];
  categories: Dictionary["categories"];
}) {
  const [round, setRound] = useState(() => nextRound(dict.items, null));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const savedRef = useRef(false);
  const gameOver = timeLeft <= 0;

  useEffect(() => {
    if (gameOver) return;
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (gameOver && !savedRef.current) {
      savedRef.current = true;
      saveGameScore("sort_it", score).then((result) => setIsNewBest(result.isNewBest));
    }
  }, [gameOver, score]);

  function handleAnswer(category: Category) {
    if (feedback || gameOver) return;

    const correct = category === round.item.category;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      setFeedback(null);
      setRound((prev) => nextRound(dict.items, prev.item.name));
    }, 450);
  }

  function restart() {
    setScore(0);
    setFeedback(null);
    setIsNewBest(false);
    savedRef.current = false;
    setRound(nextRound(dict.items, null));
    setTimeLeft(ROUND_SECONDS);
  }

  if (gameOver) {
    return (
      <FlyerCard id="sort-it-result" className="mx-auto max-w-md text-center">
        <p className="font-display text-xl font-bold text-ink">{dict.gameOverTitle}</p>
        <p className="mt-2 text-ink-faint">{formatMessage(dict.gameOverScore, { score })}</p>
        {isNewBest && (
          <p className="mt-2 font-stamp text-mustard-dark">{dict.newBest}</p>
        )}
        <Button variant="primary" className="mt-6" onClick={restart}>
          {dict.title}
        </Button>
      </FlyerCard>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-center justify-between font-display text-sm font-semibold text-ink">
        <span>{formatMessage(dict.timeLeft, { seconds: timeLeft })}</span>
        <span>{formatMessage(dict.score, { score })}</span>
      </div>

      <FlyerCard id={round.item.name} className="text-center">
        <p className="font-display text-2xl font-bold text-ink">{round.item.name}</p>

        {feedback && (
          <p
            className={cn(
              "mt-2 font-stamp text-lg",
              feedback === "correct" ? "text-mustard-dark" : "text-brick",
            )}
          >
            {feedback === "correct" ? dict.correct : dict.wrong}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          {round.options.map((category) => (
            <button
              key={category}
              type="button"
              disabled={!!feedback}
              onClick={() => handleAnswer(category)}
              className="rounded-flyer border-2 border-ink bg-paper px-3 py-2 font-display text-sm font-semibold text-ink transition-colors hover:bg-mustard/20 disabled:cursor-not-allowed"
            >
              {categories[category]}
            </button>
          ))}
        </div>
      </FlyerCard>
    </div>
  );
}
