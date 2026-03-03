// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useState } from "react";

const OPENROUTER_MODEL = "google/gemini-2.0-flash-001";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`;

function parseCommits(rawLog) {
  const lines = rawLog.trim().split("\n").filter((l) => l.trim());
  const ticketRegex = /([A-Z][A-Z0-9]+-\d+)/g;
  const commits = [];
  for (const line of lines) {
    const tickets = [...line.matchAll(ticketRegex)].map((m) => m[1]);
    if (tickets.length > 0) commits.push({ line: line.trim(), tickets });
  }
  return commits;
}

function groupByTicket(commits) {
  const groups = {};
  for (const commit of commits) {
    for (const ticket of commit.tickets) {
      if (!groups[ticket]) groups[ticket] = [];
      groups[ticket].push(commit.line);
    }
  }
  return groups;
}

function secToHuman(s) {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const css = `
  ${FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #070710; }

  .app {
    min-height: 100vh;
    background: #070710;
    color: #dde3f0;
    font-family: 'Syne', sans-serif;
    padding: 0 0 80px;
  }

  .header {
    border-bottom: 1px solid #1e1e35;
    padding: 22px 40px;
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255,255,255,0.01);
    backdrop-filter: blur(8px);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .header-logo {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .header-title { font-size: 18px; font-weight: 800; letter-spacing: -0.3px; }
  .header-sub { font-size: 12px; color: #4a5278; font-family: 'JetBrains Mono', monospace; margin-left: auto; }

  .steps-bar {
    display: flex;
    gap: 0;
    padding: 28px 40px 0;
    max-width: 860px;
    margin: 0 auto;
  }
  .step-item {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    position: relative;
  }
  .step-item:not(:last-child)::after {
    content: '';
    position: absolute;
    left: calc(50% + 16px);
    right: calc(-50% + 16px);
    top: 14px;
    height: 1px;
    background: #1e1e35;
    z-index: 0;
  }
  .step-item.active .step-num { background: #f59e0b; color: #070710; border-color: #f59e0b; }
  .step-item.done .step-num { background: #10b981; color: #fff; border-color: #10b981; }
  .step-num {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1px solid #2a2a45;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    background: #0e0e1e;
    z-index: 1;
    flex-shrink: 0;
    transition: all 0.3s;
  }
  .step-label { font-size: 11px; color: #4a5278; white-space: nowrap; }
  .step-item.active .step-label, .step-item.done .step-label { color: #dde3f0; }

  .container { max-width: 860px; margin: 0 auto; padding: 32px 40px 0; }

  .card {
    background: #0d0d1f;
    border: 1px solid #1e1e35;
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 20px;
  }
  .card-title {
    font-size: 13px;
    font-weight: 700;
    color: #f59e0b;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .card-title::before {
    content: '';
    width: 3px; height: 14px;
    background: #f59e0b;
    border-radius: 2px;
  }

  .field { margin-bottom: 18px; }
  .label {
    display: block;
    font-size: 12px;
    color: #6b7494;
    margin-bottom: 7px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.3px;
  }
  input[type=text], input[type=date], input[type=number], textarea, select {
    width: 100%;
    background: #07070f;
    border: 1px solid #1e1e35;
    border-radius: 8px;
    padding: 10px 14px;
    color: #dde3f0;
    font-size: 13px;
    font-family: 'JetBrains Mono', monospace;
    outline: none;
    transition: border-color 0.2s;
  }
  input[type=text]:focus, input[type=date]:focus, input[type=number]:focus, textarea:focus {
    border-color: #f59e0b44;
    box-shadow: 0 0 0 3px #f59e0b11;
  }
  textarea { resize: vertical; min-height: 160px; line-height: 1.6; }

  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  .hint {
    font-size: 11px;
    color: #3a4060;
    margin-top: 6px;
    font-family: 'JetBrains Mono', monospace;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 22px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    letter-spacing: 0.3px;
  }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary {
    background: linear-gradient(135deg, #f59e0b, #f97316);
    color: #070710;
    box-shadow: 0 4px 20px #f59e0b33;
  }
  .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px #f59e0b44; }
  .btn-ghost {
    background: transparent;
    color: #6b7494;
    border: 1px solid #1e1e35;
  }
  .btn-ghost:hover:not(:disabled) { border-color: #3a3a55; color: #dde3f0; }
  .btn-danger {
    background: #ef444420;
    color: #ef4444;
    border: 1px solid #ef444433;
  }
  .btn-success {
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
    box-shadow: 0 4px 20px #10b98133;
  }
  .btn-success:hover:not(:disabled) { transform: translateY(-1px); }

  .actions { display: flex; gap: 10px; align-items: center; margin-top: 8px; }

  .error-box {
    background: #ef444415;
    border: 1px solid #ef444433;
    border-radius: 10px;
    padding: 12px 16px;
    color: #ef4444;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ticket-tag {
    display: inline-flex;
    align-items: center;
    background: #f59e0b15;
    border: 1px solid #f59e0b33;
    color: #f59e0b;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    padding: 2px 8px;
    border-radius: 4px;
    margin: 2px;
  }

  .entry-card {
    background: #07070f;
    border: 1px solid #1e1e35;
    border-radius: 12px;
    padding: 18px;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }
  .entry-card:hover { border-color: #2a2a45; }
  .entry-card:focus-within { border-color: #f59e0b33; }

  .entry-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }
  .entry-ticket {
    background: #f59e0b15;
    border: 1px solid #f59e0b44;
    color: #f59e0b;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 6px;
  }
  .entry-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #10b981;
    margin-left: auto;
  }
  .entry-date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #4a5278;
  }
  .entry-field input, .entry-field textarea {
    margin-bottom: 0;
  }
  .entry-grid { display: grid; grid-template-columns: 1fr 120px 140px; gap: 10px; }

  .result-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 13px;
    font-family: 'JetBrains Mono', monospace;
  }
  .result-ok { background: #10b98115; border: 1px solid #10b98133; color: #10b981; }
  .result-fail { background: #ef444415; border: 1px solid #ef444433; color: #ef4444; }

  .spinner {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid #f59e0b44;
    border-top-color: #f59e0b;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .note-box {
    background: #38bdf815;
    border: 1px solid #38bdf833;
    border-radius: 10px;
    padding: 12px 16px;
    color: #38bdf8;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .summary-stat {
    background: #0d0d1f;
    border: 1px solid #1e1e35;
    border-radius: 10px;
    padding: 16px 20px;
    text-align: center;
  }
  .summary-val { font-size: 28px; font-weight: 800; color: #f59e0b; }
  .summary-key { font-size: 11px; color: #4a5278; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
  .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }

  .parsed-preview {
    background: #07070f;
    border: 1px solid #1e1e35;
    border-radius: 10px;
    padding: 14px 16px;
    margin-top: 12px;
    max-height: 140px;
    overflow-y: auto;
  }
  .parsed-line {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #4a5278;
    margin-bottom: 6px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .parsed-line .tickets { display: flex; flex-wrap: wrap; gap: 4px; flex-shrink: 0; }
`;

export default function TempoLogger() {
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [tempoToken, setTempoToken] = useState("");
  const [accountId, setAccountId] = useState("");
  const [jiraDomain, setJiraDomain] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [commitLog, setCommitLog] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [step, setStep] = useState(1);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [submitResults, setSubmitResults] = useState([]);
  const [parsedPreview, setParsedPreview] = useState([]);
  const [inputMode, setInputMode] = useState("daily");

  const today = new Date().toISOString().split("T")[0];

  const handlePreviewParse = (log) => {
    setCommitLog(log);
    const commits = parseCommits(log);
    setParsedPreview(commits.slice(0, 8));
  };

  const canProceedStep1 = openrouterKey && tempoToken && accountId && jiraDomain && jiraEmail && jiraToken;
  const canProceedStep2 = commitLog.trim() && (inputMode === "daily" || (startDate && endDate));

  const generateEntries = async () => {
    setLoading(true);
    setError("");
    setLoadingMsg("Sending to AI...");

    try {
      let prompt = "";

      if (inputMode === "daily") {
        prompt = `You are a developer filling Tempo worklogs for Jira. Parse this daily work log and extract Jira ticket IDs and time entries.

Daily Work Log:
${commitLog}

Return ONLY a raw JSON array. No markdown fences, no explanation. Example:
[{"issueKey":"PROJ-123","description":"Implemented login fix","timeSpentSeconds":5400,"startDate":"2024-01-15","startTime":"09:00:00"}]

Rules:
- Extract the date from the log header (e.g. "Wednesday, February 11, 2025") and format as YYYY-MM-DD
- Extract Jira ticket IDs from anywhere in the text (e.g. CREW-1026, PROJ-123) — normalize to uppercase
- If no explicit ticket ID found, use the most prominent ticket mentioned or infer from project context
- timeSpentSeconds: calculate from the time ranges (e.g. "9:00 AM - 10:45 AM" = 6300 seconds), exclude break times
- startTime: first work block start time in HH:MM:SS 24h format
- Group related work blocks under the same ticket if they belong together
- description: 1-2 professional sentences summarizing the actual work done
- Do NOT include authorAccountId in the JSON`;
      } else {
        const commits = parseCommits(commitLog);
        if (commits.length === 0) {
          setError("No Jira ticket IDs found. Ensure your commits contain patterns like PROJ-123 or ABC-456.");
          setLoading(false);
          return;
        }
        const groups = groupByTicket(commits);
        const ticketCount = Object.keys(groups).length;
        setLoadingMsg(`Found ${ticketCount} tickets. Asking AI to generate worklogs...`);
        prompt = `You are a developer filling Tempo worklogs for Jira. Given git commits grouped by Jira ticket ID, generate a realistic worklog entry for each ticket.

Date range: ${startDate} to ${endDate}
Working hours available per day: ${hoursPerDay}h

Commits grouped by ticket:
${Object.entries(groups)
  .map(([ticket, msgs]) => `${ticket}:\n${msgs.map((m) => `  - ${m}`).join("\n")}`)
  .join("\n\n")}

Return ONLY a raw JSON array. No markdown fences, no explanation. Example:
[{"issueKey":"PROJ-123","description":"Implemented login fix and resolved session timeout edge case","timeSpentSeconds":5400,"startDate":"2024-01-15","startTime":"09:00:00"}]

Rules:
- timeSpentSeconds: realistic estimate 3600–28800 (1–8 hours), in seconds
- Spread entries across the date range (do not stack all on one day)
- Each startDate must be a weekday within ${startDate} and ${endDate}
- Stagger startTime between 09:00:00 and 16:00:00
- description: 1–2 sentences, professional tone, summarize actual work from commit messages
- Do NOT include authorAccountId in the JSON`;
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openrouterKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Tempo AutoLogger",
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

      const text = data.choices?.[0]?.message?.content || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setEntries(parsed.map((e, i) => ({ ...e, id: i })));
      setStep(3);
    } catch (err) {
      setError("Error: " + err.message);
    }

    setLoading(false);
    setLoadingMsg("");
  };

  const updateEntry = (id, field, value) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const submitToTempo = async () => {
    setLoading(true);
    setLoadingMsg("Looking up Jira issue IDs...");
    const results = [];

    // Fetch numeric issueId for each unique issueKey from Jira API
    const issueKeys = [...new Set(entries.map((e) => e.issueKey))];
    const issueIdMap = {};
    for (const key of issueKeys) {
      try {
        const jiraRes = await fetch(`/jira-api/rest/api/3/issue/${key}?fields=id`, {
          headers: {
            Authorization: `Basic ${btoa(`${jiraEmail}:${jiraToken}`)}`,
            "Content-Type": "application/json",
          },
        });
        const jiraData = await jiraRes.json();
        if (jiraData.id) issueIdMap[key] = Number(jiraData.id);
        else issueIdMap[key] = null;
      } catch {
        issueIdMap[key] = null;
      }
    }

    setLoadingMsg("Submitting worklogs to Tempo...");

    for (const entry of entries) {
      const issueId = issueIdMap[entry.issueKey];
      if (!issueId) {
        results.push({ issueKey: entry.issueKey, ok: false, status: "Jira Lookup Failed", msg: `Could not resolve issueId for ${entry.issueKey}` });
        continue;
      }
      try {
        const res = await fetch("/tempo-api/4/worklogs", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tempoToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            issueId: issueId,
            timeSpentSeconds: Number(entry.timeSpentSeconds),
            startDate: entry.startDate.replace(/^00(\d{2})/, "20$1"),
            startTime: (entry.startTime || "09:00:00").replace(/^(\d):/, "0$1:"),
            description: entry.description,
            authorAccountId: accountId.split("?")[0],
          }),
        });
        const body = await res.json().catch(() => ({}));
        results.push({ issueKey: entry.issueKey, ok: res.ok, status: res.status, msg: body.errors?.[0]?.message || body.message || "" });
      } catch (err) {
        results.push({ issueKey: entry.issueKey, ok: false, status: "Network Error", msg: err.message });
      }
    }

    setSubmitResults(results);
    setStep(4);
    setLoading(false);
    setLoadingMsg("");
  };

  const totalHours = entries.reduce((s, e) => s + Number(e.timeSpentSeconds), 0) / 3600;
  const successCount = submitResults.filter((r) => r.ok).length;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-logo">⚡</div>
          <div className="header-title">Tempo AutoLogger</div>
          <div className="header-sub">git commits → AI worklogs → Tempo API</div>
        </div>

        {/* Steps bar */}
        <div className="steps-bar">
          {[
            { n: 1, label: "Configure" },
            { n: 2, label: "Commits" },
            { n: 3, label: "Review" },
            { n: 4, label: "Done" },
          ].map(({ n, label }) => (
            <div
              key={n}
              className={`step-item ${step === n ? "active" : step > n ? "done" : ""}`}
            >
              <div className="step-num">{step > n ? "✓" : n}</div>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="container">
          {error && (
            <div className="error-box">
              <span>⚠</span> {error}
            </div>
          )}

          {/* STEP 1: Config */}
          {step === 1 && (
            <>
              <div className="card">
                <div className="card-title">API Credentials</div>
                <div className="field">
                  <label className="label">OPENROUTER API KEY</label>
                  <input
                    type="text"
                    placeholder="sk-or-v1-..."
                    value={openrouterKey}
                    onChange={(e) => setOpenrouterKey(e.target.value)}
                  />
                  <div className="hint">→ openrouter.ai/keys → Create Key</div>
                </div>
                <div className="field">
                  <label className="label">TEMPO API TOKEN</label>
                  <input
                    type="text"
                    placeholder="your-tempo-token"
                    value={tempoToken}
                    onChange={(e) => setTempoToken(e.target.value)}
                  />
                  <div className="hint">→ Tempo → Settings → API Integration → New Token</div>
                </div>
                <div className="field">
                  <label className="label">JIRA ACCOUNT ID</label>
                  <input
                    type="text"
                    placeholder="5b10a2844c20165700ede21g"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                  />
                  <div className="hint">→ Jira profile URL → accountId in the URL, or ask admin</div>
                </div>
                <div className="field">
                  <label className="label">JIRA DOMAIN</label>
                  <input
                    type="text"
                    placeholder="yourcompany.atlassian.net"
                    value={jiraDomain}
                    onChange={(e) => setJiraDomain(e.target.value.replace(/https?:\/\//, "").replace(/\/$/, ""))}
                  />
                  <div className="hint">→ Just the domain, no https:// e.g. myteam.atlassian.net</div>
                </div>
                <div className="row">
                  <div className="field" style={{margin:0}}>
                    <label className="label">JIRA EMAIL</label>
                    <input
                      type="text"
                      placeholder="you@company.com"
                      value={jiraEmail}
                      onChange={(e) => setJiraEmail(e.target.value)}
                    />
                  </div>
                  <div className="field" style={{margin:0}}>
                    <label className="label">JIRA API TOKEN</label>
                    <input
                      type="text"
                      placeholder="your-jira-api-token"
                      value={jiraToken}
                      onChange={(e) => setJiraToken(e.target.value)}
                    />
                    <div className="hint">→ id.atlassian.com → Security → API tokens</div>
                  </div>
                </div>
              </div>

              <div className="note-box">
                ℹ All credentials stay in your browser only. Nothing is stored or sent anywhere except directly to OpenRouter, Jira, and Tempo APIs.
              </div>

              <div className="actions">
                <button
                  className="btn btn-primary"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                >
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Commit input */}
          {step === 2 && (
            <>
              <div className="card">
                <div className="card-title">Date Range</div>
                <div className="row3">
                  <div className="field" style={{ margin: 0 }}>
                    <label className="label">FROM</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} max={today} />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label className="label">TO</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} max={today} />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label className="label">HOURS/DAY</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Input Mode</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                  <button
                    className={`btn ${inputMode === "daily" ? "btn-primary" : "btn-ghost"}`}
                    style={{ flex: 1 }}
                    onClick={() => setInputMode("daily")}
                  >
                    📋 Daily Work Log
                  </button>
                  <button
                    className={`btn ${inputMode === "git" ? "btn-primary" : "btn-ghost"}`}
                    style={{ flex: 1 }}
                    onClick={() => setInputMode("git")}
                  >
                    ⌥ Git Commits
                  </button>
                </div>

                {inputMode === "daily" ? (
                  <>
                    <div className="note-box" style={{ marginTop: 16, marginBottom: 16 }}>
                      Paste your daily work log. Include the date header and time blocks.<br />
                      The AI will extract ticket IDs, times, and descriptions automatically.
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                      <textarea
                        placeholder={`Wednesday, February 11, 2025\nDuration: 9:00 AM - 6:00 PM\n\n9:00 AM - 10:45 AM: Database Layer\n* Created BatchMapping entity CREW-1026\n* Extended Batch entity with validity fields\n\n11:00 AM - 1:00 PM: Service Layer CREW-1027\n* Implemented assignCrewToBatch() logic`}
                        value={commitLog}
                        onChange={(e) => setCommitLog(e.target.value)}
                        style={{ minHeight: 240 }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="note-box" style={{ marginTop: 16, marginBottom: 16 }}>
                      Run: <strong>git log --oneline --since="2024-01-01" --until="2024-01-31"</strong><br />
                      Commit messages must contain Jira ticket IDs like <strong>PROJ-123</strong> or <strong>ABC-456</strong>
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                      <textarea
                        placeholder={`a3f1b2c PROJ-101 fix user auth token expiry\nb9d4e1a ABC-204: refactor payment service handler\nfe3c921 feat(PROJ-87): add retry logic to webhook`}
                        value={commitLog}
                        onChange={(e) => handlePreviewParse(e.target.value)}
                        style={{ minHeight: 180 }}
                      />
                    </div>
                    {parsedPreview.length > 0 && (
                      <div className="parsed-preview">
                        {parsedPreview.map((c, i) => (
                          <div key={i} className="parsed-line">
                            <div className="tickets">
                              {c.tickets.map((t) => (
                                <span key={t} className="ticket-tag">{t}</span>
                              ))}
                            </div>
                            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.line.replace(/[A-Z][A-Z0-9]+-\d+/g, "").trim()}
                            </span>
                          </div>
                        ))}
                        <div style={{ fontSize: 11, color: "#3a4060", marginTop: 8 }}>
                          ↑ {Object.keys(groupByTicket(parseCommits(commitLog))).length} unique tickets detected
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="actions">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button
                  className="btn btn-primary"
                  disabled={!canProceedStep2 || loading}
                  onClick={generateEntries}
                >
                  {loading ? (
                    <><span className="spinner" /> {loadingMsg}</>
                  ) : (
                    <>✦ Generate with OpenRouter</>
                  )}
                </button>
              </div>
            </>
          )}

          {/* STEP 3: Review & Edit */}
          {step === 3 && (
            <>
              <div className="summary-grid">
                <div className="summary-stat">
                  <div className="summary-val">{entries.length}</div>
                  <div className="summary-key">WORKLOG ENTRIES</div>
                </div>
                <div className="summary-stat">
                  <div className="summary-val">{totalHours.toFixed(1)}h</div>
                  <div className="summary-key">TOTAL TIME</div>
                </div>
                <div className="summary-stat">
                  <div className="summary-val">
                    {new Set(entries.map((e) => e.startDate)).size}d
                  </div>
                  <div className="summary-key">DAYS COVERED</div>
                </div>
              </div>

              <div className="note-box">
                ℹ Review and edit entries below before submitting. Adjust descriptions, times, and dates as needed.
              </div>

              {entries.map((entry) => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-header">
                    <span className="entry-ticket">{entry.issueKey}</span>
                    <span className="entry-date">{entry.startDate} · {entry.startTime}</span>
                    <span className="entry-time">{secToHuman(Number(entry.timeSpentSeconds))}</span>
                    <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => removeEntry(entry.id)}>✕</button>
                  </div>
                  <div className="entry-grid">
                    <div className="entry-field">
                      <label className="label">DESCRIPTION</label>
                      <textarea
                        value={entry.description}
                        onChange={(e) => updateEntry(entry.id, "description", e.target.value)}
                        style={{ minHeight: 64, fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <div className="entry-field">
                        <label className="label">DATE</label>
                        <input
                          type="date"
                          value={entry.startDate}
                          onChange={(e) => updateEntry(entry.id, "startDate", e.target.value)}
                        />
                      </div>
                      <div className="entry-field" style={{ marginTop: 8 }}>
                        <label className="label">START TIME</label>
                        <input
                          type="text"
                          value={entry.startTime}
                          placeholder="09:00:00"
                          onChange={(e) => updateEntry(entry.id, "startTime", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">TIME SPENT (seconds)</label>
                      <input
                        type="number"
                        value={entry.timeSpentSeconds}
                        step={900}
                        min={900}
                        onChange={(e) => updateEntry(entry.id, "timeSpentSeconds", e.target.value)}
                      />
                      <div className="hint" style={{ marginTop: 6 }}>= {secToHuman(Number(entry.timeSpentSeconds))}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="actions" style={{ marginTop: 20 }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Regenerate</button>
                <button
                  className="btn btn-success"
                  disabled={entries.length === 0 || loading}
                  onClick={submitToTempo}
                >
                  {loading ? (
                    <><span className="spinner" style={{ borderTopColor: "#fff" }} /> {loadingMsg}</>
                  ) : (
                    <>⚡ Log {entries.length} entries to Tempo</>
                  )}
                </button>
              </div>
            </>
          )}

          {/* STEP 4: Results */}
          {step === 4 && (
            <>
              <div className="summary-grid">
                <div className="summary-stat">
                  <div className="summary-val" style={{ color: "#10b981" }}>{successCount}</div>
                  <div className="summary-key">LOGGED ✓</div>
                </div>
                <div className="summary-stat">
                  <div className="summary-val" style={{ color: "#ef4444" }}>{submitResults.length - successCount}</div>
                  <div className="summary-key">FAILED ✗</div>
                </div>
                <div className="summary-stat">
                  <div className="summary-val">{totalHours.toFixed(1)}h</div>
                  <div className="summary-key">TOTAL LOGGED</div>
                </div>
              </div>

              {submitResults.some((r) => !r.ok) && (
                <div className="note-box" style={{ borderColor: "#ef444433", background: "#ef444410", color: "#ef4444" }}>
                  ⚠ Some entries failed. This may be due to browser CORS restrictions on the Tempo API.<br />
                  If you see CORS errors, run this as a local script instead: copy the entries and use curl or a small Node.js script to submit them.
                </div>
              )}

              {submitResults.map((r, i) => (
                <div key={i} className={`result-row ${r.ok ? "result-ok" : "result-fail"}`}>
                  <span>{r.ok ? "✓" : "✗"} {r.issueKey}</span>
                  <span style={{ opacity: 0.7 }}>
                    HTTP {r.status} {r.msg ? `· ${r.msg}` : ""}
                  </span>
                </div>
              ))}

              <div className="actions" style={{ marginTop: 24 }}>
                <button className="btn btn-ghost" onClick={() => { setStep(3); setSubmitResults([]); }}>
                  ← Back to Review
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setStep(1); setEntries([]); setCommitLog(""); setSubmitResults([]);
                    setStartDate(""); setEndDate(""); setParsedPreview([]);
                  }}
                >
                  Start New →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
