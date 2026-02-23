import { useState, useEffect, useRef, useCallback } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap');
    
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      --bg: #0a0a0f;
      --surface: #111118;
      --surface2: #18181f;
      --surface3: #1e1e28;
      --border: rgba(255,255,255,0.07);
      --border-hover: rgba(255,255,255,0.15);
      --accent: #6c63ff;
      --accent2: #ff6b6b;
      --accent3: #ffd93d;
      --accent4: #6bcb77;
      --text: #e8e8f0;
      --text-muted: #7a7a8c;
      --text-dim: #4a4a5c;
      --glow: rgba(108,99,255,0.4);
      --font-head: 'Syne', sans-serif;
      --font-mono: 'DM Mono', monospace;
      --font-body: 'Crimson Pro', serif;
      --r: 12px;
      --r-lg: 20px;
      --transition: 0.2s cubic-bezier(0.4,0,0.2,1);
    }

    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
      font-size: 16px;
      line-height: 1.6;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }

    /* Animations */
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 20px var(--glow); } 50% { box-shadow: 0 0 40px var(--glow), 0 0 80px rgba(108,99,255,0.2); } }
    @keyframes typewriter { from { width:0; } to { width:100%; } }
    @keyframes blink { 0%,50% { opacity:1; } 51%,100% { opacity:0; } }
    @keyframes scanline { 0% { top: -5%; } 100% { top: 105%; } }
    @keyframes recordPulse { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.3); opacity:0.7; } }

    .fade-up { animation: fadeUp 0.5s ease both; }
    .fade-up-1 { animation: fadeUp 0.5s 0.1s ease both; }
    .fade-up-2 { animation: fadeUp 0.5s 0.2s ease both; }
    .fade-up-3 { animation: fadeUp 0.5s 0.3s ease both; }
    .fade-up-4 { animation: fadeUp 0.5s 0.4s ease both; }

    /* Grid bg */
    .grid-bg {
      background-image: 
        linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    /* Noise texture */
    .noise::after {
      content: '';
      position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none; z-index: 9999; opacity: 0.4;
    }

    button { cursor: pointer; border: none; font-family: var(--font-head); }
    input, textarea, select { font-family: var(--font-body); }

    .btn-primary {
      background: var(--accent);
      color: white;
      padding: 10px 22px;
      border-radius: var(--r);
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
      transition: var(--transition);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-primary:hover { background: #7d75ff; transform: translateY(-1px); box-shadow: 0 8px 24px var(--glow); }
    .btn-primary:active { transform: translateY(0); }

    .btn-ghost {
      background: transparent;
      color: var(--text);
      padding: 10px 22px;
      border-radius: var(--r);
      font-size: 14px;
      border: 1px solid var(--border);
      transition: var(--transition);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-ghost:hover { border-color: var(--border-hover); background: var(--surface2); }

    .btn-danger {
      background: rgba(255,107,107,0.15);
      color: var(--accent2);
      padding: 10px 22px;
      border-radius: var(--r);
      font-size: 14px;
      border: 1px solid rgba(255,107,107,0.2);
      transition: var(--transition);
    }
    .btn-danger:hover { background: rgba(255,107,107,0.25); }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      padding: 24px;
      transition: var(--transition);
    }
    .card:hover { border-color: var(--border-hover); }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 12px;
      font-family: var(--font-mono);
    }
    .badge-accent { background: rgba(108,99,255,0.15); color: var(--accent); border: 1px solid rgba(108,99,255,0.2); }
    .badge-green { background: rgba(107,203,119,0.15); color: var(--accent4); border: 1px solid rgba(107,203,119,0.2); }
    .badge-red { background: rgba(255,107,107,0.15); color: var(--accent2); border: 1px solid rgba(255,107,107,0.2); }
    .badge-yellow { background: rgba(255,217,61,0.15); color: var(--accent3); border: 1px solid rgba(255,217,61,0.2); }

    .input {
      width: 100%;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: var(--r);
      padding: 12px 16px;
      color: var(--text);
      font-size: 15px;
      font-family: var(--font-body);
      transition: var(--transition);
      outline: none;
    }
    .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(108,99,255,0.1); }
    .input::placeholder { color: var(--text-dim); }

    .label {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 8px;
      display: block;
    }

    .section-title {
      font-family: var(--font-head);
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .section-sub {
      color: var(--text-muted);
      font-size: 16px;
      margin-bottom: 28px;
    }

    .progress-bar {
      height: 6px;
      background: var(--surface3);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 3px;
      background: linear-gradient(90deg, var(--accent), #9c94ff);
      transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
    }

    .stat-number {
      font-family: var(--font-head);
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, var(--text), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-radius: var(--r);
      cursor: pointer;
      transition: var(--transition);
      color: var(--text-muted);
      font-family: var(--font-head);
      font-size: 14px;
      font-weight: 500;
      border: 1px solid transparent;
    }
    .sidebar-item:hover { background: var(--surface2); color: var(--text); }
    .sidebar-item.active { 
      background: rgba(108,99,255,0.12); 
      color: var(--accent); 
      border-color: rgba(108,99,255,0.2);
    }

    /* Score ring */
    .score-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
    .score-ring svg { transform: rotate(-90deg); }
    .score-ring-text { position: absolute; text-align: center; }

    /* Typing indicator */
    .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 1.2s ease infinite; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    /* Recording indicator */
    .rec-dot { width: 10px; height: 10px; background: var(--accent2); border-radius: 50%; animation: recordPulse 1s ease infinite; }

    /* Chart bar */
    .chart-bar {
      transition: height 0.8s cubic-bezier(0.4,0,0.2,1);
    }

    /* Skill tag */
    .skill-tag {
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 12px;
      font-family: var(--font-mono);
      background: var(--surface3);
      color: var(--text-muted);
      border: 1px solid var(--border);
      transition: var(--transition);
    }
    .skill-tag.matched { background: rgba(107,203,119,0.1); color: var(--accent4); border-color: rgba(107,203,119,0.2); }
    .skill-tag.missing { background: rgba(255,107,107,0.1); color: var(--accent2); border-color: rgba(255,107,107,0.2); }

    /* Stepper */
    .step-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 13px; font-weight: 500; transition: var(--transition); }
    .step-dot.done { background: var(--accent); color: white; }
    .step-dot.active { background: rgba(108,99,255,0.2); color: var(--accent); border: 2px solid var(--accent); }
    .step-dot.pending { background: var(--surface3); color: var(--text-dim); }

    /* Message bubble */
    .msg-user { background: var(--accent); color: white; padding: 12px 16px; border-radius: 16px 16px 4px 16px; max-width: 75%; font-size: 15px; }
    .msg-ai { background: var(--surface2); border: 1px solid var(--border); padding: 12px 16px; border-radius: 16px 16px 16px 4px; max-width: 75%; font-size: 15px; }

    .tooltip { position: relative; }
    .tooltip-text {
      position: absolute;
      bottom: 110%;
      left: 50%;
      transform: translateX(-50%);
      background: var(--surface3);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-family: var(--font-mono);
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s;
      z-index: 100;
    }
    .tooltip:hover .tooltip-text { opacity: 1; }

    select.input option { background: var(--surface2); }
    textarea.input { resize: vertical; min-height: 120px; }
    
    .divider { height: 1px; background: var(--border); margin: 24px 0; }

    .glow-accent { box-shadow: 0 0 30px var(--glow); }
    .text-accent { color: var(--accent); }
    .text-muted { color: var(--text-muted); }
    .text-dim { color: var(--text-dim); }
    .font-mono { font-family: var(--font-mono); }
    .font-head { font-family: var(--font-head); }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    @media(max-width: 900px) {
      .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
    }
    @media(max-width: 1100px) {
      .grid-3, .grid-4 { grid-template-columns: 1fr 1fr; }
    }

    .scrollable { overflow-y: auto; }
    .scrollable::-webkit-scrollbar { width: 3px; }
    .scrollable::-webkit-scrollbar-thumb { background: var(--surface3); }
  `}</style>
);

// ─── MOCK DATA & CONSTANTS ────────────────────────────────────────────────────
const ROLES = ["Frontend Developer", "Backend Engineer", "Full Stack Developer", "Data Scientist", "ML Engineer", "DevOps Engineer", "Product Manager", "System Design", "Android Developer", "Cloud Architect"];

const QDB = {
  "Frontend Developer": [
    { id: 1, q: "Explain the difference between `let`, `const`, and `var` in JavaScript.", difficulty: "Easy", category: "JavaScript", followUp: "What is temporal dead zone?" },
    { id: 2, q: "What is the Virtual DOM in React and how does it improve performance?", difficulty: "Medium", category: "React", followUp: "How does React's reconciliation algorithm work?" },
    { id: 3, q: "Explain CSS specificity and how the cascade works.", difficulty: "Easy", category: "CSS", followUp: "What does `!important` do and when should you avoid it?" },
    { id: 4, q: "What are React Hooks? Explain useEffect with an example.", difficulty: "Medium", category: "React", followUp: "What is the dependency array in useEffect?" },
    { id: 5, q: "How does event bubbling and capturing work in the DOM?", difficulty: "Medium", category: "JavaScript", followUp: "How would you stop event propagation?" },
    { id: 6, q: "Design a responsive layout using CSS Grid for a e-commerce product page.", difficulty: "Hard", category: "CSS", followUp: "How would you make it accessible?" },
    { id: 7, q: "What is CORS and how do you handle it?", difficulty: "Medium", category: "Web", followUp: "What are preflight requests?" },
    { id: 8, q: "Explain Web Vitals (LCP, FID, CLS) and how to optimize them.", difficulty: "Hard", category: "Performance", followUp: "How would you measure these metrics?" },
  ],
  "Backend Engineer": [
    { id: 1, q: "Explain RESTful API design principles and best practices.", difficulty: "Easy", category: "API Design", followUp: "What is HATEOAS?" },
    { id: 2, q: "What is database indexing and how does it improve query performance?", difficulty: "Medium", category: "Database", followUp: "What are the disadvantages of indexing?" },
    { id: 3, q: "Explain the CAP theorem in distributed systems.", difficulty: "Hard", category: "Distributed Systems", followUp: "Give a real-world example of CP vs AP systems." },
    { id: 4, q: "What is connection pooling and why is it important?", difficulty: "Medium", category: "Database", followUp: "What happens when the pool is exhausted?" },
    { id: 5, q: "Describe JWT authentication and its security implications.", difficulty: "Medium", category: "Security", followUp: "How do you handle token refresh?" },
    { id: 6, q: "Explain different caching strategies (LRU, write-through, write-back).", difficulty: "Hard", category: "Caching", followUp: "How would you invalidate cache?" },
  ],
  "Data Scientist": [
    { id: 1, q: "Explain the bias-variance tradeoff in machine learning.", difficulty: "Medium", category: "ML Theory", followUp: "How do regularization techniques help?" },
    { id: 2, q: "What is the difference between bagging and boosting?", difficulty: "Medium", category: "Ensemble Methods", followUp: "When would you choose one over the other?" },
    { id: 3, q: "Explain gradient descent and its variants (SGD, Adam, RMSprop).", difficulty: "Hard", category: "Optimization", followUp: "What is the learning rate's effect?" },
    { id: 4, q: "How do you handle class imbalance in a dataset?", difficulty: "Medium", category: "Data Processing", followUp: "What metrics would you use for imbalanced data?" },
    { id: 5, q: "Explain the attention mechanism in transformers.", difficulty: "Hard", category: "Deep Learning", followUp: "What is multi-head attention?" },
    { id: 6, q: "What is cross-validation and why is it used?", difficulty: "Easy", category: "Model Evaluation", followUp: "What are the differences between k-fold and stratified k-fold?" },
  ],
};

// Default for unlisted roles
const DEFAULT_QS = QDB["Backend Engineer"];

const SAMPLE_ANSWERS = {
  "Virtual DOM": "The Virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes, React creates a new Virtual DOM tree and compares it with the previous one using a diffing algorithm. Only the differences are then applied to the real DOM, minimizing expensive DOM operations and improving performance.",
  "bias-variance": "The bias-variance tradeoff describes the tension between two sources of error. High bias (underfitting) occurs when the model is too simple to capture patterns. High variance (overfitting) occurs when the model learns noise. We aim to find the sweet spot with techniques like regularization, cross-validation, and ensemble methods.",
  "default": "This is a well-structured answer that covers the main concept clearly. The explanation demonstrates solid understanding of the topic with relevant examples and practical implications. The candidate shows awareness of edge cases and real-world applications."
};

function evaluateAnswer(question, answer) {
  if (!answer || answer.length < 20) return { score: 0, feedback: "Answer too short.", keywords: [], sentiment: "Poor", clarity: 0, depth: 0, relevance: 0 };
  const words = answer.split(" ").length;
  const sentences = answer.split(/[.!?]/).filter(Boolean).length;
  
  const keywordMap = {
    "virtual dom": ["virtual", "dom", "reconciliation", "diffing", "fiber", "react"],
    "indexing": ["index", "btree", "query", "performance", "column", "composite"],
    "cap theorem": ["consistency", "availability", "partition", "distributed", "trade"],
    "gradient descent": ["gradient", "learning rate", "convergence", "optimizer", "loss", "backprop"],
    "bias-variance": ["bias", "variance", "tradeoff", "overfit", "underfit", "regularization"],
    "default": ["explain", "example", "because", "therefore", "implement", "use"]
  };
  
  const qLower = question.toLowerCase();
  let relevantKws = keywordMap.default;
  for (const [key, kws] of Object.entries(keywordMap)) {
    if (qLower.includes(key)) { relevantKws = kws; break; }
  }
  
  const ansLower = answer.toLowerCase();
  const matched = relevantKws.filter(k => ansLower.includes(k));
  const relevance = Math.min(100, Math.round((matched.length / relevantKws.length) * 100));
  
  const clarity = Math.min(100, Math.round(Math.min(words / 2, 50) + (sentences >= 2 ? 20 : 0) + (answer.includes("example") || answer.includes("instance") ? 15 : 0)));
  const depth = Math.min(100, Math.round(Math.min(words / 3, 50) + matched.length * 8));
  const score = Math.round((relevance * 0.4 + clarity * 0.3 + depth * 0.3));
  
  const sentiments = score >= 80 ? "Excellent" : score >= 65 ? "Good" : score >= 45 ? "Average" : "Needs Work";
  
  const feedbacks = {
    "Excellent": "Outstanding answer! Demonstrates deep understanding with clear explanation and relevant examples.",
    "Good": "Good coverage of the topic. Consider adding more specific examples or edge cases.",
    "Average": "Basic understanding shown. Expand on technical depth and include practical examples.",
    "Needs Work": "Answer lacks depth. Review the concept and include key terminology and examples."
  };

  return { score, feedback: feedbacks[sentiments], keywords: matched, sentiment: sentiments, clarity, depth, relevance };
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

// ── Icon component (SVG icons inline)
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    home: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    mic: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 18v4M8 22h8"/></svg>,
    code: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>,
    chart: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    user: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    doc: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>,
    brain: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 004.5 8a2.5 2.5 0 00-1 4.8V14a2.5 2.5 0 002.5 2.5h1A2.5 2.5 0 009.5 19v.5a2.5 2.5 0 005 0V19a2.5 2.5 0 002.5-2.5h1A2.5 2.5 0 0020.5 14v-1.2A2.5 2.5 0 0019.5 8a2.5 2.5 0 00-2.5-2.5v-1A2.5 2.5 0 0014.5 2h-5z"/></svg>,
    check: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>,
    x: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    star: <svg width={size} height={size} fill={color} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    send: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>,
    bolt: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>,
    target: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    trophy: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16M12 17v5M8 17a5 5 0 01-5-5V5h18v7a5 5 0 01-5 5z"/></svg>,
    settings: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    clock: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
    logout: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
    info: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    play: <svg width={size} height={size} fill={color} viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>,
    pause: <svg width={size} height={size} fill={color} viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
    refresh: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
    upload: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
    arrow: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>,
    lock: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    sparkle: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z"/></svg>,
  };
  return icons[name] || null;
};

// ── Score Ring
const ScoreRing = ({ score, size = 80, strokeWidth = 8, color = "#6c63ff" }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="score-ring-text">
        <div style={{ fontSize: size * 0.22, fontFamily: "var(--font-head)", fontWeight: 800, color }}>{score}</div>
        <div style={{ fontSize: size * 0.12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>/ 100</div>
      </div>
    </div>
  );
};

// ── Mini Bar Chart
const BarChart = ({ data, height = 120 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height, paddingTop: 16 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{d.value}</div>
          <div className="chart-bar" style={{
            width: "100%",
            height: `${(d.value / max) * (height - 30)}px`,
            background: d.color || `linear-gradient(to top, var(--accent), #9c94ff)`,
            borderRadius: "4px 4px 0 0",
            minHeight: 4
          }}/>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-dim)", textAlign: "center" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
};

