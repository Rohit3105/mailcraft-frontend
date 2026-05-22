import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import {
  Mail, Check, ChevronRight, History, Trash2, LogOut,
  Edit3, Send, Copy, AlertCircle, X, Zap, Sparkles,
  User, Clock, FileText, LayoutTemplate
} from 'lucide-react'

const TONES = [
  { value: 'Professional', icon: '◆', desc: 'Formal & precise',  color: '#818cf8', glow: '129,140,248' },
  { value: 'Casual',       icon: '◉', desc: 'Easy & natural',    color: '#34d399', glow: '52,211,153'  },
  { value: 'Friendly',     icon: '✦',  desc: 'Warm & engaging',   color: '#f472b6', glow: '244,114,182' },
  { value: 'Urgent',       icon: '▲',  desc: 'Fast & direct',     color: '#fb923c', glow: '251,146,60'  },
]

const fmt = (n) => n.toLocaleString()

export default function App() {
  const [emailContent, setEmailContent] = useState('')
  const [tone, setTone]                 = useState('Professional')
  const [extraContext, setExtraContext] = useState('')
  const [reply, setReply]               = useState('')
  const [isLoading, setIsLoading]       = useState(false)
  const [history, setHistory]           = useState([])
  const [copied, setCopied]             = useState(false)
  const [isEditing, setIsEditing]       = useState(false)
  const [user, setUser]                 = useState(null)
  const [isAuthOpen, setIsAuthOpen]     = useState(false)
  const [isLoginView, setIsLoginView]   = useState(true)
  const [authData, setAuthData]         = useState({ email: '', password: '' })
  const [authError, setAuthError]       = useState('')
  const [toast, setToast]               = useState({ show: false, message: '', type: 'ok' })
  const [timestamp, setTimestamp]       = useState('')
  const replyRef = useRef(null)

  const activeTone = TONES.find(t => t.value === tone)

  const showToast = (message, type = 'ok') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast(s => ({ ...s, show: false })), 3800)
  }

  useEffect(() => {
    const saved = localStorage.getItem('mailcraft_user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (user) fetchHistory()
    else {
      const local = localStorage.getItem('guest_history')
      if (local) setHistory(JSON.parse(local))
    }
  }, [user])

  const fetchHistory = async () => {
    if (!user) return
    try {
      const res = await axios.get('http://localhost:8080/api/email/history', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      if (Array.isArray(res.data)) setHistory(res.data.reverse())
    } catch { console.error('History sync failed') }
  }

  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation()
    try {
      if (user) {
        await axios.delete(`http://localhost:8080/api/email/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        fetchHistory()
      } else {
        const next = history.filter(i => i.id !== id)
        setHistory(next)
        localStorage.setItem('guest_history', JSON.stringify(next))
      }
      showToast('Draft removed')
    } catch { showToast('Delete failed', 'err') }
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault(); setAuthError('')
    try {
      const res = await axios.post(
        `http://localhost:8080/api/auth/${isLoginView ? 'login' : 'register'}`,
        authData
      )
      if (isLoginView) {
        setUser(res.data)
        localStorage.setItem('mailcraft_user', JSON.stringify(res.data))
        setIsAuthOpen(false)
        setAuthData({ email: '', password: '' })
        showToast(`Welcome, ${res.data.email.split('@')[0]}`)
      } else {
        setIsLoginView(true)
        showToast('Account created — sign in now')
      }
    } catch { setAuthError('Authentication failed. Check your credentials.') }
  }

  const handleSubmit = async () => {
    if (!emailContent.trim() || isLoading) return
    setIsLoading(true); setReply(''); setIsEditing(false); setTimestamp('')
    const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {}
    try {
      const res = await axios.post('https://mailcraft-backend-axsf.onrender.com', {
        emailContent, tone: `${tone}. Extra: ${extraContext}`
      }, config)
      setReply(res.data)
      setTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      if (user) fetchHistory()
      showToast('Draft generated')
    } catch (err) {
      const msg = err.response?.data?.message || 'Rate limit reached. Wait 60s.'
      showToast(msg, 'err')
      setReply(`**Error:** ${msg}`)
    } finally { setIsLoading(false) }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(reply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showToast('Copied to clipboard')
  }

  const handleLogout = () => {
    setUser(null); localStorage.removeItem('mailcraft_user'); setHistory([])
    showToast('Signed out')
  }

  const wordCount = reply ? reply.trim().split(/\s+/).filter(Boolean).length : 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { background: #07070f; font-family: 'Manrope', sans-serif; color: #e0dff0; overflow: hidden; }

        :root {
          --bg:       #07070f;
          --sidebar:  #09090f;
          --panel:    #0c0c17;
          --panel2:   #0e0e1c;
          --border:   rgba(255,255,255,0.06);
          --border2:  rgba(255,255,255,0.10);
          --accent:   #7c6afd;
          --accent2:  #06b6d4;
          --text1:    #ededf5;
          --text2:    #8080b0;
          --text3:    #3a3a60;
          --success:  #22c55e;
          --err:      #ef4444;
        }

        ::-webkit-scrollbar        { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track  { background: transparent; }
        ::-webkit-scrollbar-thumb  { background: var(--border2); border-radius: 10px; }

        /* ═══════════════════════════════════════════
           APP SHELL
        ═══════════════════════════════════════════ */
        .app {
          display: grid;
          grid-template-columns: 224px 1fr;
          grid-template-rows: 52px 1fr;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          position: relative;
        }

        /* Background gradient orbs */
        .bg-orb {
          position: fixed; border-radius: 50%;
          pointer-events: none; z-index: 0;
          filter: blur(130px); opacity: 0.07;
          animation: orb-drift ease-in-out infinite alternate;
        }
        .bg-orb-1 { width: 600px; height: 600px; background: #6366f1; top: -200px; left: -100px; animation-duration: 20s; }
        .bg-orb-2 { width: 500px; height: 500px; background: #06b6d4; bottom: -150px; right: 50px; animation-duration: 25s; animation-delay: -10s; }
        @keyframes orb-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 40px) scale(1.08); }
        }

        /* Subtle noise texture */
        .noise {
          position: fixed; inset: 0; z-index: 1; pointer-events: none;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        /* ═══════════════════════════════════════════
           TOP HEADER
        ═══════════════════════════════════════════ */
        .header {
          grid-column: 1 / -1; grid-row: 1;
          display: flex; align-items: center;
          background: rgba(7,7,15,0.85);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(20px);
          position: relative; z-index: 50;
          padding: 0 20px 0 0;
        }
        .header-brand {
          width: 224px; flex-shrink: 0;
          display: flex; align-items: center; gap: 10px;
          padding: 0 20px;
          border-right: 1px solid var(--border);
          height: 100%;
        }
        .brand-icon {
          width: 28px; height: 28px; border-radius: 8px;
          background: linear-gradient(135deg, #6366f1, #06b6d4);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 600;
          letter-spacing: 0.3px; color: var(--text1);
        }
        .brand-name i { font-style: italic; color: #818cf8; }

        .header-center {
          flex: 1; display: flex; align-items: center;
          padding: 0 24px; gap: 16px;
        }
        .status-pill {
          display: flex; align-items: center; gap: 7px;
          padding: 5px 12px;
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 20px;
          background: rgba(34,197,94,0.06);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: #4ade80; letter-spacing: 0.5px;
        }
        .status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
          animation: pulse-dot 2s ease infinite;
        }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        .header-right {
          display: flex; align-items: center; gap: 8px; margin-left: auto;
        }
        .h-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 7px;
          border: 1px solid var(--border);
          background: transparent; color: var(--text2);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase;
          cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
        }
        .h-btn:hover { background: rgba(255,255,255,0.05); color: var(--text1); border-color: var(--border2); }
        .h-btn.primary {
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.15));
          border-color: rgba(99,102,241,0.3); color: #a5b4fc;
        }
        .h-btn.primary:hover { background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(6,182,212,0.25)); }
        .h-btn.danger:hover { border-color: rgba(239,68,68,0.3); color: #f87171; background: rgba(239,68,68,0.06); }
        .h-sep { width: 1px; height: 18px; background: var(--border2); }
        .user-name { font-size: 12px; color: var(--text2); font-weight: 500; }

        /* ═══════════════════════════════════════════
           SIDEBAR
        ═══════════════════════════════════════════ */
        .sidebar {
          grid-column: 1; grid-row: 2;
          background: var(--sidebar);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          overflow: hidden; position: relative; z-index: 2;
        }
        .sidebar-section-label {
          padding: 16px 18px 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          color: var(--text3); display: flex; align-items: center; justify-content: space-between;
        }
        .sb-clear {
          background: none; border: none; cursor: pointer; color: var(--text3);
          font-family: 'JetBrains Mono', monospace; font-size: 9px;
          letter-spacing: 1px; text-transform: uppercase; transition: color 0.15s;
        }
        .sb-clear:hover { color: #f87171; }
        .sidebar-list { flex: 1; overflow-y: auto; padding: 4px 10px 16px; }
        .sb-card {
          padding: 11px 12px; border-radius: 8px;
          border: 1px solid transparent;
          cursor: pointer; transition: all 0.15s;
          margin-bottom: 4px;
        }
        .sb-card:hover { background: rgba(255,255,255,0.03); border-color: var(--border); }
        .sb-card-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 5px;
        }
        .sb-tone {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase;
          color: #818cf8;
        }
        .sb-del {
          background: none; border: none; cursor: pointer; color: var(--text3);
          display: flex; align-items: center; opacity: 0; transition: all 0.15s;
        }
        .sb-card:hover .sb-del { opacity: 1; }
        .sb-del:hover { color: #f87171; }
        .sb-preview {
          font-size: 11px; color: var(--text2); line-height: 1.5;
          overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }
        .sb-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; flex: 1; gap: 10px;
          padding: 40px 20px; text-align: center; color: var(--text3);
        }
        .sb-empty-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
        }

        /* Sidebar bottom fade */
        .sidebar-fade {
          position: absolute; bottom: 0; left: 0; right: 0; height: 60px; pointer-events: none;
          background: linear-gradient(to top, var(--sidebar), transparent);
        }

        /* ═══════════════════════════════════════════
           MAIN CONTENT
        ═══════════════════════════════════════════ */
        .main {
          grid-column: 2; grid-row: 2;
          display: flex; flex-direction: column;
          overflow: hidden; position: relative; z-index: 2;
        }

        /* Hero strip */
        .hero-strip {
          padding: 20px 28px 18px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 600; line-height: 1;
          letter-spacing: -0.5px; color: var(--text1);
        }
        .hero-title em {
          font-style: italic;
          background: linear-gradient(90deg, #818cf8, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub { font-size: 12px; color: var(--text2); margin-top: 4px; }
        .hero-right { display: flex; align-items: center; gap: 10px; }
        .hero-stat {
          display: flex; align-items: center; gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: var(--text3); letter-spacing: 0.5px;
        }
        .hero-stat span { color: var(--text2); }

        /* Two-panel workspace */
        .workspace {
          flex: 1; display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
        }

        /* ═══════════════════════════════════════════
           PANELS — shared
        ═══════════════════════════════════════════ */
        .panel {
          display: flex; flex-direction: column;
          overflow: hidden; position: relative;
        }
        .panel:first-child { border-right: 1px solid var(--border); }

        /* Panel title bar (IDE-style) */
        .panel-bar {
          height: 40px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
        }
        .panel-bar-left { display: flex; align-items: center; gap: 10px; }
        .panel-dots { display: flex; gap: 5px; }
        .dot { width: 9px; height: 9px; border-radius: 50%; }
        .dot-r { background: #ff5f57; }
        .dot-y { background: #febc2e; }
        .dot-g { background: #28c840; }
        .panel-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: var(--text2); letter-spacing: 0.3px;
        }
        .panel-title strong { color: var(--text1); font-weight: 500; }
        .panel-bar-right { display: flex; align-items: center; gap: 6px; }
        .p-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 1px; text-transform: uppercase;
          color: var(--text3); padding: 2px 8px;
          border: 1px solid var(--border);
          border-radius: 4px;
        }
        .p-badge.active { color: var(--text2); border-color: var(--border2); }

        /* Panel scroll body */
        .panel-body { flex: 1; overflow-y: auto; padding: 24px 24px; display: flex; flex-direction: column; gap: 22px; }

        /* ═══════════════════════════════════════════
           INPUT PANEL — FIELDS
        ═══════════════════════════════════════════ */
        .field-group { display: flex; flex-direction: column; gap: 8px; }
        .field-label-row {
          display: flex; align-items: center; justify-content: space-between;
        }
        .f-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          color: var(--text3);
        }
        .f-meta { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text3); }

        textarea.input-ta, input.input-in {
          width: 100%;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          border-radius: 10px; outline: none;
          font-family: 'Manrope', sans-serif;
          font-size: 13px; font-weight: 300;
          color: var(--text1); line-height: 1.75;
          transition: border-color 0.2s, box-shadow 0.2s;
          resize: none;
        }
        textarea.input-ta { height: 180px; padding: 14px 16px; }
        input.input-in    { padding: 11px 15px; }
        textarea.input-ta::placeholder, input.input-in::placeholder { color: var(--text3); }
        textarea.input-ta:focus, input.input-in:focus {
          border-color: rgba(124,106,253,0.4);
          box-shadow: 0 0 0 3px rgba(124,106,253,0.07);
        }

        /* TONE SELECTOR */
        .tone-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .tone-card {
          padding: 13px 14px; border-radius: 10px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          cursor: pointer; transition: all 0.18s ease;
          display: flex; align-items: center; gap: 12px;
          position: relative; overflow: hidden;
        }
        .tone-card::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
          background: transparent; transition: background 0.2s;
          border-radius: 1px;
        }
        .tone-card.active::before { background: var(--tc); box-shadow: 2px 0 10px var(--tc); }
        .tone-card:hover { background: rgba(255,255,255,0.04); border-color: var(--border2); transform: translateY(-1px); }
        .tone-card.active {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
          box-shadow: 0 0 20px rgba(var(--tc-rgb),0.1);
        }
        .tone-icon-box {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          background: rgba(255,255,255,0.04);
          transition: background 0.2s;
        }
        .tone-card.active .tone-icon-box {
          background: rgba(var(--tc-rgb), 0.12);
        }
        .tone-info { flex: 1; min-width: 0; }
        .tone-n { font-size: 12px; font-weight: 600; color: var(--text2); transition: color 0.2s; display: block; margin-bottom: 2px; }
        .tone-card.active .tone-n { color: var(--text1); }
        .tone-d { font-size: 10px; color: var(--text3); transition: color 0.2s; }
        .tone-card.active .tone-d { color: var(--text2); }
        .tone-check { font-size: 10px; opacity: 0; transition: opacity 0.2s; color: var(--tc); flex-shrink: 0; }
        .tone-card.active .tone-check { opacity: 1; }

        /* GENERATE BUTTON */
        .gen-wrap { margin-top: 4px; }
        .gen-btn {
          width: 100%; padding: 15px 24px; border: none; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #0891b2 100%);
          background-size: 200% auto;
          color: #fff; font-family: 'Manrope', sans-serif;
          font-size: 14px; font-weight: 700; letter-spacing: 0.3px;
          cursor: pointer; position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.25s ease;
          box-shadow: 0 4px 24px rgba(99,102,241,0.25), 0 1px 0 rgba(255,255,255,0.1) inset;
        }
        .gen-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent 60%);
          opacity: 0; transition: opacity 0.2s;
        }
        .gen-btn:hover:not(:disabled)::before { opacity: 1; }
        .gen-btn:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 6px 32px rgba(99,102,241,0.4), 0 1px 0 rgba(255,255,255,0.1) inset;
          transform: translateY(-1px);
        }
        .gen-btn:active:not(:disabled) { transform: translateY(0); }
        .gen-btn:disabled { opacity: 0.25; cursor: not-allowed; box-shadow: none; }
        .gen-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: rgba(255,255,255,0.5);
          margin-left: auto;
        }
        .spin {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          animation: spinning 0.6s linear infinite; flex-shrink: 0;
        }
        @keyframes spinning { to { transform: rotate(360deg); } }

        /* ═══════════════════════════════════════════
           OUTPUT PANEL
        ═══════════════════════════════════════════ */
        .out-panel-body {
          flex: 1; overflow-y: auto;
          padding: 24px; display: flex; flex-direction: column;
        }

        /* Output actions */
        .out-actions-row {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 20px; flex-shrink: 0;
        }
        .out-led {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--text3); margin-right: 4px; flex-shrink: 0;
          transition: all 0.3s;
        }
        .out-led.ready { background: var(--success); box-shadow: 0 0 8px var(--success); animation: pulse-dot 2s ease infinite; }
        .out-label-txt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--text3); flex: 1;
        }
        .out-label-txt.ready { color: var(--text2); }

        .o-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 7px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.03); color: var(--text2);
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.5px; text-transform: uppercase;
          cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
        }
        .o-btn:hover { background: rgba(255,255,255,0.07); color: var(--text1); border-color: var(--border2); }
        .o-btn.accent { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); color: #a5b4fc; }
        .o-btn.accent:hover { background: rgba(99,102,241,0.25); }
        .o-btn.green { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3); color: #4ade80; }

        /* Output prose */
        .out-prose {
          flex: 1;
          font-size: 13px; font-weight: 300; color: #b0b8d0;
          line-height: 1.9;
          animation: prose-enter 0.45s ease both;
        }
        @keyframes prose-enter { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }
        .out-prose p { margin-bottom: 14px; }
        .out-prose p:last-child { margin-bottom: 0; }
        .out-prose strong { color: var(--text1); font-weight: 600; }
        .out-prose em { color: #a5b4fc; }

        /* Edit textarea */
        textarea.edit-ta {
          flex: 1; width: 100%; resize: none; min-height: 300px;
          background: rgba(255,255,255,0.02); border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 16px; outline: none;
          font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 300;
          color: var(--text1); line-height: 1.8; transition: border-color 0.2s;
        }
        .edit-ta:focus { border-color: rgba(124,106,253,0.4); }

        /* Empty state */
        .empty-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px; text-align: center; padding: 40px;
          animation: prose-enter 0.4s ease both;
        }
        .empty-ring {
          position: relative;
          width: 72px; height: 72px;
          display: flex; align-items: center; justify-content: center;
        }
        .ring-svg {
          position: absolute; inset: 0; width: 100%; height: 100%;
          animation: ring-spin 8s linear infinite;
        }
        @keyframes ring-spin { to { transform: rotate(360deg); } }
        .empty-icon-inner { color: var(--text3); }
        .empty-title { font-size: 13px; font-weight: 600; color: var(--text2); }
        .empty-sub { font-size: 11px; color: var(--text3); line-height: 1.7; max-width: 200px; }

        /* Output footer stats */
        .out-footer {
          margin-top: 20px; padding-top: 14px;
          border-top: 1px solid var(--border); flex-shrink: 0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .out-stat {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 1px; color: var(--text3);
          display: flex; align-items: center; gap: 6px;
        }
        .out-stat span { color: var(--text2); }
        .out-tone-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 3px 9px; border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text2);
        }

        /* ═══════════════════════════════════════════
           AUTH MODAL
        ═══════════════════════════════════════════ */
        .modal-veil {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(7,7,15,0.8); backdrop-filter: blur(16px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .modal {
          background: #0e0e1c;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; width: 100%; max-width: 400px; padding: 40px;
          position: relative;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
          animation: modal-pop 0.28s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes modal-pop { from { opacity:0; transform: scale(0.94) translateY(8px); } to { opacity:1; transform:none; } }

        /* Modal gradient top accent */
        .modal::before {
          content: ''; position: absolute; top: 0; left: 24px; right: 24px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent);
          border-radius: 1px;
        }

        .modal-close {
          position: absolute; top: 16px; right: 16px;
          background: none; border: none; cursor: pointer; color: var(--text3);
          padding: 6px; border-radius: 6px; display: flex;
          transition: all 0.15s;
        }
        .modal-close:hover { color: var(--text1); background: rgba(255,255,255,0.06); }

        .modal-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          color: #818cf8; margin-bottom: 10px;
        }
        .modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px; font-weight: 600; color: var(--text1);
          margin-bottom: 4px; line-height: 1;
        }
        .modal-sub { font-size: 12px; color: var(--text2); margin-bottom: 28px; }

        .m-err {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px; padding: 10px 14px;
          font-size: 12px; color: #fca5a5; margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .m-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--text3); margin-bottom: 6px; display: block; }
        .m-input {
          width: 100%;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          border-radius: 9px; padding: 12px 14px; outline: none;
          font-family: 'Manrope', sans-serif; font-size: 13px; color: var(--text1);
          transition: border-color 0.15s; margin-bottom: 14px;
        }
        .m-input:focus { border-color: rgba(124,106,253,0.5); box-shadow: 0 0 0 3px rgba(124,106,253,0.07); }
        .m-input::placeholder { color: var(--text3); }
        .m-submit {
          width: 100%; margin-top: 6px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          border: none; border-radius: 9px; padding: 13px;
          color: #fff; font-family: 'Manrope', sans-serif;
          font-size: 14px; font-weight: 700; cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
        }
        .m-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(99,102,241,0.4); }
        .m-switch { text-align: center; margin-top: 20px; font-size: 12px; color: var(--text2); }
        .m-link { color: #818cf8; cursor: pointer; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }

        /* ═══════════════════════════════════════════
           TOAST
        ═══════════════════════════════════════════ */
        .toast {
          position: fixed; bottom: 24px; right: 24px; z-index: 999;
          display: flex; align-items: center; gap: 10px;
          padding: 12px 18px; border-radius: 11px;
          background: #0e0e1c;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
          font-size: 12px; font-weight: 500; color: var(--text1);
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          max-width: 280px;
        }
        .toast.hide { opacity: 0; transform: translateY(10px) scale(0.97); }
        .toast.err { border-color: rgba(239,68,68,0.3); }
        .toast-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .toast-dot.ok  { background: var(--success); box-shadow: 0 0 6px var(--success); }
        .toast-dot.err { background: var(--err);     box-shadow: 0 0 6px var(--err); }

        /* ═══════════════════════════════════════════
           RESPONSIVE
        ═══════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .app { grid-template-columns: 1fr; }
          .sidebar { display: none; }
          .workspace { grid-template-columns: 1fr; overflow-y: auto; }
          .panel:first-child { border-right: none; border-bottom: 1px solid var(--border); max-height: 60vh; }
          body { overflow: auto; }
          .app { height: auto; }
        }
      `}</style>

      {/* Atmosphere */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="noise" />

      {/* Toast */}
      <div className={`toast ${toast.show ? '' : 'hide'} ${toast.type === 'err' ? 'err' : ''}`}>
        <div className={`toast-dot ${toast.type === 'err' ? 'err' : 'ok'}`} />
        {toast.message}
      </div>

      {/* Auth Modal */}
      {isAuthOpen && (
        <div className="modal-veil" onClick={() => setIsAuthOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsAuthOpen(false)}><X size={16} /></button>
            <div className="modal-eyebrow">MailCraft Cloud</div>
            <div className="modal-title">{isLoginView ? 'Welcome back.' : 'Get started.'}</div>
            <p className="modal-sub">{isLoginView ? 'Sign in to sync your drafts across devices.' : 'Create your account to enable cloud sync.'}</p>
            {authError && (
              <div className="m-err"><AlertCircle size={13} /> {authError}</div>
            )}
            <form onSubmit={handleAuthSubmit}>
              <label className="m-label">Email address</label>
              <input className="m-input" type="email" placeholder="you@company.com" value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })} required />
              <label className="m-label">Password</label>
              <input className="m-input" type="password" placeholder="••••••••••" value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })} required />
              <button type="submit" className="m-submit">{isLoginView ? 'Sign in →' : 'Create account →'}</button>
            </form>
            <p className="m-switch">
              {isLoginView ? "Don't have an account? " : "Already a member? "}
              <span className="m-link" onClick={() => { setIsLoginView(!isLoginView); setAuthError('') }}>
                {isLoginView ? 'Register' : 'Sign in'}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="app">

        {/* ── HEADER ── */}
        <header className="header">
          <div className="header-brand">
            <div className="brand-icon">
              <Mail size={14} color="#fff" />
            </div>
            <div className="brand-name">Mail<i>Craft</i></div>
          </div>

          <div className="header-center">
            <div className="status-pill">
              <div className="status-dot" /> AI Engine Online
            </div>
            {user && (
              <div className="hero-stat">
                <LayoutTemplate size={11} />
                <span>{history.length}</span> drafts synced
              </div>
            )}
          </div>

          <div className="header-right">
            {user ? (
              <>
                <span className="user-name">{user.email.split('@')[0]}</span>
                <div className="h-sep" />
                <button className="h-btn danger" onClick={handleLogout}>
                  <LogOut size={11} /> Sign out
                </button>
              </>
            ) : (
              <button className="h-btn primary" onClick={() => setIsAuthOpen(true)}>
                <User size={11} /> Sign in
              </button>
            )}
          </div>
        </header>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-section-label">
            <span>Draft History</span>
            {history.length > 0 && (
              <button className="sb-clear" onClick={() => { setHistory([]); localStorage.removeItem('guest_history') }}>
                Clear
              </button>
            )}
          </div>

          <div className="sidebar-list">
            {history.length === 0 ? (
              <div className="sb-empty">
                <FileText size={22} opacity={0.2} />
                <span className="sb-empty-label">No drafts yet</span>
              </div>
            ) : history.map(item => (
              <div key={item.id} className="sb-card"
                onClick={() => {
                  setEmailContent(item.originalContent || item.input || '')
                  setReply(item.generatedReply || item.output || '')
                }}>
                <div className="sb-card-top">
                  <span className="sb-tone">{item.tone}</span>
                  <button className="sb-del" onClick={e => handleDeleteHistory(e, item.id)}>
                    <Trash2 size={11} />
                  </button>
                </div>
                <div className="sb-preview">{item.originalContent || item.input}</div>
              </div>
            ))}
          </div>
          <div className="sidebar-fade" />
        </aside>

        {/* ── MAIN ── */}
        <div className="main">

          {/* Hero strip */}
          <div className="hero-strip">
            <div>
              <div className="hero-title">
                Compose <em>perfect replies,</em> effortlessly.
              </div>
              <div className="hero-sub">
                {user
                  ? `Cloud sync active · ${user.email}`
                  : 'Paste any email, select a tone, and generate a polished response in seconds.'}
              </div>
            </div>
            <div className="hero-right">
              <div className="hero-stat">
                <Clock size={11} /> {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Two-panel workspace */}
          <div className="workspace">

            {/* ── INPUT PANEL ── */}
            <div className="panel">
              <div className="panel-bar">
                <div className="panel-bar-left">
                  <div className="panel-dots">
                    <div className="dot dot-r" /><div className="dot dot-y" /><div className="dot dot-g" />
                  </div>
                  <div className="panel-title"><strong>compose</strong>.email</div>
                </div>
                <div className="panel-bar-right">
                  <span className={`p-badge ${emailContent ? 'active' : ''}`}>
                    {emailContent ? `${emailContent.length} chars` : 'empty'}
                  </span>
                </div>
              </div>

              <div className="panel-body">
                {/* Email textarea */}
                <div className="field-group">
                  <div className="field-label-row">
                    <span className="f-label">Incoming message</span>
                  </div>
                  <textarea
                    className="input-ta"
                    value={emailContent}
                    onChange={e => setEmailContent(e.target.value)}
                    placeholder="Paste the email you received here…"
                  />
                </div>

                {/* Tone selector */}
                <div className="field-group">
                  <div className="field-label-row">
                    <span className="f-label">Response tone</span>
                    <span className="f-meta">{tone}</span>
                  </div>
                  <div className="tone-grid">
                    {TONES.map(t => (
                      <div key={t.value}
                        className={`tone-card ${tone === t.value ? 'active' : ''}`}
                        onClick={() => setTone(t.value)}
                        style={{ '--tc': t.color, '--tc-rgb': t.glow }}
                      >
                        <div className="tone-icon-box">
                          <span style={{ color: tone === t.value ? t.color : 'var(--text3)', fontSize: 14 }}>{t.icon}</span>
                        </div>
                        <div className="tone-info">
                          <span className="tone-n">{t.value}</span>
                          <span className="tone-d">{t.desc}</span>
                        </div>
                        <span className="tone-check">✓</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra context */}
                <div className="field-group">
                  <div className="field-label-row">
                    <span className="f-label">Extra instructions</span>
                    <span className="f-meta">optional</span>
                  </div>
                  <input
                    className="input-in"
                    type="text"
                    value={extraContext}
                    onChange={e => setExtraContext(e.target.value)}
                    placeholder="e.g. 'Keep it brief', 'Mention I'm on leave until Monday'"
                  />
                </div>

                {/* Generate */}
                <div className="gen-wrap">
                  <button
                    className="gen-btn"
                    onClick={handleSubmit}
                    disabled={isLoading || !emailContent.trim()}
                  >
                    {isLoading ? (
                      <><div className="spin" /> Generating reply…</>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Generate Reply
                        <span className="gen-hint">⌘ Enter</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ── OUTPUT PANEL ── */}
            <div className="panel">
              <div className="panel-bar">
                <div className="panel-bar-left">
                  <div className="panel-dots">
                    <div className="dot dot-r" /><div className="dot dot-y" /><div className="dot dot-g" />
                  </div>
                  <div className="panel-title"><strong>ai-draft</strong>.md</div>
                </div>
                {reply && (
                  <div className="panel-bar-right">
                    <span className="p-badge active">{wordCount} words</span>
                  </div>
                )}
              </div>

              <div className="out-panel-body">
                {/* Actions row */}
                <div className="out-actions-row">
                  <div className={`out-led ${reply ? 'ready' : ''}`} />
                  <span className={`out-label-txt ${reply ? 'ready' : ''}`}>
                    {isLoading ? 'Processing…' : reply ? 'Draft ready' : 'Awaiting input'}
                  </span>
                  {reply && (
                    <>
                      <button className={`o-btn ${isEditing ? 'accent' : ''}`} onClick={() => setIsEditing(!isEditing)}>
                        <Edit3 size={10} /> {isEditing ? 'Preview' : 'Edit'}
                      </button>
                      <button className="o-btn" onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent(reply)}`, '_blank')}>
                        <Send size={10} /> Gmail
                      </button>
                      <button className={`o-btn ${copied ? 'green' : 'accent'}`} onClick={handleCopy}>
                        {copied ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy</>}
                      </button>
                    </>
                  )}
                </div>

                {/* Content */}
                {reply ? (
                  <>
                    {isEditing ? (
                      <textarea
                        className="edit-ta"
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        ref={replyRef}
                      />
                    ) : (
                      <div className="out-prose" ref={replyRef}>
                        <ReactMarkdown>{reply}</ReactMarkdown>
                      </div>
                    )}
                    <div className="out-footer">
                      <div className="out-stat">
                        <Clock size={10} />
                        Generated at <span>{timestamp}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="out-stat">{wordCount} words · {reply.length} chars</div>
                        {activeTone && (
                          <div className="out-tone-tag" style={{ color: activeTone.color, borderColor: `rgba(${activeTone.glow},0.25)` }}>
                            {activeTone.icon} {activeTone.value}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <div className="empty-ring">
                      <svg className="ring-svg" viewBox="0 0 72 72" fill="none">
                        <circle cx="36" cy="36" r="34" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        <path d="M36 2 A34 34 0 0 1 70 36" stroke="rgba(99,102,241,0.4)" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                      <div className="empty-icon-inner">
                        {isLoading
                          ? <div className="spin" style={{ width: 26, height: 26, borderWidth: 2 }} />
                          : <Zap size={26} />
                        }
                      </div>
                    </div>
                    <div className="empty-title">
                      {isLoading ? 'Composing your reply…' : 'Ready to generate'}
                    </div>
                    <div className="empty-sub">
                      {isLoading
                        ? 'AI is writing a polished response'
                        : 'Fill in the email and hit Generate Reply to get your AI draft.'}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
