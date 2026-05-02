import { cn } from '@/lib/utils';

interface FreshnessProps {
  harvestDate?: string | Date | null;
  category?: string;
  showScore?: boolean;
}

const DECAY_RATES: Record<string, number> = {
  vegetables: 8,
  fruits: 5,
  grains: 0.5,
  pulses: 0.3,
  spices: 0.2,
  dairy: 15,
  other: 5
};

export function computeFreshness(harvestDate?: string | Date | null, category = 'other') {
  if (!harvestDate) return null;
  const daysSince = Math.floor(
    (Date.now() - new Date(harvestDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const rate = DECAY_RATES[category] ?? 5;
  const score = Math.max(0, Math.round(100 - daysSince * rate));
  if (score >= 80) return { score, label: 'Fresh',    color: 'green',  emoji: '🟢' };
  if (score >= 50) return { score, label: 'Good',     color: 'yellow', emoji: '🟡' };
  if (score >= 20) return { score, label: 'Moderate', color: 'orange', emoji: '🟠' };
  return               { score, label: 'Old',      color: 'red',    emoji: '🔴' };
}

export function FreshnessBadge({ harvestDate, category, showScore = false }: FreshnessProps) {
  const f = computeFreshness(harvestDate, category);
  if (!f) return null;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
      f.color === 'green'  && "bg-green-100 text-green-700",
      f.color === 'yellow' && "bg-yellow-100 text-yellow-700",
      f.color === 'orange' && "bg-orange-100 text-orange-700",
      f.color === 'red'    && "bg-red-100 text-red-600",
    )}>
      {f.emoji} {f.label}
      {showScore && <span className="opacity-70">· {f.score}%</span>}
    </span>
  );
}
