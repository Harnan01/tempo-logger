import { useState, useCallback } from 'react';
import '@/styles/global.css';
import type { InputMode, ParsedCommit } from '@/types';
import { useCredentials } from '@/hooks/useCredentials';
import { useEntries } from '@/hooks/useEntries';
import { useWorkflow } from '@/hooks/useWorkflow';
import { AppLayout } from '@/components/layout/AppLayout';
import { Step1Config } from '@/components/steps/Step1Config';
import { Step2Input } from '@/components/steps/Step2Input';
import { Step3Review } from '@/components/steps/Step3Review';
import { Step4Results } from '@/components/steps/Step4Results';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { generateWorklogs } from '@/services/openrouter';
import { resolveIssueIds } from '@/services/jira';
import { submitWorklog } from '@/services/tempo';
import { parseCommits, groupByTicket } from '@/utils/parseCommits';
import { buildDailyPrompt, buildGitCommitPrompt } from '@/utils/prompts';
import { getTodayISO } from '@/utils/formatTime';
import boxStyles from '@/styles/components/boxes.module.css';

export default function App() {
  const { credentials, updateField, isComplete } = useCredentials();
  const {
    entries,
    setEntries,
    submitResults,
    setSubmitResults,
    updateEntry,
    removeEntry,
    totalHours,
    uniqueDays,
    successCount,
  } = useEntries();
  const { step, goTo, loading, loadingMsg, startLoading, stopLoading, error, setErrorMsg } =
    useWorkflow();

  const [commitLog, setCommitLog] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [inputMode, setInputMode] = useState<InputMode>('daily');
  const [parsedPreview, setParsedPreview] = useState<ParsedCommit[]>([]);

  const today = getTodayISO();
  const canProceedStep2 = commitLog.trim() && (inputMode === 'daily' || (startDate && endDate));

  const handlePreviewParse = useCallback((log: string) => {
    setCommitLog(log);
    setParsedPreview(parseCommits(log).slice(0, 8));
  }, []);

  const handleGenerate = async () => {
    startLoading('Sending to AI...');
    try {
      let prompt: string;
      if (inputMode === 'daily') {
        prompt = buildDailyPrompt(commitLog);
      } else {
        const commits = parseCommits(commitLog);
        if (commits.length === 0) {
          setErrorMsg(
            'No Jira ticket IDs found. Ensure your commits contain patterns like PROJ-123 or ABC-456.',
          );
          return;
        }
        const groups = groupByTicket(commits);
        startLoading(
          `Found ${Object.keys(groups).length} tickets. Asking AI to generate worklogs...`,
        );
        prompt = buildGitCommitPrompt(groups, startDate, endDate, hoursPerDay);
      }
      const result = await generateWorklogs(credentials.openrouterKey, prompt);
      setEntries(result);
      goTo(3);
    } catch (err) {
      setErrorMsg('Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      stopLoading();
    }
  };

  const handleSubmit = async () => {
    startLoading('Looking up Jira issue IDs...');
    const issueKeys = [...new Set(entries.map((e) => e.issueKey))];
    const issueIdMap = await resolveIssueIds(
      issueKeys,
      credentials.jiraDomain,
      credentials.jiraEmail,
      credentials.jiraToken,
    );

    startLoading('Submitting worklogs to Tempo...');
    const results = [];
    for (const entry of entries) {
      const issueId = issueIdMap[entry.issueKey];
      if (!issueId) {
        results.push({
          issueKey: entry.issueKey,
          ok: false as const,
          status: 'Jira Lookup Failed' as string | number,
          msg: `Could not resolve issueId for ${entry.issueKey}`,
        });
        continue;
      }
      const result = await submitWorklog(
        entry,
        issueId,
        credentials.tempoToken,
        credentials.accountId,
      );
      results.push(result);
    }

    setSubmitResults(results);
    goTo(4);
    stopLoading();
  };

  const handleReset = () => {
    goTo(1);
    setEntries([]);
    setCommitLog('');
    setSubmitResults([]);
    setStartDate('');
    setEndDate('');
    setParsedPreview([]);
  };

  return (
    <ErrorBoundary>
      <AppLayout currentStep={step}>
        {error && (
          <div className={boxStyles.errorBox}>
            <span>⚠</span> {error}
          </div>
        )}

        {step === 1 && (
          <Step1Config
            credentials={credentials}
            updateField={updateField}
            isComplete={isComplete}
            onContinue={() => goTo(2)}
          />
        )}

        {step === 2 && (
          <Step2Input
            commitLog={commitLog}
            onCommitLogChange={setCommitLog}
            inputMode={inputMode}
            onInputModeChange={setInputMode}
            startDate={startDate}
            endDate={endDate}
            hoursPerDay={hoursPerDay}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onHoursPerDayChange={setHoursPerDay}
            today={today}
            loading={loading}
            loadingMsg={loadingMsg}
            onGenerate={handleGenerate}
            onBack={() => goTo(1)}
            canProceed={!!canProceedStep2}
            parsedPreview={parsedPreview}
            onPreviewParse={handlePreviewParse}
          />
        )}

        {step === 3 && (
          <Step3Review
            entries={entries}
            updateEntry={updateEntry}
            removeEntry={removeEntry}
            totalHours={totalHours}
            uniqueDays={uniqueDays}
            loading={loading}
            loadingMsg={loadingMsg}
            onSubmit={handleSubmit}
            onBack={() => goTo(2)}
          />
        )}

        {step === 4 && (
          <Step4Results
            submitResults={submitResults}
            successCount={successCount}
            totalHours={totalHours}
            onBackToReview={() => {
              goTo(3);
              setSubmitResults([]);
            }}
            onStartNew={handleReset}
          />
        )}
      </AppLayout>
    </ErrorBoundary>
  );
}
