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
    setGeneratedReply(''); // Clear previous reply

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
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo">✉️ MailCraft</div>
        <p className="subtitle">Compose perfect replies, effortlessly.</p>
      </header>

      {/* Main Workspace */}
      <main className="workspace">
        
        {/* Left Panel: Input */}
        <div className="panel input-panel">
          <label className="section-title">Incoming Message</label>
          <textarea 
            className="text-box"
            placeholder="Paste the email you received here..."
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
          />

          <label className="section-title mt-4">Response Tone</label>
          <div className="tone-selector">
            {['Professional', 'Casual', 'Friendly', 'Urgent'].map((t) => (
              <button 
                key={t}
                className={`tone-btn ${tone === t ? 'active' : ''}`}
                onClick={() => setTone(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <label className="section-title mt-4">Extra Instructions (Optional)</label>
          <input 
            type="text" 
            className="input-field"
            placeholder="e.g., 'Keep it brief', 'Mention I am on leave'"
            value={extraContext}
            onChange={(e) => setExtraContext(e.target.value)}
          />

          {/* The "Gmail" Action Button */}
          <button 
            className="generate-btn" 
            onClick={handleGenerate} 
            disabled={isLoading || !emailContent.trim()}
          >
            {isLoading ? '✨ Composing...' : '✨ Generate Reply'}
          </button>
        </div>

        {/* Right Panel: Output */}
        <div className="panel output-panel">
          <div className="output-header">
            <label className="section-title">AI Draft</label>
            {generatedReply && (
              <button className="copy-btn" onClick={copyToClipboard}>
                📋 Copy
              </button>
            )}
          </div>
          
          <div className={`output-box ${!generatedReply ? 'empty' : ''}`}>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : generatedReply ? (
              <p className="draft-text">{generatedReply}</p>
            ) : (
              <p className="placeholder-text">Your AI-generated reply will appear here...</p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;