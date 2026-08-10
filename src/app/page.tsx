import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-20 text-center sm:py-28">
      <span className="mb-4 -rotate-2 rounded-flyer border-2 border-brick bg-paper px-3 py-1 font-stamp text-brick">
        pinned to the board
      </span>

      <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-tight text-ink sm:text-6xl">
        Campus Lost <span className="text-brick">&amp;</span> Found
      </h1>

      <p className="mt-6 max-w-xl text-lg text-ink-faint">
        Find it. Report it. Get it back. A shared board where the campus
        community reports lost items, posts what they&apos;ve found, and
        reunites things with their owners.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button href="/browse" variant="primary" className="px-6 py-3 text-base">
          Browse Items
        </Button>
        <Button href="/report" variant="secondary" className="px-6 py-3 text-base">
          Report Item
        </Button>
      </div>
    </div>
  );
}
