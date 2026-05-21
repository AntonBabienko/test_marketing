/**
 * AI Summary generation using OpenAI GPT-4o-mini
 * Generates a concise 2-3 sentence summary of the lead in Ukrainian
 * Falls back to template-based summary if OpenAI is unavailable
 */

const SYSTEM_PROMPT = `Ти — асистент маркетингової агенції. Пиши короткі резюме заявок потенційних клієнтів українською мовою. 2-3 речення. Вказуй: хто звернувся, яка послуга потрібна, бюджет і терміновість. Не додавай оцінок, рекомендацій та зайвих слів.`;

/**
 * Generate AI summary via Gemini API
 * @param {Object} normalized - Normalized lead data
 * @returns {Promise<string>} AI-generated summary
 */
export async function generateSummary(normalized) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[AI Summary] GEMINI_API_KEY not set, using fallback summary');
    return generateFallbackSummary(normalized);
  }

  const userPrompt = `Ім'я: ${normalized.name}
Компанія: ${normalized.company || 'не вказано'}
Послуга: ${formatService(normalized.service)}
Бюджет: ${normalized.budget_raw || 'не вказано'}
Терміновість: ${formatUrgency(normalized.urgency)}
Повідомлення: ${normalized.message || 'не вказано'}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          { role: 'user', parts: [{ text: userPrompt }] }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 300,
        }
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[AI Summary] Gemini API error:', err);
      return generateFallbackSummary(normalized);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || generateFallbackSummary(normalized);
  } catch (error) {
    console.error('[AI Summary] Request failed:', error.message);
    return generateFallbackSummary(normalized);
  }
}

/**
 * Fallback template-based summary when OpenAI is unavailable
 */
function generateFallbackSummary(normalized) {
  const parts = [];

  if (normalized.name) {
    parts.push(
      normalized.company
        ? `${normalized.name} з компанії "${normalized.company}" залишив заявку`
        : `${normalized.name} залишив заявку`
    );
  } else {
    parts.push('Отримано нову заявку');
  }

  const details = [];

  if (normalized.service && normalized.service !== 'not_specified') {
    details.push(`послуга — ${formatService(normalized.service)}`);
  }
  if (normalized.budget_numeric) {
    details.push(`бюджет — ${normalized.budget_numeric.toLocaleString('uk-UA')} грн`);
  }
  if (normalized.urgency && normalized.urgency !== 'not_specified') {
    details.push(`терміновість — ${formatUrgency(normalized.urgency)}`);
  }
  if (details.length > 0) {
    parts.push(details.join(', '));
  }

  if (normalized.message) {
    const shortMsg =
      normalized.message.length > 80
        ? normalized.message.substring(0, 80) + '...'
        : normalized.message;
    parts.push(`Деталі: "${shortMsg}"`);
  }

  return parts.join('. ') + '.';
}

/**
 * Format urgency code to human-readable Ukrainian text
 */
function formatUrgency(urgency) {
  const map = {
    asap: 'Якнайшвидше',
    this_week: 'Цього тижня',
    this_month: 'Цього місяця',
    this_quarter: 'Цього кварталу',
    next_quarter: 'Наступного кварталу',
    no_rush: 'Не терміново',
    not_specified: 'Не вказано',
  };
  return map[urgency] || urgency;
}

/**
 * Format service code to human-readable Ukrainian text
 */
function formatService(service) {
  const map = {
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
  return map[service] || service;
}
