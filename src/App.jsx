import { useState } from 'react';
import axios from 'axios';
import './App.css';

const TONES = [
  { label: 'Professional', emoji: '💼' },
  { label: 'Casual', emoji: '😊' },
  { label: 'Friendly', emoji: '🤝' },
  { label: 'Urgent', emoji: '⚡' },
];

function App() {
  const [emailContent, setEmailContent]   = useState('');
  const [tone, setTone]                   = useState('Professional');
  const [extraContext, setExtraContext]   = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isLoading, setIsLoading]         = useState(false);
  const [copied, setCopied]               = useState(false);

  const handleGenerate = async () => {
    if (!emailContent.trim()) return;
    setIsLoading(true);
    setGeneratedReply('');
    try {
      const res = await axios.post(
        'https://mailcraft-backend-axsf.onrender.com/api/email/generate',
        {
          emailContent,
          tone: extraContext ? `${tone}. Extra context: ${extraContext}` : tone,
        }
      );
      setGeneratedReply(res.data);
    } catch (error) {
      console.error(error);
      setGeneratedReply('Unable to reach the server. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = emailContent.length;

  return (
    <div className="app-root">

      {/* Decorative blobs */}
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />

      <div className="app-container">

        {/* ── Header ── */}
        <header className="app-header">
          <div className="logo-wrap">
            <span className="logo-icon">✉</span>
            <span className="logo-text">MailCraft</span>
          </div>
          <p className="subtitle">Write the perfect reply — in seconds.</p>
        </header>

        {/* ── Workspace ── */}
        <main className="workspace">

          {/* ── LEFT: Input Panel ── */}
          <section className="panel input-panel">
            <div className="panel-label">
              <span className="panel-num">01</span>
              <span>Paste the email you received</span>
            </div>

            <div className="textarea-wrap">
              <textarea
                className="text-box"
                placeholder="Hey, I wanted to follow up on our meeting last week…"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
              <span className={`char-count ${charCount > 2000 ? 'warn' : ''}`}>
                {charCount} chars
              </span>
            </div>

            <div className="panel-label mt-section">
              <span className="panel-num">02</span>
              <span>Choose your tone</span>
            </div>
            <div className="tone-grid">
              {TONES.map(({ label, emoji }) => (
                <button
                  key={label}
                  className={`tone-btn ${tone === label ? 'active' : ''}`}
                  onClick={() => setTone(label)}
                >
                  <span className="tone-emoji">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="panel-label mt-section">
              <span className="panel-num">03</span>
              <span>Extra instructions <em>(optional)</em></span>
            </div>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Keep it short, mention I'm on leave…"
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
            />

            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={isLoading || !emailContent.trim()}
            >
              {isLoading
                ? <><span className="btn-spinner" /> Composing…</>
                : <><span className="btn-star">✦</span> Generate Reply</>
              }
            </button>
          </section>

          {/* ── RIGHT: Output Panel ── */}
          <section className="panel output-panel">
            <div className="output-header">
              <div className="panel-label">
                <span className="panel-num">04</span>
                <span>Your AI draft</span>
              </div>
              {generatedReply && !isLoading && (
                <button
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                  onClick={copyToClipboard}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              )}
            </div>

            <div className={`output-box ${!generatedReply && !isLoading ? 'empty' : ''}`}>
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-dots">
                    <span /><span /><span />
                  </div>
                  <p className="loading-label">Crafting your reply…</p>
                </div>
              ) : generatedReply ? (
                <p className="draft-text">{generatedReply}</p>
              ) : (
                <div className="placeholder-state">
                  <span className="placeholder-icon">✉</span>
                  <p className="placeholder-title">Your draft will appear here</p>
                  <p className="placeholder-sub">Paste an email and hit Generate Reply</p>
                </div>
              )}
            </div>

            {generatedReply && !isLoading && (
              <div className="output-footer">
                <span className="output-tag">✦ AI Draft · Review before sending</span>
              </div>
            )}
          </section>

        </main>

        <footer className="app-footer">
          Made with ♥ · MailCraft
        </footer>
      </div>
    </div>
  );
}

export default App;
