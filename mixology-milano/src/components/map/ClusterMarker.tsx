"use client";

interface ClusterMarkerProps {
  count: number;
  onClick: () => void;
}

export function ClusterMarker({ count, onClick }: ClusterMarkerProps) {
  const size = count < 10 ? 40 : count < 25 ? 48 : 56;

  return (
    <button
      onClick={onClick}
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-ink text-white text-sm font-semibold shadow-card border-2 border-white transition-transform duration-200 ease-smooth hover:scale-105"
    >
      {count}
    </button>
  );
}
