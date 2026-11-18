import { useState, useCallback, useMemo, useEffect } from 'react';
import { ConfigProvider, App as AntApp } from 'antd';
import '@/styles/global.css';
import type { DayConfig } from '@/types';
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
import { resolveIssueIds } from '@/services/jira';
import { submitWorklog } from '@/services/tempo';
import { buildEntriesFromDays } from '@/utils/buildEntries';
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

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

  const [dayConfigs, setDayConfigs] = useState<DayConfig[]>([createDefaultDay('')]);

  const today = getTodayISO();
  const allDaysHaveDates = dayConfigs.every((d) => d.date.trim() !== '');
  const canProceedStep2 = allDaysHaveDates && dayConfigs.every((d) => d.workLog.trim().length > 0);

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

  const handleBuildEntries = () => {
    const { entries: built, errors } = buildEntriesFromDays(dayConfigs);
    if (errors.length > 0) {
      setErrorMsg(`Fix these Work Log lines, then build again:\n${errors.join('\n')}`);
      message.error('Some Work Log lines could not be read — see the details at the top.');
      return;
    }
    setEntries(built);
    goTo(3);
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
    setSubmitResults([]);
    setDayConfigs([createDefaultDay('')]);
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
        {error && (
          <NoteBox variant="error">
            <span style={{ whiteSpace: 'pre-line' }}>{error}</span>
          </NoteBox>
        )}

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
            dayConfigs={dayConfigs}
            onDayConfigsChange={setDayConfigs}
            today={today}
            onBuild={handleBuildEntries}
            onBack={() => goTo(1)}
            canProceed={canProceedStep2}
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
