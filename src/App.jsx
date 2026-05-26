import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('Casual');
  const [extraContext, setExtraContext] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!emailContent.trim()) return;
    
    setIsLoading(true);
    setGeneratedReply('');

    try {
      const res = await axios.post('https://mailcraft-backend-axsf.onrender.com/api/email/generate', {
        emailContent, 
        tone: extraContext ? `${tone}. Extra context: ${extraContext}` : tone
      });
      setGeneratedReply(res.data);
    } catch (error) {
      console.error(error);
      setGeneratedReply("Error: Unable to connect to the AI engine. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReply);
    alert("Copied to clipboard!");
  };

  const openInEmailClient = () => {
    // This opens the default email app (Gmail, Apple Mail, etc.) with the text pre-filled
    const mailtoLink = `mailto:?subject=Reply&body=${encodeURIComponent(generatedReply)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="app-wrapper">
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">✉️</span>
          <span className="logo-text">MailCraft</span>
        </div>
        <button className="sign-in-btn">Sign In</button>
      </nav>

      {/* Header Area */}
      <header className="hero-section">
        <h1 className="hero-title">Write the perfect reply — in seconds.</h1>
      </header>

      {/* Main Workspace Grid */}
      <main className="main-container">
        
        {/* Left Column: Input Controls */}
        <section className="card input-section">
          
          <div className="step-group">
            <label className="step-label"><span className="step-number">01</span> PASTE THE EMAIL YOU RECEIVED</label>
            <textarea 
              className="modern-input textarea-main"
              placeholder="Paste the email you received here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
            />
          </div>

          <div className="step-group">
            <label className="step-label"><span className="step-number">02</span> CHOOSE YOUR TONE</label>
            <div className="chip-container">
              {[
                { name: 'Professional', icon: '💼' }, 
                { name: 'Casual', icon: '😊' }, 
                { name: 'Friendly', icon: '🤝' }, 
                { name: 'Urgent', icon: '⚡' }
              ].map((t) => (
                <button 
                  key={t.name}
                  className={`chip ${tone === t.name ? 'active-chip' : ''}`}
                  onClick={() => setTone(t.name)}
                >
                  <span className="chip-icon">{t.icon}</span> {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="step-group">
            <label className="step-label"><span className="step-number">03</span> EXTRA INSTRUCTIONS (optional)</label>
            <input 
              type="text" 
              className="modern-input"
              placeholder="e.g. Keep it short, mention I'm on leave..."
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
            />
          </div>

          <button 
            className="generate-btn primary-action" 
            onClick={handleGenerate} 
            disabled={isLoading || !emailContent.trim()}
          >
            {isLoading ? (
              <span className="loading-state">
                <span className="spinner"></span> Composing...
              </span>
            ) : '✨ Generate Reply'}
          </button>
        </section>

        {/* Right Column: AI Output */}
        <section className="card output-section">
          <div className="output-header">
            <label className="step-label"><span className="step-number">04</span> YOUR AI DRAFT</label>
            
            {/* New Action Buttons */}
            {generatedReply && !isLoading && (
              <div className="action-buttons">
                <button className="icon-btn" onClick={copyToClipboard} title="Copy to clipboard">
                  📋 Copy
                </button>
                <button className="icon-btn highlight-btn" onClick={openInEmailClient} title="Send via Email">
                  📧 Open in Mail
                </button>
              </div>
            )}
          </div>
          
          <div className={`output-content ${!generatedReply ? 'empty-state' : ''}`}>
            {isLoading ? (
              <div className="skeleton-loader">
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
            ) : generatedReply ? (
              <p className="final-text">{generatedReply}</p>
            ) : (
              <p className="placeholder-text">Your polished, professional reply will appear here.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;