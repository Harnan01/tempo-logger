import type { SubmitResult } from '@/types';
import summaryStyles from '@/styles/components/summary.module.css';
import boxStyles from '@/styles/components/boxes.module.css';
import resultStyles from '@/styles/components/result-row.module.css';
import formStyles from '@/styles/components/form.module.css';
import btnStyles from '@/styles/components/button.module.css';

interface Step4Props {
  submitResults: SubmitResult[];
  successCount: number;
  totalHours: number;
  onBackToReview: () => void;
  onStartNew: () => void;
}

export function Step4Results({
  submitResults,
  successCount,
  totalHours,
  onBackToReview,
  onStartNew,
}: Step4Props) {
  return (
    <>
      <div className={summaryStyles.summaryGrid}>
        <div className={summaryStyles.stat}>
          <div className={summaryStyles.val} style={{ color: '#10b981' }}>
            {successCount}
          </div>
          <div className={summaryStyles.key}>LOGGED ✓</div>
        </div>
        <div className={summaryStyles.stat}>
          <div className={summaryStyles.val} style={{ color: '#ef4444' }}>
            {submitResults.length - successCount}
          </div>
          <div className={summaryStyles.key}>FAILED ✗</div>
        </div>
        <div className={summaryStyles.stat}>
          <div className={summaryStyles.val}>{totalHours.toFixed(1)}h</div>
          <div className={summaryStyles.key}>TOTAL LOGGED</div>
        </div>
      </div>

      {submitResults.some((r) => !r.ok) && (
        <div
          className={boxStyles.noteBox}
          style={{ borderColor: '#ef444433', background: '#ef444410', color: '#ef4444' }}
        >
          ⚠ Some entries failed. This may be due to browser CORS restrictions on the Tempo API.
          <br />
          If you see CORS errors, run this as a local script instead: copy the entries and use curl
          or a small Node.js script to submit them.
        </div>
      )}

      {submitResults.map((r, i) => (
        <div
          key={i}
          className={`${resultStyles.resultRow} ${r.ok ? resultStyles.ok : resultStyles.fail}`}
        >
          <span>
            {r.ok ? '✓' : '✗'} {r.issueKey}
          </span>
          <span style={{ opacity: 0.7 }}>
            HTTP {r.status} {r.msg ? `· ${r.msg}` : ''}
          </span>
        </div>
      ))}

      <div className={formStyles.actions} style={{ marginTop: 24 }}>
        <button className={`${btnStyles.btn} ${btnStyles.ghost}`} onClick={onBackToReview}>
          ← Back to Review
        </button>
        <button className={`${btnStyles.btn} ${btnStyles.primary}`} onClick={onStartNew}>
          Start New →
        </button>
      </div>
    </>
  );
}
