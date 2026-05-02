/**
 * Freshness Score Calculator
 * Returns a score 0–100 and a badge label based on harvest date and product category.
 */

const DECAY_RATES = {
  vegetables: 8,   // % per day — leafy/general veg
  fruits: 5,
  grains: 0.5,
  pulses: 0.3,
  spices: 0.2,
  dairy: 15,
  other: 5
};

const BADGE = (score) => {
  if (score >= 80) return { label: 'Fresh',    color: 'green'  };
  if (score >= 50) return { label: 'Good',     color: 'yellow' };
  if (score >= 20) return { label: 'Moderate', color: 'orange' };
  return             { label: 'Old',      color: 'red'    };
};

export const getFreshnessScore = (harvestDate, category = 'other') => {
  if (!harvestDate) return null;

  const daysSince = Math.floor(
    (Date.now() - new Date(harvestDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const rate = DECAY_RATES[category] ?? DECAY_RATES.other;
  const score = Math.max(0, Math.round(100 - daysSince * rate));
  const badge = BADGE(score);

  return { score, daysSince, ...badge };
};

export const injectFreshness = (product) => {
  const freshness = getFreshnessScore(product.harvestDate, product.category);
  return { ...product, freshness };
};
