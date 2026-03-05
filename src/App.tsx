import { useState, useCallback, useMemo } from 'react';
import { ConfigProvider, App as AntApp } from 'antd';
import '@/styles/global.css';
import type { InputMode, ParsedCommit, DayConfig } from '@/types';
import type { StepNumber } from '@/hooks/useWorkflow';
import { useCredentials } from '@/hooks/useCredentials';
import { useEntries } from '@/hooks/useEntries';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';
import { AppLayout } from '@/components/layout/AppLayout';
import { Step1Config } from '@/components/steps/Step1Config';
import { Step2Input } from '@/components/steps/Step2Input';
import { Step3Review } from '@/components/steps/Step3Review';
import { Step4Results } from '@/components/steps/Step4Results';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NoteBox } from '@/components/shared';
import { generateWorklogs } from '@/services/openrouter';
import { resolveIssueIds } from '@/services/jira';
import { submitWorklog } from '@/services/tempo';
import { parseCommits, groupByTicket, condenseGitLog } from '@/utils/parseCommits';
import { buildDailyPrompt, buildGitCommitPrompt } from '@/utils/prompts';
import { getTodayISO } from '@/utils/formatTime';

export function createDefaultDay(date: string): DayConfig {
  return {
    date,
    startTime: '09:00',
    endTime: '18:00',
    lunchStart: '12:30',
    lunchEnd: '13:30',
    dsmStart: '09:30',
    dsmEnd: '09:45',
    dsmTicket: '',
    meetings: [],
    workLog: '',
  };
}

export default function App() {
  const { mode, toggleTheme, themeConfig } = useTheme();

  return (
    <ConfigProvider theme={themeConfig}>
      <AntApp>
        <ErrorBoundary>
          <AppInner themeMode={mode} onThemeToggle={toggleTheme} />
        </ErrorBoundary>
      </AntApp>
    </ConfigProvider>
  );
}

interface AppInnerProps {
  themeMode: 'dark' | 'light';
  onThemeToggle: () => void;
}

function AppInner({ themeMode, onThemeToggle }: AppInnerProps) {
  const { message } = AntApp.useApp();
  const { credentials, updateField, touchField, clearCredentials, isComplete, fieldErrors } =
    useCredentials();
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
    useWorkflow(isComplete ? 2 : 1);

  const [commitLog, setCommitLog] = useState('');
  const [dayConfigs, setDayConfigs] = useState<DayConfig[]>([createDefaultDay('')]);
  const [inputMode, setInputMode] = useState<InputMode>('daily');
  const [additionalContext, setAdditionalContext] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedCommit[]>([]);

  const today = getTodayISO();
  const allDaysHaveDates = dayConfigs.every((d) => d.date.trim() !== '');
  const canProceedStep2 =
    allDaysHaveDates &&
    (inputMode === 'daily'
      ? dayConfigs.every((d) => d.workLog.trim().length > 0)
      : commitLog.trim().length > 0);

  const shortcuts = useMemo(
    () => [
      {
        key: 'Escape',
        handler: () => {
          if (step > 1 && !loading) goTo((step - 1) as 1 | 2 | 3);
        },
      },
    ],
    [step, loading, goTo],
  );
  useKeyboardShortcuts(shortcuts);

  const handlePreviewParse = useCallback((log: string) => {
    setCommitLog(log);
    setParsedPreview(parseCommits(log).slice(0, 8));
  }, []);

  const handleGenerate = async () => {
    startLoading('Sending to AI...');
    try {
      let prompt: string;
      if (inputMode === 'daily') {
        prompt = buildDailyPrompt(dayConfigs, additionalContext);
      } else {
        const condensed = condenseGitLog(commitLog);
        const commits = parseCommits(commitLog);
        const ticketCount = Object.keys(groupByTicket(commits)).length;
        startLoading(
          ticketCount > 0
            ? `Found ${ticketCount} tickets. Analyzing git log and generating worklogs...`
            : 'Analyzing git log — AI will extract ticket IDs from commits and diffs...',
        );
        prompt = buildGitCommitPrompt(condensed, dayConfigs, additionalContext);
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

    const successes = results.filter((r) => r.ok).length;
    const failures = results.length - successes;
    if (failures === 0) {
      message.success(`All ${successes} worklogs submitted successfully!`);
    } else {
      message.warning(`${successes} submitted, ${failures} failed`);
    }
  };

  const handleReset = () => {
    goTo(1);
    setEntries([]);
    setCommitLog('');
    setSubmitResults([]);
    setDayConfigs([createDefaultDay('')]);
    setAdditionalContext('');
    setParsedPreview([]);
  };

  const handleStepClick = useCallback(
    (targetStep: StepNumber) => {
      if (targetStep < step && !loading) {
        goTo(targetStep);
      }
    },
    [step, loading, goTo],
  );

  return (
    <>
      <AppLayout
        currentStep={step}
        onStepClick={handleStepClick}
        themeMode={themeMode}
        onThemeToggle={onThemeToggle}
      >
        {error && <NoteBox variant="error">{error}</NoteBox>}

        {step === 1 && (
          <Step1Config
            credentials={credentials}
            updateField={updateField}
            touchField={touchField}
            clearCredentials={clearCredentials}
            isComplete={isComplete}
            fieldErrors={fieldErrors}
            onContinue={() => goTo(2)}
          />
        )}

        {step === 2 && (
          <Step2Input
            commitLog={commitLog}
            inputMode={inputMode}
            onInputModeChange={setInputMode}
            dayConfigs={dayConfigs}
            onDayConfigsChange={setDayConfigs}
            additionalContext={additionalContext}
            onAdditionalContextChange={setAdditionalContext}
            today={today}
            loading={loading}
            loadingMsg={loadingMsg}
            onGenerate={handleGenerate}
            onBack={() => goTo(1)}
            canProceed={canProceedStep2}
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
    </>
  );
}
