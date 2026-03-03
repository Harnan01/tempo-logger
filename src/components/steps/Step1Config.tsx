import type { Credentials } from '@/types';
import cardStyles from '@/styles/components/card.module.css';
import formStyles from '@/styles/components/form.module.css';
import btnStyles from '@/styles/components/button.module.css';
import boxStyles from '@/styles/components/boxes.module.css';

interface Step1Props {
  credentials: Credentials;
  updateField: <K extends keyof Credentials>(field: K, value: string) => void;
  isComplete: boolean;
  onContinue: () => void;
}

export function Step1Config({ credentials, updateField, isComplete, onContinue }: Step1Props) {
  return (
    <>
      <div className={cardStyles.card}>
        <div className={cardStyles.cardTitle}>API Credentials</div>
        <div className={formStyles.field}>
          <label className={formStyles.label}>OPENROUTER API KEY</label>
          <input
            type="password"
            placeholder="sk-or-v1-..."
            value={credentials.openrouterKey}
            onChange={(e) => updateField('openrouterKey', e.target.value)}
          />
          <div className={formStyles.hint}>→ openrouter.ai/keys → Create Key</div>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label}>TEMPO API TOKEN</label>
          <input
            type="password"
            placeholder="your-tempo-token"
            value={credentials.tempoToken}
            onChange={(e) => updateField('tempoToken', e.target.value)}
          />
          <div className={formStyles.hint}>→ Tempo → Settings → API Integration → New Token</div>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label}>JIRA ACCOUNT ID</label>
          <input
            type="text"
            placeholder="5b10a2844c20165700ede21g"
            value={credentials.accountId}
            onChange={(e) => updateField('accountId', e.target.value)}
          />
          <div className={formStyles.hint}>
            → Jira profile URL → accountId in the URL, or ask admin
          </div>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label}>JIRA DOMAIN</label>
          <input
            type="text"
            placeholder="yourcompany.atlassian.net"
            value={credentials.jiraDomain}
            onChange={(e) => updateField('jiraDomain', e.target.value)}
          />
          <div className={formStyles.hint}>
            → Just the domain, no https:// e.g. myteam.atlassian.net
          </div>
        </div>
        <div className={formStyles.row}>
          <div className={formStyles.field} style={{ margin: 0 }}>
            <label className={formStyles.label}>JIRA EMAIL</label>
            <input
              type="text"
              placeholder="you@company.com"
              value={credentials.jiraEmail}
              onChange={(e) => updateField('jiraEmail', e.target.value)}
            />
          </div>
          <div className={formStyles.field} style={{ margin: 0 }}>
            <label className={formStyles.label}>JIRA API TOKEN</label>
            <input
              type="password"
              placeholder="your-jira-api-token"
              value={credentials.jiraToken}
              onChange={(e) => updateField('jiraToken', e.target.value)}
            />
            <div className={formStyles.hint}>
              → id.atlassian.com → Security → API tokens
            </div>
          </div>
        </div>
      </div>

      <div className={boxStyles.noteBox}>
        ℹ All credentials stay in your browser only. Nothing is stored or sent anywhere except
        directly to OpenRouter, Jira, and Tempo APIs.
      </div>

      <div className={formStyles.actions}>
        <button
          className={`${btnStyles.btn} ${btnStyles.primary}`}
          disabled={!isComplete}
          onClick={onContinue}
        >
          Continue →
        </button>
      </div>
    </>
  );
}
