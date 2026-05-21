const SCORING_CONFIG = {
  budget: {
    weight: 50,
    maxBudget: 100000, // бюджет при якому дається максимальний бал
  },
  urgency: {
    weight: 30,
    scores: {
      asap:         30,
      this_week:    30,
      this_month:   22,
      this_quarter: 15,
      next_quarter: 8,
      no_rush:      3,
      not_specified: 0,
    },
  },
  completeness: {
    weight: 12,
    fields: ['name', 'email', 'phone', 'company', 'message'],
  },
  message: {
    weight: 8,
    tiers: [
      { min: 200, score: 8 },
      { min: 100, score: 6 },
      { min: 50,  score: 4 },
      { min: 20,  score: 2 },
      { min: 0,   score: 0 },
    ],
  },
};

const CATEGORY_THRESHOLDS = [
  { min: 70, category: 'hot',  label: '🔥 Hot Lead' },
  { min: 40, category: 'warm', label: '🌡️ Warm Lead' },
  { min: 0,  category: 'cold', label: '❄️ Cold Lead' },
];

function scoreBudget(budget) {
  if (!budget || budget <= 0) return 0;
  const { weight, maxBudget } = SCORING_CONFIG.budget;
  return Math.min(weight, Math.round((budget / maxBudget) * weight));
}

function scoreUrgency(urgency) {
  return SCORING_CONFIG.urgency.scores[urgency] ?? 0;
}

function scoreCompleteness(normalized) {
  const { fields, weight } = SCORING_CONFIG.completeness;
  const perField = weight / fields.length;
  return fields.filter(f => normalized[f]?.length > 0).length * perField;
}

function scoreMessage(message) {
  if (!message) return 0;
  const tier = SCORING_CONFIG.message.tiers.find(t => message.length >= t.min);
  return tier ? tier.score : 0;
}

export function classify(normalized) {
  const factors = {
    budget:       scoreBudget(normalized.budget_numeric),
    urgency:      scoreUrgency(normalized.urgency),
    completeness: scoreCompleteness(normalized),
    message:      scoreMessage(normalized.message),
  };

  const score = Math.round(Object.values(factors).reduce((a, b) => a + b, 0));
  const { category, label } = CATEGORY_THRESHOLDS.find(t => score >= t.min);

  return { score, category, label, factors };
}
