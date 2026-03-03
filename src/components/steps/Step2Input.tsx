import type { InputMode, ParsedCommit } from '@/types';
import { parseCommits, groupByTicket } from '@/utils/parseCommits';
import cardStyles from '@/styles/components/card.module.css';
import formStyles from '@/styles/components/form.module.css';
import btnStyles from '@/styles/components/button.module.css';
import boxStyles from '@/styles/components/boxes.module.css';

interface Step2Props {
  commitLog: string;
  onCommitLogChange: (value: string) => void;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  startDate: string;
  endDate: string;
  hoursPerDay: number;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onHoursPerDayChange: (value: number) => void;
  today: string;
  loading: boolean;
  loadingMsg: string;
  onGenerate: () => void;
  onBack: () => void;
  canProceed: boolean;
  parsedPreview: ParsedCommit[];
  onPreviewParse: (log: string) => void;
}

export function Step2Input({
  commitLog,
  onCommitLogChange,
  inputMode,
  onInputModeChange,
  startDate,
  endDate,
  hoursPerDay,
  onStartDateChange,
  onEndDateChange,
  onHoursPerDayChange,
  today,
  loading,
  loadingMsg,
  onGenerate,
  onBack,
  canProceed,
  parsedPreview,
  onPreviewParse,
}: Step2Props) {
  return (
    <>
      <div className={cardStyles.card}>
        <div className={cardStyles.cardTitle}>Date Range</div>
        <div className={formStyles.row3}>
          <div className={formStyles.field} style={{ margin: 0 }}>
            <label className={formStyles.label}>FROM</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              max={today}
            />
          </div>
          <div className={formStyles.field} style={{ margin: 0 }}>
            <label className={formStyles.label}>TO</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              max={today}
            />
          </div>
          <div className={formStyles.field} style={{ margin: 0 }}>
            <label className={formStyles.label}>HOURS/DAY</label>
            <input
              type="number"
              min={1}
              max={12}
              value={hoursPerDay}
              onChange={(e) => onHoursPerDayChange(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className={cardStyles.card}>
        <div className={cardStyles.cardTitle}>Input Mode</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
          <button
            className={`${btnStyles.btn} ${inputMode === 'daily' ? btnStyles.primary : btnStyles.ghost}`}
            style={{ flex: 1 }}
            onClick={() => onInputModeChange('daily')}
          >
            📋 Daily Work Log
          </button>
          <button
            className={`${btnStyles.btn} ${inputMode === 'git' ? btnStyles.primary : btnStyles.ghost}`}
            style={{ flex: 1 }}
            onClick={() => onInputModeChange('git')}
          >
            ⌥ Git Commits
          </button>
        </div>

        {inputMode === 'daily' ? (
          <>
            <div className={boxStyles.noteBox} style={{ marginTop: 16, marginBottom: 16 }}>
              Paste your daily work log. Include the date header and time blocks.
              <br />
              The AI will extract ticket IDs, times, and descriptions automatically.
            </div>
            <div className={formStyles.field} style={{ margin: 0 }}>
              <textarea
                placeholder={`Wednesday, February 11, 2025\nDuration: 9:00 AM - 6:00 PM\n\n9:00 AM - 10:45 AM: Database Layer\n* Created BatchMapping entity CREW-1026\n* Extended Batch entity with validity fields\n\n11:00 AM - 1:00 PM: Service Layer CREW-1027\n* Implemented assignCrewToBatch() logic`}
                value={commitLog}
                onChange={(e) => onCommitLogChange(e.target.value)}
                style={{ minHeight: 240 }}
              />
            </div>
          </>
        ) : (
          <>
            <div className={boxStyles.noteBox} style={{ marginTop: 16, marginBottom: 16 }}>
              Run: <strong>git log --oneline --since="2024-01-01" --until="2024-01-31"</strong>
              <br />
              Commit messages must contain Jira ticket IDs like <strong>PROJ-123</strong> or{' '}
              <strong>ABC-456</strong>
            </div>
            <div className={formStyles.field} style={{ margin: 0 }}>
              <textarea
                placeholder={`a3f1b2c PROJ-101 fix user auth token expiry\nb9d4e1a ABC-204: refactor payment service handler\nfe3c921 feat(PROJ-87): add retry logic to webhook`}
                value={commitLog}
                onChange={(e) => onPreviewParse(e.target.value)}
                style={{ minHeight: 180 }}
              />
            </div>
            {parsedPreview.length > 0 && (
              <div className={boxStyles.parsedPreview}>
                {parsedPreview.map((c, i) => (
                  <div key={i} className={boxStyles.parsedLine}>
                    <div className={boxStyles.tickets}>
                      {c.tickets.map((t) => (
                        <span key={t} className={boxStyles.ticketTag}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <span
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.line.replace(/[A-Z][A-Z0-9]+-\d+/g, '').trim()}
                    </span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: '#3a4060', marginTop: 8 }}>
                  ↑ {Object.keys(groupByTicket(parseCommits(commitLog))).length} unique tickets
                  detected
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className={formStyles.actions}>
        <button className={`${btnStyles.btn} ${btnStyles.ghost}`} onClick={onBack}>
          ← Back
        </button>
        <button
          className={`${btnStyles.btn} ${btnStyles.primary}`}
          disabled={!canProceed || loading}
          onClick={onGenerate}
        >
          {loading ? (
            <>
              <span className="spinner" /> {loadingMsg}
            </>
          ) : (
            <>✦ Generate with OpenRouter</>
          )}
        </button>
      </div>
    </>
  );
}
