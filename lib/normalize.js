/**
 * Normalize incoming lead data
 * - Cleans phone number (removes spaces, dashes, parens)
 * - Trims all string fields
 * - Parses budget to numeric value
 * - Adds metadata (timestamp, source)
 */

/**
 * Clean phone number: remove all non-digit/non-plus characters
 * @param {string} phone - Raw phone string
 * @returns {string} Cleaned phone number
 */
function cleanPhone(phone) {
  if (!phone) return '';
  // Remove spaces, dashes, parentheses, dots
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  // Normalize Ukrainian numbers
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '+38' + cleaned;
  } else if (cleaned.startsWith('38') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('8') && cleaned.length === 11) {
    cleaned = '+3' + cleaned;
  }
  return cleaned;
}

/**
 * Parse budget string to numeric value
 * Handles: "50000", "50 000", "50k", "50К", "від 20000", "$5000"
 * @param {string} budget - Raw budget string
 * @returns {number|null} Parsed budget or null
 */
function parseBudget(budget) {
  if (!budget) return null;
  const raw = String(budget).toLowerCase().trim();

  // Remove currency symbols and common words
  let cleaned = raw
    .replace(/[$€₴грнuah]/gi, '')
    .replace(/від|от|до|from|to|approx|~|приблизно/gi, '')
    .replace(/\s+/g, '')
    .trim();

  // Handle "k" / "К" suffix (thousands)
  if (/(\d+)[kкК]/i.test(cleaned)) {
    const match = cleaned.match(/(\d+)[kкК]/i);
    return parseInt(match[1]) * 1000;
  }

  // Parse plain number
  const num = parseInt(cleaned.replace(/[^\d]/g, ''));
  return isNaN(num) ? null : num;
}

/**
 * Normalize the full lead payload
 * @param {Object} data - Raw form data
 * @returns {Object} Normalized data with metadata
 */
const URGENCY_LABELS = {
  asap: 'Якнайшвидше',
  this_week: 'Цього тижня',
  this_month: 'Цього місяця',
  this_quarter: 'Цього кварталу',
  next_quarter: 'Наступного кварталу',
  no_rush: 'Не терміново',
  not_specified: 'Не вказано',
};

const SERVICE_LABELS = {
  smm: 'SMM просування',
  ppc: 'Контекстна реклама (PPC)',
  seo: 'SEO оптимізація',
  branding: 'Брендинг та дизайн',
  web: 'Розробка сайту',
  strategy: 'Маркетингова стратегія',
  content: 'Контент-маркетинг',
  email: 'Email маркетинг',
  complex: 'Комплексний маркетинг',
  other: 'Інше',
  not_specified: 'Не вказано',
};

export function normalize(data) {
  const urgency = (data.urgency || 'not_specified').trim().toLowerCase();
  const service = (data.service || 'not_specified').trim().toLowerCase();

  const normalized = {
    name: (data.name || '').trim(),
    email: (data.email || '').trim().toLowerCase(),
    phone: cleanPhone(data.phone),
    company: (data.company || '').trim(),
    budget_raw: (data.budget || '').toString().trim(),
    budget_numeric: parseBudget(data.budget),
    urgency,
    urgency_label: URGENCY_LABELS[urgency] || urgency,
    service,
    service_label: SERVICE_LABELS[service] || service,
    message: (data.message || '').trim(),
    submitted_at: new Date().toISOString(),
    source: data.source || 'landing_page',
  };

  return normalized;
}
