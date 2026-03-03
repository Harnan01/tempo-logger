import type { WorklogEntry } from '@/types';
import { secToHuman } from '@/utils/formatTime';
import summaryStyles from '@/styles/components/summary.module.css';
import boxStyles from '@/styles/components/boxes.module.css';
import entryStyles from '@/styles/components/entry-card.module.css';
import formStyles from '@/styles/components/form.module.css';
import btnStyles from '@/styles/components/button.module.css';

interface Step3Props {
  entries: WorklogEntry[];
  updateEntry: (id: number, field: keyof WorklogEntry, value: string | number) => void;
  removeEntry: (id: number) => void;
  totalHours: number;
  uniqueDays: number;
  loading: boolean;
  loadingMsg: string;
  onSubmit: () => void;
  onBack: () => void;
}

export function Step3Review({
  entries,
  updateEntry,
  removeEntry,
  totalHours,
  uniqueDays,
  loading,
  loadingMsg,
  onSubmit,
  onBack,
}: Step3Props) {
  return (
    <>
      <div className={summaryStyles.summaryGrid}>
        <div className={summaryStyles.stat}>
          <div className={summaryStyles.val}>{entries.length}</div>
          <div className={summaryStyles.key}>WORKLOG ENTRIES</div>
        </div>
        <div className={summaryStyles.stat}>
          <div className={summaryStyles.val}>{totalHours.toFixed(1)}h</div>
          <div className={summaryStyles.key}>TOTAL TIME</div>
        </div>
        <div className={summaryStyles.stat}>
          <div className={summaryStyles.val}>{uniqueDays}d</div>
          <div className={summaryStyles.key}>DAYS COVERED</div>
        </div>
      </div>

      <div className={boxStyles.noteBox}>
        ℹ Review and edit entries below before submitting. Adjust descriptions, times, and dates as
        needed.
      </div>

      {entries.map((entry) => (
        <div key={entry.id} className={entryStyles.entryCard}>
          <div className={entryStyles.entryHeader}>
            <span className={entryStyles.entryTicket}>{entry.issueKey}</span>
            <span className={entryStyles.entryDate}>
              {entry.startDate} · {entry.startTime}
            </span>
            <span className={entryStyles.entryTime}>
              {secToHuman(Number(entry.timeSpentSeconds))}
            </span>
            <button
              className={`${btnStyles.btn} ${btnStyles.danger}`}
              style={{ padding: '4px 10px', fontSize: 11 }}
              onClick={() => removeEntry(entry.id)}
              aria-label={`Remove ${entry.issueKey}`}
            >
              ✕
            </button>
          </div>
          <div className={entryStyles.entryGrid}>
            <div className={entryStyles.entryField}>
              <label className={formStyles.label}>DESCRIPTION</label>
              <textarea
                value={entry.description}
                onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                style={{ minHeight: 64, fontSize: 12 }}
              />
            </div>
            <div>
              <div className={entryStyles.entryField}>
                <label className={formStyles.label}>DATE</label>
                <input
                  type="date"
                  value={entry.startDate}
                  onChange={(e) => updateEntry(entry.id, 'startDate', e.target.value)}
                />
              </div>
              <div className={entryStyles.entryField} style={{ marginTop: 8 }}>
                <label className={formStyles.label}>START TIME</label>
                <input
                  type="text"
                  value={entry.startTime}
                  placeholder="09:00:00"
                  onChange={(e) => updateEntry(entry.id, 'startTime', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={formStyles.label}>TIME SPENT (seconds)</label>
              <input
                type="number"
                value={entry.timeSpentSeconds}
                step={900}
                min={900}
                onChange={(e) => updateEntry(entry.id, 'timeSpentSeconds', e.target.value)}
              />
              <div className={formStyles.hint} style={{ marginTop: 6 }}>
                = {secToHuman(Number(entry.timeSpentSeconds))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className={formStyles.actions} style={{ marginTop: 20 }}>
        <button className={`${btnStyles.btn} ${btnStyles.ghost}`} onClick={onBack}>
          ← Regenerate
        </button>
        <button
          className={`${btnStyles.btn} ${btnStyles.success}`}
          disabled={entries.length === 0 || loading}
          onClick={onSubmit}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ borderTopColor: '#fff' }} /> {loadingMsg}
            </>
          ) : (
            <>⚡ Log {entries.length} entries to Tempo</>
          )}
        </button>
      </div>
    </>
  );
}