// ── RadarChart (SVG)
const RadarChart = ({ skills }) => {
  const N = skills.length;
  const cx = 120, cy = 120, r = 90;
  const angle = (i) => (i * 2 * Math.PI / N) - Math.PI / 2;
  const point = (i, val) => {
    const a = angle(i);
    return [cx + (r * val / 100) * Math.cos(a), cy + (r * val / 100) * Math.sin(a)];
  };
  const polyPoints = skills.map((s, i) => point(i, s.value).join(",")).join(" ");
  const circles = [25, 50, 75, 100];
  return (
    <svg width={240} height={240} style={{ overflow: "visible" }}>
      {circles.map(c => (
        <polygon key={c} points={skills.map((_, i) => {
          const a = angle(i); return `${cx + r * c / 100 * Math.cos(a)},${cy + r * c / 100 * Math.sin(a)}`;
        }).join(" ")} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1}/>
      ))}
      {skills.map((_, i) => {
        const [x, y] = [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1}/>;
      })}
      <polygon points={polyPoints} fill="rgba(108,99,255,0.2)" stroke="var(--accent)" strokeWidth={2}/>
      {skills.map((s, i) => {
        const [px, py] = point(i, s.value);
        const [lx, ly] = [cx + (r + 20) * Math.cos(angle(i)), cy + (r + 20) * Math.sin(angle(i))];
        return (
          <g key={i}>
            <circle cx={px} cy={py} r={4} fill="var(--accent)"/>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Typing Indicator
const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "12px 16px", background: "var(--surface2)", borderRadius: 12, width: "fit-content" }}>
    <div className="typing-dot"/>
    <div className="typing-dot"/>
    <div className="typing-dot"/>
  </div>
);

// ─── AUTH SCREENS ─────────────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "demo@interviewai.com", password: "demo123", role: "Frontend Developer" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!form.email || !form.password) { setError("Please fill all fields."); return; }
    if (mode === "register" && !form.name) { setError("Please enter your name."); return; }
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onLogin({ name: form.name || "Alex Johnson", email: form.email, role: form.role, joined: new Date().toLocaleDateString(), avatar: form.name?.[0]?.toUpperCase() || "A" });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }} className="grid-bg">
      {/* Decorative blobs */}
      <div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }}/>
      <div style={{ position: "fixed", bottom: -200, right: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,107,0.08) 0%, transparent 70%)", pointerEvents: "none" }}/>

      <div style={{ width: "100%", maxWidth: 440 }} className="fade-up">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, background: "linear-gradient(135deg, var(--accent), #9c94ff)", borderRadius: 16, marginBottom: 16, animation: "glow 3s ease infinite" }}>
            <Icon name="brain" size={28} color="white"/>
          </div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>InterviewAI</div>
          <div style={{ color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-mono)", marginTop: 4 }}>AI-Powered Interview Preparation</div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          {/* Tab */}
          <div style={{ display: "flex", background: "var(--surface2)", borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex: 1, padding: "8px", borderRadius: 8, background: mode === m ? "var(--accent)" : "transparent", color: mode === m ? "white" : "var(--text-muted)", fontFamily: "var(--font-head)", fontSize: 14, fontWeight: 600, transition: "var(--transition)" }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Alex Johnson" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
              </div>
            )}
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})}/>
            </div>
            {mode === "register" && (
              <div>
                <label className="label">Target Role</label>
                <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            )}

            {error && <div style={{ color: "var(--accent2)", fontSize: 13, fontFamily: "var(--font-mono)", padding: "8px 12px", background: "rgba(255,107,107,0.1)", borderRadius: 8 }}>{error}</div>}

            <button className="btn-primary" onClick={handle} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/> Authenticating...</> : <>{mode === "login" ? "Sign In" : "Create Account"}<Icon name="arrow" size={16}/></>}
            </button>
          </div>

          <div className="divider"/>
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            Demo: demo@interviewai.com / demo123
          </div>
        </div>

        {/* Features */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
          {["AI Evaluation", "Resume NLP", "Mock Interviews", "Analytics"].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              <Icon name="check" size={12} color="var(--accent4)"/> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
const Dashboard = ({ user, sessions }) => {
  const totalSessions = sessions.length;
  const avgScore = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.avgScore, 0) / sessions.length) : 0;
  const bestScore = sessions.length ? Math.max(...sessions.map(s => s.avgScore)) : 0;
  const totalQs = sessions.reduce((a, s) => a + s.questions, 0);

  const stats = [
    { label: "Sessions", value: totalSessions, icon: "target", color: "var(--accent)" },
    { label: "Avg Score", value: avgScore, icon: "chart", color: "#9c94ff" },
    { label: "Best Score", value: bestScore, icon: "trophy", color: "var(--accent3)" },
    { label: "Questions", value: totalQs, icon: "code", color: "var(--accent4)" },
  ];

  const weekData = [
    { label: "Mon", value: 65 }, { label: "Tue", value: 72 }, { label: "Wed", value: 68 },
    { label: "Thu", value: 81 }, { label: "Fri", value: 79 }, { label: "Sat", value: 88 }, { label: "Sun", value: 84 },
  ];

  const radarSkills = [
    { label: "DSA", value: 72 }, { label: "System\nDesign", value: 58 }, { label: "JS", value: 85 },
    { label: "React", value: 88 }, { label: "SQL", value: 64 }, { label: "CS Fund", value: 76 },
  ];

  const recentActivity = [
    { text: "Completed Frontend Developer mock interview", time: "2h ago", score: 84, icon: "mic" },
    { text: "Resume analyzed — 78% ATS score", time: "1d ago", score: 78, icon: "doc" },
    { text: "Practiced 12 JavaScript questions", time: "2d ago", score: 91, icon: "code" },
    { text: "System Design session completed", time: "3d ago", score: 67, icon: "brain" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome */}
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>WELCOME BACK</div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Hello, {user.name.split(" ")[0]} 👋
          </div>
          <div style={{ color: "var(--text-muted)", marginTop: 4 }}>Ready to ace your next interview?</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="badge badge-accent"><Icon name="target" size={12}/> {user.role}</span>
          <span className="badge badge-green"><Icon name="check" size={12}/> Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 fade-up-1">
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{s.label.toUpperCase()}</div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={s.icon} size={16} color={s.color}/>
              </div>
            </div>
            <div className="stat-number" style={{ background: `linear-gradient(135deg, var(--text), ${s.color})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}{s.label === "Avg Score" || s.label === "Best Score" ? "%" : ""}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        {/* Weekly performance */}
        <div className="card fade-up-2" style={{ gridColumn: "span 2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16 }}>Weekly Performance</div>
            <span className="badge badge-green">↑ 12% vs last week</span>
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>Interview score trend over the past 7 days</div>
          <BarChart data={weekData} height={140}/>
        </div>

        {/* Skill Radar */}
        <div className="card fade-up-2" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, marginBottom: 4, alignSelf: "flex-start" }}>Skill Radar</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 12, alignSelf: "flex-start" }}>Competency overview</div>
          <RadarChart skills={radarSkills}/>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Activity */}
        <div className="card fade-up-3">
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Recent Activity</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--surface2)", borderRadius: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(108,99,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={a.icon} size={14} color="var(--accent)"/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{a.time}</div>
                </div>
                <span className={`badge ${a.score >= 80 ? "badge-green" : a.score >= 60 ? "badge-yellow" : "badge-red"}`}>{a.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Prep */}
        <div className="card fade-up-3">
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Prep Roadmap</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>Recommended focus areas</div>
          {[
            { topic: "System Design Fundamentals", progress: 35, priority: "High" },
            { topic: "Dynamic Programming", progress: 52, priority: "High" },
            { topic: "React Advanced Patterns", progress: 74, priority: "Medium" },
            { topic: "Database Optimization", progress: 28, priority: "Medium" },
            { topic: "Behavioral Questions", progress: 61, priority: "Low" },
          ].map((p, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.topic}</div>
                <span className={`badge ${p.priority === "High" ? "badge-red" : p.priority === "Medium" ? "badge-yellow" : "badge-green"}`}>{p.priority}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${p.progress}%` }}/>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 4 }}>{p.progress}% complete</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MOCK INTERVIEW ────────────────────────────────────────────────────────────
