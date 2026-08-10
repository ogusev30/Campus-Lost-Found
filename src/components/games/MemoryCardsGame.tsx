"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { saveGameScore } from "@/lib/actions/games";
import { formatMessage, cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionary";

const SYMBOLS = ["🎧", "👛", "🔑", "🎒", "🧣", "📚", "🪪", "🕶️"];

interface Card {
  id: number;
  symbol: string;
  isMatched: boolean;
}

function buildDeck(): Card[] {
  const deck = [...SYMBOLS, ...SYMBOLS].map((symbol, index) => ({
    id: index,
    symbol,
    isMatched: false,
  }));

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function MemoryCardsGame({ dict }: { dict: Dictionary["games"]["memoryCards"] }) {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const savedRef = useRef(false);
  const won = deck.every((card) => card.isMatched);

  useEffect(() => {
    if (flipped.length !== 2) return;

    // The pair-resolution outcome (match vs. no-match) can only be known
    // once both cards are flipped, so the move count and match state are
    // genuinely driven by this async two-step interaction, not derivable
    // from other render state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMoves((m) => m + 1);
    const [a, b] = flipped;

    if (deck[a].symbol === deck[b].symbol) {
      setDeck((prev) =>
        prev.map((card, i) => (i === a || i === b ? { ...card, isMatched: true } : card)),
      );
      setFlipped([]);
    } else {
      const timer = setTimeout(() => setFlipped([]), 700);
      return () => clearTimeout(timer);
    }
  }, [flipped, deck]);

  useEffect(() => {
    if (won && !savedRef.current) {
      savedRef.current = true;
      saveGameScore("memory_cards", 1);
    }
  }, [won]);

  function handleFlip(index: number) {
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (deck[index].isMatched) return;
    setFlipped((prev) => [...prev, index]);
  }

  function restart() {
    setDeck(buildDeck());
    setFlipped([]);
    setMoves(0);
    savedRef.current = false;
  }

  if (won) {
    return (
      <div className="mx-auto max-w-sm rounded-flyer border-2 border-ink bg-paper-dark p-8 text-center shadow-flyer">
        <p className="font-display text-xl font-bold text-ink">{dict.winTitle}</p>
        <p className="mt-2 text-ink-faint">{formatMessage(dict.winBody, { moves })}</p>
        <Button variant="primary" className="mt-6" onClick={restart}>
          {dict.title}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-4 text-center font-display text-sm font-semibold text-ink">
        {formatMessage(dict.moves, { count: moves })}
      </p>

      <div className="grid grid-cols-4 gap-2">
        {deck.map((card, index) => {
          const isFaceUp = card.isMatched || flipped.includes(index);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(index)}
              disabled={isFaceUp}
              aria-label={isFaceUp ? card.symbol : "hidden card"}
              className={cn(
                "flex aspect-square items-center justify-center rounded-flyer border-2 text-2xl transition-colors",
                card.isMatched
                  ? "border-mustard-dark bg-mustard/20"
                  : isFaceUp
                    ? "border-ink bg-paper"
                    : "border-ink bg-ink text-paper hover:bg-ink-light",
              )}
            >
              {isFaceUp ? card.symbol : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
