'use client';

import { useState, useRef } from 'react';

export default function HomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Помилка сервера');
      }

      setResult(data);
      formRef.current?.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeResult() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="page-wrapper">
      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-badge">
          <span className="dot"></span>
          Приймаємо заявки
        </div>
        <h1>Запустіть свій маркетинг на повну</h1>
        <p>
          Залиште заявку — ми проаналізуємо ваші потреби та підберемо оптимальне рішення для
          зростання вашого бізнесу
        </p>
      </section>

      {/* ===== FEATURES STRIP ===== */}
      <div className="features-strip">
        <div className="feature-item">
          <div className="icon">⚡</div>
          <span>Відповідь за 2 години</span>
        </div>
        <div className="feature-item">
          <div className="icon">🎯</div>
          <span>Індивідуальний підхід</span>
        </div>
        <div className="feature-item">
          <div className="icon">📊</div>
          <span>Аналітика результатів</span>
        </div>
      </div>

      {/* ===== FORM SECTION ===== */}
      <section className="form-section">
        <div className="form-card">
          <h2>Залишити заявку</h2>
          <p className="form-subtitle">Заповніть форму і ми зв&apos;яжемося з вами найближчим часом</p>

          <form ref={formRef} onSubmit={handleSubmit} id="lead-form">
            <div className="form-grid">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="name">
                  Ваше ім&apos;я <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Олександр Петренко"
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="alex@company.ua"
                  required
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">Телефон</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+380 67 123 45 67"
                />
              </div>

              {/* Company */}
              <div className="form-group">
                <label htmlFor="company">Компанія</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  placeholder="Назва компанії"
                />
              </div>

              {/* Service */}
              <div className="form-group">
                <label htmlFor="service">Послуга</label>
                <select id="service" name="service" defaultValue="">
                  <option value="" disabled>
                    Оберіть послугу
                  </option>
                  <option value="smm">SMM просування</option>
                  <option value="ppc">Контекстна реклама (PPC)</option>
                  <option value="seo">SEO оптимізація</option>
                  <option value="branding">Брендинг та дизайн</option>
                  <option value="web">Розробка сайту</option>
                  <option value="strategy">Маркетингова стратегія</option>
                  <option value="content">Контент-маркетинг</option>
                  <option value="email">Email маркетинг</option>
                  <option value="complex">Комплексний маркетинг</option>
                  <option value="other">Інше</option>
                </select>
              </div>

              {/* Budget */}
              <div className="form-group">
                <label htmlFor="budget">Бюджет (грн)</label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  placeholder="напр. 50000 або 50k"
                />
              </div>

              {/* Urgency */}
              <div className="form-group full-width">
                <label htmlFor="urgency">Терміновість</label>
                <select id="urgency" name="urgency" defaultValue="">
                  <option value="" disabled>
                    Коли потрібно розпочати?
                  </option>
                  <option value="asap">Якнайшвидше</option>
                  <option value="this_week">Цього тижня</option>
                  <option value="this_month">Цього місяця</option>
                  <option value="this_quarter">Цього кварталу</option>
                  <option value="next_quarter">Наступного кварталу</option>
                  <option value="no_rush">Не терміново</option>
                </select>
              </div>

              {/* Message */}
              <div className="form-group full-width">
                <label htmlFor="message">Повідомлення</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Розкажіть детальніше про ваш проєкт, цілі та очікування..."
                  rows={4}
                ></textarea>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
              id="submit-btn"
            >
              <span className="btn-content">
                <span className="spinner"></span>
                <span className="btn-text">Надіслати заявку →</span>
              </span>
            </button>
          </form>
        </div>
      </section>

      {/* ===== RESULT OVERLAY ===== */}
      {(result || error) && (
        <div className={`result-overlay visible`} onClick={closeResult}>
          <div
            className={`result-card ${error ? 'error' : 'success'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {error ? (
              <>
                <div className="result-icon">❌</div>
                <h3>Помилка</h3>
                <p className="result-summary">{error}</p>
              </>
            ) : (
              <>
                <div className="result-icon">✅</div>
                <h3>Заявку отримано!</h3>
                <p className="result-summary">{result.data?.summary}</p>

                <div className="result-meta">
                  <div className="result-meta-row">
                    <span className="label">ID заявки</span>
                    <span className="value">{result.data?.id}</span>
                  </div>
                  <div className="result-meta-row">
                    <span className="label">Класифікація</span>
                    <span className="value">{result.data?.classification?.label}</span>
                  </div>
                  <div className="result-meta-row">
                    <span className="label">Скоринг</span>
                    <span className="value">{result.data?.classification?.score}/100</span>
                  </div>
                </div>
              </>
            )}

            <button className="result-close-btn" onClick={closeResult}>
              Закрити
            </button>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <p>LeadFlow MVP · {new Date().getFullYear()} · Powered by AI + n8n</p>
      </footer>
    </div>
  );
}
