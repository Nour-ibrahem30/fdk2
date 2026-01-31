import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const features = [
    {
      icon: '🎥',
      title: 'فيديوهات تعليمية',
      desc: 'مكتبة منظمة لفلسفة ومنطق وعلم النفس لجميع الصفوف الثانوية'
    },
    {
      icon: '📝',
      title: 'ملاحظات وإعلانات',
      desc: 'تواصل مباشر مع المدرس والمواد والواجبات في مكان واحد'
    },
    {
      icon: '📋',
      title: 'امتحانات أونلاين',
      desc: 'اختبر مستواك واحصل على النتائج فوراً مع متابعة التقدم'
    }
  ];

  return (
    <div className="landing">
      {/* Hero - مثل EdNuva و الطفل المبدع */}
      <section className="landing-hero">
        <div className="container">
          <div className="landing-hero-content">
            <h1 className="landing-hero-title">
              متشلش هم المذاكرة من النهاردة
            </h1>
            <p className="landing-hero-sub">
              انضم لمنصة <strong>الفيلسوف</strong> — مدرس فلسفة ومنطق. فيديوهات، ملاحظات، وامتحانات من بيتك.
            </p>
            <div className="landing-hero-actions">
              <Link to="/register" className="btn btn-primary landing-cta">
                اشترك معانا
              </Link>
              <Link to="/login" className="btn btn-outline-primary">
                دخول حسابي
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* المميزات - 3 أيقونات مثل المراجع */}
      <section className="landing-features">
        <div className="container">
          <h2 className="landing-section-title">طريقك للنجاح</h2>
          <div className="landing-features-grid">
            {features.map((f, i) => (
              <div key={i} className="landing-feature-card">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA نهائي */}
      <section className="landing-cta-section">
        <div className="container">
          <div className="landing-cta-box">
            <h2>ابدأ التعلم اليوم</h2>
            <p>سجّل دخولك أو أنشئ حساباً جديداً للوصول لكل المحتوى.</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
              <Link to="/login" className="btn btn-primary">دخول</Link>
              <Link to="/register" className="btn btn-outline-primary">إنشاء حساب</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer بسيط */}
      <footer className="landing-footer">
        <div className="container">
          <p>© منصة الفيلسوف — مدرس فلسفة ومنطق. جميع الحقوق محفوظة.</p>
        </div>
      </footer>

      <style>{`
        .landing-hero {
          background: linear-gradient(145deg, rgba(201, 162, 39, 0.12) 0%, rgba(13, 13, 15, 1) 50%);
          border-bottom: 1px solid var(--border);
          padding: 4rem 0;
        }
        .landing-hero-content { max-width: 640px; }
        .landing-hero-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        .landing-hero-sub {
          font-size: 1.15rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        .landing-hero-sub strong { color: var(--gold-light); }
        .landing-hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
        .landing-cta { padding: 0.85rem 1.75rem; font-size: 1.05rem; }
        .landing-features { padding: 4rem 0; }
        .landing-section-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--gold-light);
          text-align: center;
          margin-bottom: 2rem;
        }
        .landing-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .landing-feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem;
          text-align: center;
          transition: all 0.25s;
        }
        .landing-feature-card:hover {
          border-color: var(--gold);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }
        .landing-feature-icon { font-size: 3rem; margin-bottom: 1rem; }
        .landing-feature-card h3 {
          font-size: 1.2rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        .landing-feature-card p { color: var(--text-secondary); font-size: 0.95rem; }
        .landing-cta-section { padding: 3rem 0; }
        .landing-cta-box {
          background: linear-gradient(145deg, rgba(201, 162, 39, 0.1) 0%, var(--bg-card) 100%);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2.5rem;
          text-align: center;
        }
        .landing-cta-box h2 { color: var(--gold-light); margin-bottom: 0.5rem; font-size: 1.5rem; }
        .landing-cta-box p { color: var(--text-secondary); }
        .landing-footer {
          border-top: 1px solid var(--border);
          padding: 1.5rem 0;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default Landing;
