import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('Professional');
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

  return (
    <div className="app-wrapper">
      {/* Sticky Top Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">✨</span>
          <span className="logo-text">MailCraft</span>
        </div>
        <button className="sign-in-btn">Sign In</button>
      </nav>

      {/* Main Workspace Grid */}
      <main className="main-container">
        
        {/* Left Column: Input Controls */}
        <section className="card input-section">
          <h2 className="section-heading">Compose Reply</h2>
          
          <div className="input-group">
            <label>Original Email</label>
            <textarea 
              className="modern-input textarea-main"
              placeholder="Paste the email you received here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Select Tone</label>
            <div className="chip-container">
              {['Professional', 'Casual', 'Friendly', 'Urgent'].map((t) => (
                <button 
                  key={t}
                  className={`chip ${tone === t ? 'active-chip' : ''}`}
                  onClick={() => setTone(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Extra Instructions (Optional)</label>
            <input 
              type="text" 
              className="modern-input"
              placeholder="e.g., 'Mention I am out of office until Monday'"
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
                <span className="spinner"></span> Generating...
              </span>
            ) : 'Generate Perfect Reply'}
          </button>
        </section>

        {/* Right Column: AI Output */}
        <section className="card output-section">
          <div className="output-header">
            <h2 className="section-heading">AI Draft</h2>
            {generatedReply && (
              <button className="copy-action" onClick={copyToClipboard}>
                Copy Text
              </button>
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