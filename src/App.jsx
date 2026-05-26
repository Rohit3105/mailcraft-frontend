import { useState } from 'react';
import axios from 'axios';
import './App.css';

const TONES = [
  { name: 'Professional', icon: '◆', desc: 'Formal & precise'  },
  { name: 'Casual',       icon: '◉', desc: 'Easy & natural'    },
  { name: 'Friendly',     icon: '✦',  desc: 'Warm & engaging'   },
  { name: 'Urgent',       icon: '▲', desc: 'Fast & direct'     },
];

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone]                 = useState('Professional');
  const [extraContext, setExtraContext] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [copied, setCopied]             = useState(false);
  const [toast, setToast]               = useState({ show: false, message: '', type: 'ok' });

  const showToast = (message, type = 'ok') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(s => ({ ...s, show: false })), 3000);
  };

  const handleGenerate = async () => {
    if (!emailContent.trim()) return;
    setIsLoading(true);
    setGeneratedReply('');
    try {
      const res = await axios.post('https://mailcraft-backend-axsf.onrender.com/api/email/generate', {
        emailContent,
        tone: extraContext ? `${tone}. Extra context: ${extraContext}` : tone,
      });
      setGeneratedReply(res.data);
      showToast('Draft generated');
    } catch (error) {
      console.error(error);
      setGeneratedReply('Error: Unable to connect to the AI engine. Please try again.');
      showToast('Connection failed', 'err');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard');
  };

  const openInEmailClient = () => {
    const mailtoLink = `mailto:?subject=Reply&body=${encodeURIComponent(generatedReply)}`;
    window.location.href = mailtoLink;
  };

  const wordCount = generatedReply
    ? generatedReply.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="app">

      {/* Background atmosphere */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="noise" />

      {/* Toast */}
      <div className={`toast ${toast.show ? 'toast-show' : ''} ${toast.type === 'err' ? 'toast-err' : ''}`}>
        <span className={`toast-dot ${toast.type === 'err' ? 'dot-err' : 'dot-ok'}`} />
        {toast.message}
      </div>

      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-brand">
          <div className="brand-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <span className="brand-name">Mail<em>Craft</em></span>
        </div>

        <div className="header-center">
          <div className="status-pill">
            <span className="status-dot" />
            AI Engine Online
          </div>
        </div>

        <div className="header-right">
          <button className="h-btn h-btn-primary" onClick={() => showToast('Sign in coming soon')}>
            Sign In
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">Smart Email Assistant</p>
          <h1 className="hero-title">
            Compose <em>perfect replies,</em><br className="hero-br" /> effortlessly.
          </h1>
          <p className="hero-sub">
            Paste any email, choose a tone, and get a polished response in seconds.
          </p>
        </div>
      </section>

      {/* ── WORKSPACE ── */}
      <main className="workspace">

        {/* INPUT PANEL */}
        <div className="panel">
          <div className="panel-bar">
            <div className="panel-bar-left">
              <span className="panel-dots">
                <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
              </span>
              <span className="panel-title"><b>compose</b>.email</span>
            </div>
            <span className={`p-badge ${emailContent ? 'p-badge-active' : ''}`}>
              {emailContent ? `${emailContent.length} chars` : 'empty'}
            </span>
          </div>

          <div className="panel-body">

            {/* Step 1 */}
            <div className="field-group">
              <div className="field-label-row">
                <span className="f-label">
                  <span className="step-num">01</span> Incoming message
                </span>
              </div>
              <textarea
                className="input-ta"
                placeholder="Paste the email you received here…"
                value={emailContent}
                onChange={e => setEmailContent(e.target.value)}
              />
            </div>

            {/* Step 2 */}
            <div className="field-group">
              <div className="field-label-row">
                <span className="f-label">
                  <span className="step-num">02</span> Response tone
                </span>
                <span className="f-meta">{tone}</span>
              </div>
              <div className="tone-grid">
                {TONES.map(t => (
                  <button
                    key={t.name}
                    className={`tone-card ${tone === t.name ? 'tone-active' : ''}`}
                    onClick={() => setTone(t.name)}
                  >
                    <span className="tone-icon">{t.icon}</span>
                    <span className="tone-info">
                      <span className="tone-name">{t.name}</span>
                      <span className="tone-desc">{t.desc}</span>
                    </span>
                    {tone === t.name && <span className="tone-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3 */}
            <div className="field-group">
              <div className="field-label-row">
                <span className="f-label">
                  <span className="step-num">03</span> Extra instructions
                </span>
                <span className="f-meta">optional</span>
              </div>
              <input
                className="input-in"
                type="text"
                placeholder="e.g. 'Keep it brief', 'Mention I'm on leave until Monday'"
                value={extraContext}
                onChange={e => setExtraContext(e.target.value)}
              />
            </div>

            {/* Generate */}
            <div className="gen-wrap">
              <button
                className="gen-btn"
                onClick={handleGenerate}
                disabled={isLoading || !emailContent.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="spin" />
                    Generating reply…
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                    </svg>
                    Generate Reply
                    <span className="gen-shortcut">⌘ Enter</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* OUTPUT PANEL */}
        <div className="panel">
          <div className="panel-bar">
            <div className="panel-bar-left">
              <span className="panel-dots">
                <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
              </span>
              <span className="panel-title"><b>ai-draft</b>.md</span>
            </div>
            {generatedReply && (
              <span className="p-badge p-badge-active">{wordCount} words</span>
            )}
          </div>

          <div className="panel-body out-body">

            {/* Status row */}
            <div className="out-status-row">
              <span className={`out-led ${generatedReply ? 'out-led-ready' : ''}`} />
              <span className={`out-status-label ${generatedReply ? 'out-status-ready' : ''}`}>
                {isLoading ? 'Processing…' : generatedReply ? 'Draft ready' : 'Awaiting input'}
              </span>
              {generatedReply && (
                <div className="out-actions">
                  <button className={`o-btn ${generatedReply ? 'o-btn-edit' : ''}`} onClick={openInEmailClient}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Mail
                  </button>
                  <button
                    className={`o-btn ${copied ? 'o-btn-copied' : 'o-btn-copy'}`}
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="out-content">
              {isLoading ? (
                <div className="skeleton">
                  <div className="skel-line" />
                  <div className="skel-line" />
                  <div className="skel-line skel-short" />
                  <div className="skel-line" />
                  <div className="skel-line skel-med" />
                </div>
              ) : generatedReply ? (
                <p className="out-text">{generatedReply}</p>
              ) : (
                <div className="empty-state">
                  <div className="empty-ring">
                    <svg className="ring-spin" viewBox="0 0 72 72" fill="none">
                      <circle cx="36" cy="36" r="34" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                      <path d="M36 2 A34 34 0 0 1 70 36" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{position:'absolute'}}>
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <p className="empty-title">Ready to generate</p>
                  <p className="empty-sub">Fill in the email and hit Generate Reply to get your AI draft.</p>
                </div>
              )}
            </div>

            {/* Footer stats */}
            {generatedReply && (
              <div className="out-footer">
                <span className="out-stat">
                  {wordCount} words · {generatedReply.length} chars
                </span>
                <span className="out-tone-tag">{TONES.find(t => t.name === tone)?.icon} {tone}</span>
              </div>
            )}

          </div>
        </div>

      </main>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <span className="footer-text">MailCraft · AI Email Engine · v1.0</span>
      </footer>

    </div>
  );
}

export default App;
