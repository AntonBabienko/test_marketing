import { NextResponse } from 'next/server';
import { normalize } from '@/lib/normalize';
import { classify } from '@/lib/classify';
import { generateSummary } from '@/lib/ai-summary';

/**
 * POST /api/lead
 * 
 * Receives a lead form submission, processes it through:
 * 1. Validation
 * 2. Normalization
 * 3. AI Summary (OpenAI)
 * 4. Classification (scoring)
 * 5. Webhook to n8n (Google Sheets + Telegram)
 * 
 * Returns the enriched lead data
 */
export async function POST(request) {
  try {
    // 1. Parse incoming JSON
    const body = await request.json();

    // 2. Basic validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Поля 'name' та 'email' є обов'язковими" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Невірний формат email' },
        { status: 400 }
      );
    }

    // 3. Normalize data
    const normalized = normalize(body);
    console.log('[Lead API] Normalized:', JSON.stringify(normalized));

    // 4. Generate AI Summary
    const aiSummary = await generateSummary(normalized);
    console.log('[Lead API] AI Summary:', aiSummary);

    // 5. Classify lead
    const classification = classify(normalized);
    console.log('[Lead API] Classification:', JSON.stringify(classification));

    // 6. Build enriched payload
    const enrichedLead = {
      original: body,
      normalized,
      ai_summary: aiSummary,
      classification,
      processed_at: new Date().toISOString(),
    };

    // 7. Send to n8n webhook (blocking for Serverless environment)
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookDebug = { configured: Boolean(webhookUrl) };
    if (webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enrichedLead),
        });
        const responseText = await res.text();
        console.log('[Lead API] n8n webhook response:', res.status, responseText.slice(0, 500));
        webhookDebug.status = res.status;
        webhookDebug.body = responseText.slice(0, 500);
      } catch (err) {
        console.error('[Lead API] n8n webhook error:', err.message);
        webhookDebug.error = err.message;
      }
    } else {
      console.warn('[Lead API] N8N_WEBHOOK_URL not set, skipping webhook');
    }

    // 8. Return enriched result
    return NextResponse.json({
      success: true,
      message: 'Заявку успішно отримано та оброблено',
      data: {
        id: generateLeadId(),
        summary: aiSummary,
        classification: {
          score: classification.score,
          category: classification.category,
          label: classification.label,
        },
        submitted_at: normalized.submitted_at,
      },
      _debug: { webhook: webhookDebug },
    });
  } catch (error) {
    console.error('[Lead API] Error:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lead — health check & API info
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Lead Processing MVP',
    version: '1.0.0',
    endpoints: {
      'POST /api/lead': 'Submit a lead for processing',
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Generate a simple lead ID (timestamp-based)
 */
function generateLeadId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `lead_${ts}_${rand}`;
}