const MockInterview = ({ user, onSessionComplete }) => {
  const [phase, setPhase] = useState("setup"); // setup | interview | results
  const [config, setConfig] = useState({ role: user.role, difficulty: "Mixed", count: 5, mode: "text" });
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [currentEval, setCurrentEval] = useState(null);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      handleSubmitAnswer();
    }
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timeLeft]);

  const startInterview = () => {
    const pool = QDB[config.role] || DEFAULT_QS;
    let qs = [...pool];
    if (config.difficulty !== "Mixed") qs = qs.filter(q => q.difficulty === config.difficulty);
    if (!qs.length) qs = pool;
    const selected = qs.sort(() => Math.random() - 0.5).slice(0, Math.min(config.count, qs.length));
    setQuestions(selected);
    setCurrentQ(0);
    setAnswers([]);
    setPhase("interview");
    setTimeLeft(120);
    setTimerActive(true);
  };

  const handleSubmitAnswer = async () => {
    clearTimeout(timerRef.current);
    setTimerActive(false);
    setEvaluating(true);
    setAiTyping(true);
    await new Promise(r => setTimeout(r, 1800));
    setAiTyping(false);
    const evaluation = evaluateAnswer(questions[currentQ].q, answer);
    setCurrentEval(evaluation);
    setAnswers(prev => [...prev, { question: questions[currentQ], answer, evaluation }]);
    setEvaluating(false);
  };

  const nextQuestion = () => {
    setCurrentEval(null);
    setAnswer("");
    setShowFollowUp(false);
    setShowHint(false);
    if (currentQ + 1 < questions.length) {
      setCurrentQ(c => c + 1);
      setTimeLeft(120);
      setTimerActive(true);
    } else {
      setPhase("results");
      const avgScore = Math.round(answers.reduce((a, ans) => a + ans.evaluation.score, 0) / answers.length);
      onSessionComplete({ role: config.role, date: new Date().toLocaleDateString(), avgScore, questions: answers.length, difficulty: config.difficulty });
    }
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  // SETUP PHASE
  if (phase === "setup") return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="section-title fade-up"><Icon name="mic" size={24} color="var(--accent)"/> Mock Interview</div>
      <div className="section-sub fade-up-1">Configure your personalized AI interview session</div>

      <div className="card fade-up-2" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label className="label">Target Role</label>
          <select className="input" value={config.role} onChange={e => setConfig({...config, role: e.target.value})}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="grid-2">
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={config.difficulty} onChange={e => setConfig({...config, difficulty: e.target.value})}>
              {["Mixed","Easy","Medium","Hard"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Number of Questions</label>
            <select className="input" value={config.count} onChange={e => setConfig({...config, count: parseInt(e.target.value)})}>
              {[3,5,8,10].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Answer Mode</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[{id:"text",label:"Text",icon:"code"},{id:"voice",label:"Voice (Simulated)",icon:"mic"}].map(m => (
              <button key={m.id} onClick={() => setConfig({...config, mode: m.id})}
                style={{ flex: 1, padding: "12px", border: `1px solid ${config.mode === m.id ? "var(--accent)" : "var(--border)"}`, borderRadius: "var(--r)", background: config.mode === m.id ? "rgba(108,99,255,0.1)" : "var(--surface2)", color: config.mode === m.id ? "var(--accent)" : "var(--text-muted)", fontFamily: "var(--font-head)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "var(--transition)", fontSize: 14 }}>
                <Icon name={m.icon} size={16}/> {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "12px 16px", background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: "var(--r)", display: "flex", gap: 10 }}>
          <Icon name="info" size={16} color="var(--accent)"/>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>AI will evaluate your answers in real-time using NLP analysis. Each question has a 2-minute time limit. Follow-up questions may be asked.</div>
        </div>

        <button className="btn-primary" onClick={startInterview} style={{ justifyContent: "center", padding: 14, fontSize: 15 }}>
          <Icon name="play" size={16}/> Start Interview Session
        </button>
      </div>
    </div>
  );

  // INTERVIEW PHASE
  if (phase === "interview") {
    const q = questions[currentQ];
    const progress = (currentQ / questions.length) * 100;
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }} className="fade-up">
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>QUESTION {currentQ + 1} / {questions.length}</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700 }}>Mock Interview — {config.role}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className={`badge ${timeLeft > 60 ? "badge-green" : timeLeft > 30 ? "badge-yellow" : "badge-red"}`}>
              <Icon name="clock" size={11}/> {formatTime(timeLeft)}
            </span>
            <span className={`badge badge-${q.difficulty === "Easy" ? "green" : q.difficulty === "Medium" ? "yellow" : "red"}`}>{q.difficulty}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar" style={{ marginBottom: 24, height: 4 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }}/>
        </div>

        {/* Chat interface */}
        <div className="fade-up-1">
          {/* AI Question */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #9c94ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="brain" size={16} color="white"/>
            </div>
            <div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6 }}>InterviewAI • {q.category}</div>
              <div className="msg-ai">
                <div style={{ fontSize: 15, lineHeight: 1.6, fontFamily: "var(--font-body)" }}>{q.q}</div>
              </div>
              {showFollowUp && (
                <div className="msg-ai" style={{ marginTop: 8, borderColor: "rgba(255,217,61,0.2)", background: "rgba(255,217,61,0.05)" }}>
                  <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent3)", marginBottom: 4 }}>FOLLOW-UP</div>
                  <div style={{ fontSize: 14 }}>{q.followUp}</div>
                </div>
              )}
            </div>
          </div>

          {/* Evaluating */}
          {evaluating && (
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #9c94ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="brain" size={16} color="white"/>
              </div>
              <div>
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6 }}>InterviewAI is evaluating...</div>
                {aiTyping ? <TypingIndicator/> : null}
              </div>
            </div>
          )}

          {/* Evaluation Result */}
          {currentEval && !evaluating && (
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }} className="fade-up">
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #9c94ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="brain" size={16} color="white"/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6 }}>AI Evaluation Complete</div>
                <div className="msg-ai" style={{ maxWidth: "100%", width: "100%" }}>
                  {/* Score */}
                  <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
                    <ScoreRing score={currentEval.score} size={72}
                      color={currentEval.score >= 80 ? "var(--accent4)" : currentEval.score >= 60 ? "var(--accent3)" : "var(--accent2)"}/>
                    <div>
                      <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700 }}>{currentEval.sentiment}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{currentEval.feedback}</div>
                    </div>
                  </div>
                  {/* Sub-scores */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {[{l:"Clarity",v:currentEval.clarity},{l:"Depth",v:currentEval.depth},{l:"Relevance",v:currentEval.relevance}].map(s => (
                      <div key={s.l} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6 }}>{s.l.toUpperCase()}</div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${s.v}%` }}/></div>
                        <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent)", marginTop: 4 }}>{s.v}%</div>
                      </div>
                    ))}
                  </div>
                  {/* Keywords */}
                  {currentEval.keywords.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6 }}>MATCHED KEYWORDS</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {currentEval.keywords.map(k => <span key={k} className="skill-tag matched">✓ {k}</span>)}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button onClick={() => setShowFollowUp(true)} className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>
                    <Icon name="sparkle" size={13}/> Follow-up Q
                  </button>
                  <button onClick={nextQuestion} className="btn-primary" style={{ fontSize: 13, padding: "8px 14px" }}>
                    {currentQ + 1 < questions.length ? "Next Question" : "View Results"} <Icon name="arrow" size={13}/>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Answer Input */}
          {!currentEval && !evaluating && (
            <div style={{ marginTop: 8 }}>
              {config.mode === "voice" ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 32, background: "var(--surface2)", borderRadius: 16, border: "1px solid var(--border)" }}>
                  <button onClick={() => setRecording(r => !r)}
                    style={{ width: 72, height: 72, borderRadius: "50%", background: recording ? "rgba(255,107,107,0.2)" : "rgba(108,99,255,0.2)", border: `2px solid ${recording ? "var(--accent2)" : "var(--accent)"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", animation: recording ? "glow 1.5s ease infinite" : "none" }}>
                    {recording ? <div className="rec-dot"/> : <Icon name="mic" size={28} color="var(--accent)"/>}
                  </button>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {recording ? "Recording... Click to stop" : "Click microphone to start recording"}
                  </div>
                  {recording && (
                    <textarea className="input" rows={4} placeholder="Voice transcript will appear here..."
                      value={answer} onChange={e => setAnswer(e.target.value)}
                      style={{ marginTop: 8 }}/>
                  )}
                  {(answer || recording) && (
                    <button className="btn-primary" onClick={handleSubmitAnswer}>
                      <Icon name="send" size={14}/> Submit Answer
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label className="label" style={{ marginBottom: 0 }}>Your Answer</label>
                    <button onClick={() => setShowHint(h => !h)} style={{ background: "none", color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Icon name="info" size={12}/> {showHint ? "Hide" : "Show"} Hint
                    </button>
                  </div>
                  {showHint && (
                    <div style={{ padding: "10px 14px", background: "rgba(255,217,61,0.08)", border: "1px solid rgba(255,217,61,0.15)", borderRadius: "var(--r)", marginBottom: 10, fontSize: 13, color: "var(--text-muted)" }}>
                      <span style={{ color: "var(--accent3)", fontFamily: "var(--font-mono)", fontSize: 11 }}>HINT </span>
                      Think about key concepts, give a definition, then provide a concrete example.
                    </div>
                  )}
                  <textarea className="input" rows={5} placeholder="Type your answer here... Be specific and use examples."
                    value={answer} onChange={e => setAnswer(e.target.value)}/>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                    <button className="btn-primary" onClick={handleSubmitAnswer} disabled={!answer.trim()}>
                      <Icon name="send" size={14}/> Submit & Evaluate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // RESULTS PHASE
  const overallScore = answers.length ? Math.round(answers.reduce((a, ans) => a + ans.evaluation.score, 0) / answers.length) : 0;
  const scoreColor = overallScore >= 80 ? "var(--accent4)" : overallScore >= 60 ? "var(--accent3)" : "var(--accent2)";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="section-title fade-up">Session Results</div>
      <div className="section-sub fade-up-1">Here's your detailed performance breakdown</div>

      {/* Overall Score */}
      <div className="card fade-up-2" style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 20, background: `linear-gradient(135deg, var(--surface) 0%, rgba(108,99,255,0.05) 100%)`, flexWrap: "wrap" }}>
        <ScoreRing score={overallScore} size={120} color={scoreColor}/>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 800 }}>
            {overallScore >= 80 ? "Outstanding" : overallScore >= 65 ? "Good Performance" : overallScore >= 50 ? "Average" : "Needs Improvement"}
          </div>
          <div style={{ color: "var(--text-muted)", marginBottom: 12 }}>{config.role} • {answers.length} questions answered</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className={`badge ${overallScore >= 80 ? "badge-green" : overallScore >= 60 ? "badge-yellow" : "badge-red"}`}>
              Overall: {overallScore}%
            </span>
            <span className="badge badge-accent"><Icon name="target" size={11}/> {config.difficulty}</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button className="btn-ghost" onClick={() => { setPhase("setup"); setAnswers([]); }}>
            <Icon name="refresh" size={14}/> Retry
          </button>
        </div>
      </div>

      {/* Per-Question breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="fade-up-3">
        {answers.map((a, i) => (
          <div key={i} className="card">
            <div style={{ display: "flex", justify: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span className="badge badge-accent">Q{i+1}</span>
                  <span className={`badge ${a.question.difficulty === "Easy" ? "badge-green" : a.question.difficulty === "Medium" ? "badge-yellow" : "badge-red"}`}>{a.question.difficulty}</span>
                  <span className="badge" style={{ background: "var(--surface3)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{a.question.category}</span>
                </div>
                <div style={{ fontWeight: 500, marginBottom: 6, fontSize: 15 }}>{a.question.q}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10, fontStyle: "italic" }}>"{a.answer.substring(0, 120)}{a.answer.length > 120 ? "..." : ""}"</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{a.evaluation.feedback}</div>
              </div>
              <ScoreRing score={a.evaluation.score} size={64} color={a.evaluation.score >= 80 ? "var(--accent4)" : a.evaluation.score >= 60 ? "var(--accent3)" : "var(--accent2)"}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── RESUME ANALYZER ───────────────────────────────────────────────────────────
const ResumeAnalyzer = () => {
  const [text, setText] = useState("");
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const ROLE_SKILLS = {
    "Frontend Developer": ["React", "JavaScript", "TypeScript", "CSS", "HTML", "Redux", "Webpack", "Git", "REST API", "Performance"],
    "Backend Engineer": ["Node.js", "Python", "Java", "SQL", "REST API", "Microservices", "Docker", "Redis", "MongoDB", "Git"],
    "Data Scientist": ["Python", "Machine Learning", "TensorFlow", "Pandas", "NumPy", "SQL", "Statistics", "NLP", "PyTorch", "Scikit-learn"],
    "Full Stack Developer": ["React", "Node.js", "JavaScript", "SQL", "MongoDB", "Docker", "Git", "REST API", "TypeScript", "AWS"],
    "ML Engineer": ["Python", "TensorFlow", "PyTorch", "Kubernetes", "Docker", "MLflow", "SQL", "Spark", "Scala", "CI/CD"],
    "DevOps Engineer": ["Docker", "Kubernetes", "CI/CD", "Jenkins", "AWS", "Terraform", "Linux", "Python", "Ansible", "Git"],
  };

  const analyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 2500));
    
    const requiredSkills = ROLE_SKILLS[targetRole] || ROLE_SKILLS["Full Stack Developer"];
    const textUpper = text.toUpperCase();
    const matched = requiredSkills.filter(s => textUpper.includes(s.toUpperCase()));
    const missing = requiredSkills.filter(s => !textUpper.includes(s.toUpperCase()));
    
    // Extract info
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}/);
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    
    // Compute scores
    const skillScore = Math.round((matched.length / requiredSkills.length) * 100);
    const lengthScore = words > 200 && words < 800 ? 90 : words <= 200 ? 60 : 70;
    const formatScore = (emailMatch ? 20 : 0) + (phoneMatch ? 15 : 0) + (text.includes("EXPERIENCE") || text.includes("Experience") ? 20 : 0) + (text.includes("EDUCATION") || text.includes("Education") ? 20 : 0) + (sentences > 5 ? 25 : 10);
    const atsScore = Math.round(skillScore * 0.5 + Math.min(formatScore, 100) * 0.3 + lengthScore * 0.2);
    
    const improvements = [];
    if (missing.length > 3) improvements.push(`Add missing skills: ${missing.slice(0,3).join(", ")}`);
    if (!emailMatch) improvements.push("Include professional email address");
    if (!phoneMatch) improvements.push("Add contact phone number");
    if (words < 200) improvements.push("Expand content — resume seems too brief");
    if (words > 800) improvements.push("Trim content — keep resume to 1-2 pages");
    if (!text.includes("•") && !text.includes("-")) improvements.push("Use bullet points for better readability");
    improvements.push("Quantify achievements with numbers and metrics");
    improvements.push("Use action verbs (Led, Built, Designed, Optimized)");

    setResult({ atsScore, skillScore, matched, missing, improvements, words, emailMatch, phoneMatch, targetRole });
    setAnalyzing(false);
  };

  return (
    <div>
      <div className="section-title fade-up"><Icon name="doc" size={24} color="var(--accent)"/> Resume Analyzer</div>
      <div className="section-sub fade-up-1">NLP-powered ATS scoring and skill gap analysis</div>

      {!result ? (
        <div className="grid-2 fade-up-2">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Target Role</label>
              <select className="input" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Upload area */}
            <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) setText(`[File: ${file.name}]\n\nAlex Johnson\nalex@example.com | +91 98765 43210\n\nEXPERIENCE\nSenior Frontend Developer — TechCorp (2021-Present)\n• Built React applications with TypeScript and Redux\n• Optimized performance using lazy loading and code splitting\n• REST API integration with Node.js backend\n\nEDUCATION\nMCA — Punjabi University (2022-2024)\nBCA — PAU Ludhiana (2019-2022)\n\nSKILLS\nReact, JavaScript, TypeScript, HTML, CSS, Git, Webpack, REST API`); }}
              style={{ border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`, borderRadius: "var(--r-lg)", padding: 32, textAlign: "center", background: dragOver ? "rgba(108,99,255,0.05)" : "var(--surface)", cursor: "pointer", transition: "var(--transition)" }}>
              <Icon name="upload" size={32} color={dragOver ? "var(--accent)" : "var(--text-dim)"}/>
              <div style={{ marginTop: 12, fontFamily: "var(--font-head)", fontWeight: 600 }}>Drop your resume here</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>PDF, DOC, or TXT • Drag & Drop</div>
            </div>

            <div style={{ textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: 12 }}>— or paste text below —</div>

            <div>
              <label className="label">Resume Text</label>
              <textarea className="input" rows={10} placeholder="Paste your resume content here..." value={text} onChange={e => setText(e.target.value)}/>
            </div>

            <button className="btn-primary" onClick={() => { if (!text) setText("Alex Johnson\nalex@example.com | +91 98765 43210\n\nEXPERIENCE\nSenior Frontend Developer — TechCorp (2021-2024)\n• Built React applications with TypeScript, Redux, and REST APIs\n• Improved web performance by 40% using lazy loading and code splitting\n• Led team of 3 developers on e-commerce platform\n\nEDUCATION\nMCA — Punjabi University, Ludhiana (2022-2024)\nBCA — PAU (2019-2022)\n\nSKILLS\nReact, JavaScript, TypeScript, HTML, CSS, Git, Webpack, REST API, Node.js\n\nPROJECTS\n• InterviewAI Platform — AI-powered mock interview system (React, Node.js)\n• E-Commerce Site — Full-stack with payment integration"); }} style={{ background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "8px 16px", fontSize: 13, fontFamily: "var(--font-mono)" }}>
              Load Sample Resume
            </button>

            <button className="btn-primary" onClick={analyze} disabled={!text.trim() || analyzing} style={{ justifyContent: "center", padding: 14, fontSize: 15, opacity: !text.trim() ? 0.5 : 1 }}>
              {analyzing ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/> Analyzing...</> : <><Icon name="sparkle" size={16}/> Analyze Resume</>}
            </button>
          </div>

          {/* Info panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, marginBottom: 12 }}>What We Analyze</div>
              {[
                { icon: "target", label: "ATS Compatibility Score", desc: "Keyword matching against job requirements" },
                { icon: "code", label: "Skill Gap Analysis", desc: "Missing skills for your target role" },
                { icon: "doc", label: "Format & Structure", desc: "Contact info, sections, readability" },
                { icon: "chart", label: "Content Quality", desc: "Action verbs, quantification, length" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(108,99,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={f.icon} size={14} color="var(--accent)"/>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ background: "rgba(107,203,119,0.05)", borderColor: "rgba(107,203,119,0.15)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent4)", marginBottom: 8 }}>PRO TIP</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
                Tailor your resume for each role. ATS systems scan for role-specific keywords before a human ever sees your resume. Target 75%+ skill match for best results.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fade-up">
          {/* ATS Score */}
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 20, flexWrap: "wrap" }}>
            <ScoreRing score={result.atsScore} size={110}
              color={result.atsScore >= 80 ? "var(--accent4)" : result.atsScore >= 60 ? "var(--accent3)" : "var(--accent2)"}/>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>ATS COMPATIBILITY SCORE</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                {result.atsScore >= 80 ? "ATS Ready" : result.atsScore >= 60 ? "Moderate Match" : "Needs Improvement"}
              </div>
              <div style={{ color: "var(--text-muted)", marginBottom: 10 }}>Optimized for: {result.targetRole}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <span className={`badge ${result.atsScore >= 80 ? "badge-green" : result.atsScore >= 60 ? "badge-yellow" : "badge-red"}`}>
                  ATS: {result.atsScore}%
                </span>
                <span className="badge badge-accent">Skills: {result.skillScore}%</span>
                <span className="badge" style={{ background: "var(--surface3)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{result.words} words</span>
              </div>
            </div>
            <button className="btn-ghost" onClick={() => setResult(null)} style={{ marginLeft: "auto" }}>
              <Icon name="refresh" size={14}/> Analyze Again
            </button>
          </div>

          <div className="grid-2">
            {/* Skills */}
            <div className="card">
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, marginBottom: 4 }}>Skill Gap Analysis</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>{result.matched.length}/{result.matched.length + result.missing.length} required skills found</div>
              <div className="progress-bar" style={{ marginBottom: 16 }}>
                <div className="progress-fill" style={{ width: `${result.skillScore}%` }}/>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent4)", marginBottom: 8 }}>✓ MATCHED SKILLS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {result.matched.map(s => <span key={s} className="skill-tag matched">{s}</span>)}
                  {result.matched.length === 0 && <span style={{ color: "var(--text-dim)", fontSize: 13 }}>No matching skills found</span>}
                </div>
              </div>
              {result.missing.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent2)", marginBottom: 8 }}>✗ MISSING SKILLS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.missing.map(s => <span key={s} className="skill-tag missing">{s}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* Improvements */}
            <div className="card">
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, marginBottom: 4 }}>AI Recommendations</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>Actionable improvements to boost your score</div>
              {result.improvements.map((imp, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, padding: "10px 12px", background: "var(--surface2)", borderRadius: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,107,107,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Icon name="arrow" size={12} color="var(--accent2)"/>
                  </div>
                  <div style={{ fontSize: 13 }}>{imp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── QUESTION BANK ─────────────────────────────────────────────────────────────
const QuestionBank = () => {
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [answer, setAnswer] = useState("");
  const [evalResult, setEvalResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const pool = QDB[role] || DEFAULT_QS;
  const filtered = pool.filter(q =>
    (difficulty === "All" || q.difficulty === difficulty) &&
    (q.q.toLowerCase().includes(search.toLowerCase()) || q.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handlePractice = async () => {
    setEvaluating(true);
    await new Promise(r => setTimeout(r, 1600));
    const ev = evaluateAnswer(selected.q, answer);
    setEvalResult(ev);
    setEvaluating(false);
  };

  return (
    <div>
      <div className="section-title fade-up"><Icon name="code" size={24} color="var(--accent)"/> Question Bank</div>
      <div className="section-sub fade-up-1">Browse {pool.length}+ curated interview questions with AI-powered practice</div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }} className="fade-up-2">
        <input className="input" style={{ flex: 1, minWidth: 200 }} placeholder="🔍 Search questions..." value={search} onChange={e => setSearch(e.target.value)}/>
        <select className="input" style={{ width: 200 }} value={role} onChange={e => setRole(e.target.value)}>
          {Object.keys(QDB).map(r => <option key={r}>{r}</option>)}
        </select>
        <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", overflow: "hidden" }}>
          {["All","Easy","Medium","Hard"].map(d => (
            <button key={d} onClick={() => setDifficulty(d)}
              style={{ padding: "10px 16px", background: difficulty === d ? "var(--accent)" : "transparent", color: difficulty === d ? "white" : "var(--text-muted)", fontFamily: "var(--font-head)", fontSize: 13, transition: "var(--transition)", borderRight: "1px solid var(--border)" }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2">
        {/* Question List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="fade-up-3">
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No questions match your filters.</div>
          )}
          {filtered.map((q, i) => (
            <div key={q.id} onClick={() => { setSelected(q); setAnswer(""); setEvalResult(null); setPracticeMode(false); }}
              className="card" style={{ cursor: "pointer", borderColor: selected?.id === q.id ? "var(--accent)" : "var(--border)", background: selected?.id === q.id ? "rgba(108,99,255,0.05)" : "var(--surface)", transition: "var(--transition)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <span className={`badge ${q.difficulty === "Easy" ? "badge-green" : q.difficulty === "Medium" ? "badge-yellow" : "badge-red"}`}>{q.difficulty}</span>
                  <span className="badge" style={{ background: "var(--surface3)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{q.category}</span>
                </div>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>Q{i + 1}</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>{q.q}</div>
            </div>
          ))}
        </div>

        {/* Practice Panel */}
        <div className="fade-up-3">
          {!selected ? (
            <div className="card" style={{ textAlign: "center", padding: 48 }}>
              <Icon name="target" size={40} color="var(--text-dim)"/>
              <div style={{ marginTop: 16, fontFamily: "var(--font-head)", color: "var(--text-muted)" }}>Select a question to practice</div>
            </div>
          ) : (
            <div className="card" style={{ position: "sticky", top: 20 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                <span className={`badge ${selected.difficulty === "Easy" ? "badge-green" : selected.difficulty === "Medium" ? "badge-yellow" : "badge-red"}`}>{selected.difficulty}</span>
                <span className="badge badge-accent">{selected.category}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, lineHeight: 1.6 }}>{selected.q}</div>

              {!practiceMode ? (
                <button className="btn-primary" onClick={() => setPracticeMode(true)} style={{ width: "100%", justifyContent: "center" }}>
                  <Icon name="play" size={14}/> Practice This Question
                </button>
              ) : (
                <>
                  <label className="label">Your Answer</label>
                  <textarea className="input" rows={5} placeholder="Type your answer..." value={answer} onChange={e => setAnswer(e.target.value)} style={{ marginBottom: 12 }}/>
                  
                  <button className="btn-primary" onClick={handlePractice} disabled={!answer.trim() || evaluating} style={{ width: "100%", justifyContent: "center", marginBottom: evalResult ? 16 : 0 }}>
                    {evaluating ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/> Evaluating...</> : <><Icon name="sparkle" size={14}/> Evaluate</>}
                  </button>

                  {evalResult && (
                    <div style={{ padding: 16, background: "var(--surface2)", borderRadius: 10, marginTop: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                        <ScoreRing score={evalResult.score} size={60} color={evalResult.score >= 80 ? "var(--accent4)" : evalResult.score >= 60 ? "var(--accent3)" : "var(--accent2)"}/>
                        <div>
                          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700 }}>{evalResult.sentiment}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{evalResult.feedback}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6 }}>FOLLOW-UP:</div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>{selected.followUp}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── AI COACH ──────────────────────────────────────────────────────────────────
const AICoach = () => {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm your AI Interview Coach. I can help you with interview strategies, answer frameworks, company research, salary negotiation, and more. What would you like to work on today?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const RESPONSES = {
    "star": "The **STAR method** is the gold standard for behavioral questions:\n\n**S**ituation — Set the context briefly (1-2 sentences)\n**T**ask — Describe your responsibility\n**A**ction — Explain specifically what YOU did (use 'I', not 'we')\n**R**esult — Quantify the outcome (%, time saved, revenue impact)\n\nExample: 'Tell me about a time you improved performance'\n→ 'At TechCorp (S), I was responsible for our slow React dashboard (T). I implemented code splitting, lazy loading, and memoization (A). This reduced load time by 60% and improved user retention by 23% (R).'\n\nAlways try to quantify your results — numbers make your answers memorable!",
    "salary": "Salary negotiation tips:\n\n1. **Research first** — Check Glassdoor, LinkedIn Salary, and Levels.fyi for market rates\n2. **Never give first** — When asked 'What are your expectations?', redirect: 'I'd love to understand the full scope first. What's the budget range for this role?'\n3. **Anchor high** — Start 15-20% above your target\n4. **Total comp matters** — Consider equity, bonuses, benefits, learning budget, flexibility\n5. **Get it in writing** — Always confirm offers via email\n6. **Competing offers** — Having another offer is your strongest leverage\n\nFor MCA freshers in India: ₹6-15 LPA is typical at product companies. Don't undersell!",
    "system design": "System Design Interview Framework:\n\n**1. Clarify Requirements** (5 min)\n→ Functional: What features? Scale? Users?\n→ Non-functional: Latency? Consistency? Availability?\n\n**2. Estimation** (5 min)\n→ Users, QPS, storage, bandwidth\n\n**3. High-Level Design** (10 min)\n→ Draw major components: Load Balancer, API Servers, DB, Cache, CDN\n\n**4. Deep Dive** (15 min)\n→ Database schema, API design, key algorithms\n\n**5. Bottlenecks & Trade-offs** (5 min)\n→ Where would it fail? How to scale?\n\nCommon patterns: Caching (Redis), Message Queue (Kafka), Database sharding, CDN, Rate limiting",
    "weakness": "Answering 'What's your weakness?' strategically:\n\n✅ **Do:** Choose a real weakness that's not core to the role, show self-awareness, and demonstrate active improvement\n\n✅ **Formula:** [Weakness] + [Why it was a problem] + [Steps you're taking to improve] + [Progress]\n\n**Example:** 'I used to struggle with public speaking. In my MCA project presentations, I noticed I was less confident. I joined a Toastmasters club online, started leading stand-ups at internship, and gave 10+ tech talks. I still get nervous but I now channel that into preparation.'\n\n❌ **Avoid:** Humble brags ('I work too hard'), irrelevant answers, core job skills, no improvement plan",
    "default": "Great question! Let me help you with that.\n\nFor interview preparation, I'd recommend focusing on:\n\n1. **Technical fundamentals** — Make sure your core CS concepts are solid\n2. **Problem-solving approach** — Practice thinking aloud and breaking problems down\n3. **Behavioral stories** — Prepare 5-7 STAR stories covering leadership, conflict, failure, achievement\n4. **Company research** — Understand the company's products, culture, and recent news\n5. **Ask good questions** — Prepare thoughtful questions that show genuine interest\n\nWould you like me to do a mock interview on any specific topic, or go deeper on any of these areas?"
  };

  const getResponse = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes("star") || lower.includes("behavioral") || lower.includes("situation")) return RESPONSES.star;
    if (lower.includes("salary") || lower.includes("negotiat") || lower.includes("pay") || lower.includes("ctc")) return RESPONSES.salary;
    if (lower.includes("system design") || lower.includes("architecture") || lower.includes("scale")) return RESPONSES["system design"];
    if (lower.includes("weakness") || lower.includes("weakness") || lower.includes("improve")) return RESPONSES.weakness;
    return RESPONSES.default;
  };

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    setTyping(false);
    setMessages(m => [...m, { role: "ai", text: getResponse(userMsg) }]);
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const quickPrompts = ["How do I answer behavioral questions?", "Help with salary negotiation", "System design framework", "How to answer 'What's your weakness?'"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <div className="section-title fade-up"><Icon name="sparkle" size={24} color="var(--accent)"/> AI Coach</div>
      <div className="section-sub fade-up-1">Your personal interview strategist — ask anything</div>

      {/* Quick prompts */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }} className="fade-up-2">
        {quickPrompts.map(p => (
          <button key={p} onClick={() => { setInput(p); }} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>{p}</button>
        ))}
      </div>

      {/* Messages */}
      <div className="card scrollable fade-up-3" style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 10 }}>
            {m.role === "ai" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #9c94ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="brain" size={14} color="white"/>
              </div>
            )}
            <div className={m.role === "user" ? "msg-user" : "msg-ai"} style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-body)", lineHeight: 1.7 }}>
              {m.text.replace(/\*\*(.*?)\*\*/g, "$1")}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #9c94ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="brain" size={14} color="white"/>
            </div>
            <TypingIndicator/>
          </div>
        )}
        <div ref={messagesEndRef}/>
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, marginTop: 12 }} className="fade-up-4">
        <input className="input" placeholder="Ask your AI coach anything..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          style={{ flex: 1 }}/>
        <button className="btn-primary" onClick={send} disabled={!input.trim()} style={{ padding: "10px 18px" }}>
          <Icon name="send" size={16}/>
        </button>
      </div>
    </div>
  );
};

// ─── ANALYTICS ─────────────────────────────────────────────────────────────────
const Analytics = ({ sessions }) => {
  const mockSessions = sessions.length ? sessions : [
    { role: "Frontend Developer", date: "Feb 20", avgScore: 84, questions: 5, difficulty: "Medium" },
    { role: "Frontend Developer", date: "Feb 18", avgScore: 72, questions: 8, difficulty: "Hard" },
    { role: "Backend Engineer", date: "Feb 15", avgScore: 67, questions: 5, difficulty: "Mixed" },
    { role: "Data Scientist", date: "Feb 12", avgScore: 88, questions: 6, difficulty: "Easy" },
    { role: "Frontend Developer", date: "Feb 10", avgScore: 79, questions: 5, difficulty: "Medium" },
  ];

  const avgScore = Math.round(mockSessions.reduce((a, s) => a + s.avgScore, 0) / mockSessions.length);
  const byRole = {};
  mockSessions.forEach(s => { if (!byRole[s.role]) byRole[s.role] = []; byRole[s.role].push(s.avgScore); });
  const roleAvgs = Object.entries(byRole).map(([r, scores]) => ({
    label: r.split(" ").map(w => w[0]).join("").substring(0, 3),
    fullLabel: r,
    value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    color: `hsl(${Object.keys(byRole).indexOf(r) * 60 + 220}, 70%, 65%)`
  }));

  const strengthData = [
    { skill: "JavaScript / TypeScript", score: 87 },
    { skill: "React Ecosystem", score: 84 },
    { skill: "CSS & Styling", score: 79 },
    { skill: "System Design", score: 58 },
    { skill: "Data Structures", score: 71 },
    { skill: "Behavioral", score: 82 },
    { skill: "Problem Solving", score: 74 },
  ];

  return (
    <div>
      <div className="section-title fade-up"><Icon name="chart" size={24} color="var(--accent)"/> Analytics</div>
      <div className="section-sub fade-up-1">Deep performance insights and learning trends</div>

      {/* Top KPIs */}
      <div className="grid-4 fade-up-2" style={{ marginBottom: 24 }}>
        {[
          { label: "Sessions", value: mockSessions.length, icon: "target", sub: "Total completed", color: "var(--accent)" },
          { label: "Avg Score", value: `${avgScore}%`, icon: "chart", sub: "Across all sessions", color: "#9c94ff" },
          { label: "Best Session", value: `${Math.max(...mockSessions.map(s => s.avgScore))}%`, icon: "trophy", sub: "Highest achieved", color: "var(--accent3)" },
          { label: "Improvement", value: "+12%", icon: "bolt", sub: "Last 7 days", color: "var(--accent4)" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{s.label.toUpperCase()}</div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={s.icon} size={14} color={s.color}/>
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 fade-up-3">
        {/* Score by Role */}
        <div className="card">
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, marginBottom: 4 }}>Score by Role</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>Average performance per interview category</div>
          <BarChart data={roleAvgs} height={150}/>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {roleAvgs.map(r => (
              <div key={r.fullLabel} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: r.color }}/>
                {r.fullLabel}
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="card">
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, marginBottom: 4 }}>Skill Proficiency</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>Performance breakdown by topic area</div>
          {strengthData.map(s => (
            <div key={s.skill} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ fontSize: 13 }}>{s.skill}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: s.score >= 80 ? "var(--accent4)" : s.score >= 65 ? "var(--accent3)" : "var(--accent2)" }}>{s.score}%</div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${s.score}%`, background: s.score >= 80 ? "linear-gradient(90deg, var(--accent4), #91e89a)" : s.score >= 65 ? "linear-gradient(90deg, var(--accent3), #ffe77a)" : "linear-gradient(90deg, var(--accent2), #ff9494)" }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session History */}
      <div className="card fade-up-4" style={{ marginTop: 20 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, marginBottom: 16 }}>Session History</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Date","Role","Questions","Difficulty","Score","Status"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.05em" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockSessions.map((s, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px", fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{s.date}</td>
                  <td style={{ padding: "12px", fontSize: 13 }}>{s.role}</td>
                  <td style={{ padding: "12px", fontSize: 13, fontFamily: "var(--font-mono)" }}>{s.questions}</td>
                  <td style={{ padding: "12px" }}><span className={`badge ${s.difficulty === "Easy" ? "badge-green" : s.difficulty === "Hard" ? "badge-red" : "badge-yellow"}`}>{s.difficulty}</span></td>
                  <td style={{ padding: "12px" }}>
                    <span className={`badge ${s.avgScore >= 80 ? "badge-green" : s.avgScore >= 60 ? "badge-yellow" : "badge-red"}`}>{s.avgScore}%</span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span className={`badge ${s.avgScore >= 70 ? "badge-green" : "badge-red"}`}>{s.avgScore >= 70 ? "Passed" : "Retry"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── PROFILE ───────────────────────────────────────────────────────────────────
const Profile = ({ user, sessions }) => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ ...user, bio: "MCA Final Year student passionate about full-stack development and AI. Preparing for placements at top product companies.", github: "github.com/alexj", linkedin: "linkedin.com/in/alexj", targetCompanies: "Google, Amazon, Flipkart, Paytm" });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="section-title fade-up"><Icon name="user" size={24} color="var(--accent)"/> Profile</div>
      <div className="section-sub fade-up-1">Manage your interview prep profile and preferences</div>

      <div className="card fade-up-2" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg, var(--accent), #9c94ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontFamily: "var(--font-head)", fontWeight: 800, flexShrink: 0 }}>
            {user.avatar || user.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 800 }}>{profile.name}</div>
            <div style={{ color: "var(--text-muted)", marginBottom: 8 }}>{profile.email}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="badge badge-accent"><Icon name="target" size={11}/> {profile.role}</span>
              <span className="badge badge-green"><Icon name="check" size={11}/> {sessions.length} sessions</span>
              <span className="badge" style={{ background: "var(--surface3)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Joined {user.joined}</span>
            </div>
          </div>
          <button className="btn-ghost" onClick={() => setEditing(e => !e)}>
            <Icon name="settings" size={14}/> {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {!editing ? (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>{profile.bio}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>📌 {profile.github}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>🔗 {profile.linkedin}</div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="grid-2">
              <div><label className="label">Full Name</label><input className="input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}/></div>
              <div><label className="label">Email</label><input className="input" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})}/></div>
            </div>
            <div><label className="label">Target Role</label>
              <select className="input" value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div><label className="label">Bio</label><textarea className="input" rows={3} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})}/></div>
            <div className="grid-2">
              <div><label className="label">GitHub</label><input className="input" value={profile.github} onChange={e => setProfile({...profile, github: e.target.value})}/></div>
              <div><label className="label">LinkedIn</label><input className="input" value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})}/></div>
            </div>
            <div><label className="label">Target Companies</label><input className="input" value={profile.targetCompanies} onChange={e => setProfile({...profile, targetCompanies: e.target.value})}/></div>
            <button className="btn-primary" onClick={() => setEditing(false)} style={{ width: "fit-content" }}>
              <Icon name="check" size={14}/> Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid-3 fade-up-3">
        {[
          { label: "Total Sessions", value: sessions.length || 5, icon: "target" },
          { label: "Avg Score", value: sessions.length ? `${Math.round(sessions.reduce((a,s)=>a+s.avgScore,0)/sessions.length)}%` : "78%", icon: "chart" },
          { label: "Questions Done", value: sessions.reduce((a,s)=>a+s.questions,0) || 34, icon: "code" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(108,99,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Icon name={s.icon} size={20} color="var(--accent)"/>
            </div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Target companies */}
      <div className="card fade-up-4" style={{ marginTop: 20 }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, marginBottom: 12 }}>Target Companies</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {profile.targetCompanies.split(",").map(c => (
            <span key={c.trim()} className="skill-tag" style={{ fontSize: 13, padding: "6px 14px" }}>{c.trim()}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [sessions, setSessions] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "interview", label: "Mock Interview", icon: "mic" },
    { id: "questions", label: "Question Bank", icon: "code" },
    { id: "resume", label: "Resume Analyzer", icon: "doc" },
    { id: "coach", label: "AI Coach", icon: "brain" },
    { id: "analytics", label: "Analytics", icon: "chart" },
    { id: "profile", label: "Profile", icon: "user" },
  ];

  if (!user) return (
    <><GlobalStyle/><div className="noise"><AuthScreen onLogin={(u) => { setUser(u); setPage("dashboard"); }}/></div></>
  );

  return (
    <>
      <GlobalStyle/>
      <div className="noise" style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: sidebarCollapsed ? 70 : 240, background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100 }}>
          {/* Logo */}
          <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), #9c94ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, animation: "float 4s ease infinite" }}>
              <Icon name="brain" size={18} color="white"/>
            </div>
            {!sidebarCollapsed && <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>InterviewAI</div>}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
            {navItems.map(item => (
              <div key={item.id} className={`sidebar-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}
                style={{ justifyContent: sidebarCollapsed ? "center" : "flex-start" }} title={sidebarCollapsed ? item.label : ""}>
                <Icon name={item.icon} size={18}/>
                {!sidebarCollapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
              </div>
            ))}
          </nav>

          {/* User + collapse */}
          <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
            {!sidebarCollapsed && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: "var(--r)", background: "var(--surface2)", marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #9c94ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {user.avatar}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.role}</div>
                </div>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(c => !c)} className="sidebar-item" style={{ width: "100%", justifyContent: sidebarCollapsed ? "center" : "flex-start", background: "var(--surface2)" }}>
              <Icon name="arrow" size={16} color="var(--text-muted)"/>
              {!sidebarCollapsed && <span>Collapse</span>}
            </button>
            {!sidebarCollapsed && (
              <button onClick={() => setUser(null)} className="sidebar-item" style={{ width: "100%", color: "var(--accent2)", marginTop: 4 }}>
                <Icon name="logout" size={16} color="var(--accent2)"/><span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, marginLeft: sidebarCollapsed ? 70 : 240, transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {/* Top bar */}
          <div style={{ height: 60, borderBottom: "1px solid var(--border)", background: "rgba(10,10,15,0.8)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 50 }}>
            <div>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16 }}>
                {navItems.find(n => n.id === page)?.label}
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="badge badge-accent"><Icon name="sparkle" size={11}/> AI Active</span>
              <span className="badge badge-green"><Icon name="lock" size={11}/> Secure</span>
            </div>
          </div>

          {/* Page */}
          <div style={{ flex: 1, padding: "32px 28px", maxWidth: 1200, width: "100%" }} key={page} className="grid-bg">
            {page === "dashboard" && <Dashboard user={user} sessions={sessions}/>}
            {page === "interview" && <MockInterview user={user} onSessionComplete={s => setSessions(prev => [s, ...prev])}/>}
            {page === "questions" && <QuestionBank/>}
            {page === "resume" && <ResumeAnalyzer/>}
            {page === "coach" && <AICoach/>}
            {page === "analytics" && <Analytics sessions={sessions}/>}
            {page === "profile" && <Profile user={user} sessions={sessions}/>}
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid var(--border)", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
              InterviewAI Platform v2.0 • MCA Final Year Project • 550 Marks
            </div>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
              Built with React • AI/ML • NLP • Full-Stack Architecture
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
