import { ShieldCheck } from 'lucide-react';

interface OrganicBadgeProps {
  size?: 'sm' | 'md';
}

export function OrganicBadge({ size = 'md' }: OrganicBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200
      ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}>
      <ShieldCheck className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      Verified Organic
    </span>
  );
}
