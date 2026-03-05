import { Segmented, Input, Tag, Typography, theme } from 'antd';
import type { InputMode, ParsedCommit, DayConfig, Meeting } from '@/types';
import { parseCommits, groupByTicket } from '@/utils/parseCommits';
import { createDefaultDay } from '@/App';
import { Card, NoteBox, Button, FormField, StepActions } from '@/components/shared';
import { DayCard } from './DayCard';

const { Text } = Typography;

interface Step2Props {
  commitLog: string;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  dayConfigs: DayConfig[];
  onDayConfigsChange: (configs: DayConfig[]) => void;
  additionalContext: string;
  onAdditionalContextChange: (value: string) => void;
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
  inputMode,
  onInputModeChange,
  dayConfigs,
  onDayConfigsChange,
  additionalContext,
  onAdditionalContextChange,
  today,
  loading,
  loadingMsg,
  onGenerate,
  onBack,
  canProceed,
  parsedPreview,
  onPreviewParse,
}: Step2Props) {
  const { token } = theme.useToken();

  const updateDay = (index: number, field: keyof DayConfig, value: string) => {
    const updated = dayConfigs.map((d, i) => (i === index ? { ...d, [field]: value } : d));
    onDayConfigsChange(updated);
  };

  const updateDayMeetings = (index: number, meetings: Meeting[]) => {
    const updated = dayConfigs.map((d, i) => (i === index ? { ...d, meetings } : d));
    onDayConfigsChange(updated);
  };

  const addDay = () => {
    onDayConfigsChange([...dayConfigs, createDefaultDay('')]);
  };

  const removeDay = (index: number) => {
    if (dayConfigs.length <= 1) return;
    onDayConfigsChange(dayConfigs.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Input Mode Toggle */}
      <Card title="Input Mode">
        <Segmented
          value={inputMode}
          onChange={(val) => onInputModeChange(val as InputMode)}
          options={[
            { label: 'Daily Work Log', value: 'daily' },
            { label: 'Git Commits', value: 'git' },
          ]}
          block
          style={{ marginBottom: 12 }}
        />
        <NoteBox>
          {inputMode === 'daily'
            ? "Paste each day's work log in its day card below. The AI will extract ticket IDs, times, and descriptions per day."
            : 'Paste one git log covering all days. AI will extract ticket IDs from commits and diffs, then distribute across days.'}
        </NoteBox>
      </Card>

      {/* Day Schedule Cards */}
      <Card title="Day Schedule">
        {dayConfigs.map((day, i) => (
          <DayCard
            key={i}
            day={day}
            index={i}
            inputMode={inputMode}
            today={today}
            canRemove={dayConfigs.length > 1}
            onUpdate={(field, value) => updateDay(i, field, value)}
            onMeetingsChange={(meetings) => updateDayMeetings(i, meetings)}
            onRemove={() => removeDay(i)}
          />
        ))}
        <Button variant="ghost" fullWidth onClick={addDay} style={{ marginTop: 14 }}>
          + Add Day
        </Button>
      </Card>

      {/* Git Log */}
      {inputMode === 'git' && (
        <Card title="Git Log">
          <NoteBox>
            Paste any git log format — with or without diffs: <strong>git log --oneline</strong>,{' '}
            <strong>git log -p</strong>, or <strong>git log --stat</strong>
          </NoteBox>
          <FormField label="GIT LOG" noMargin>
            {({ id }) => (
              <Input.TextArea
                id={id}
                placeholder={`a3f1b2c PROJ-101 fix user auth token expiry\nb9d4e1a ABC-204: refactor payment service handler\nfe3c921 feat(PROJ-87): add retry logic to webhook`}
                value={commitLog}
                onChange={(e) => onPreviewParse(e.target.value)}
                autoSize={{ minRows: 6 }}
              />
            )}
          </FormField>
          {parsedPreview.length > 0 && (
            <div
              style={{
                background: token.colorBgElevated,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadiusLG,
                padding: '14px 16px',
                marginTop: 12,
                maxHeight: 140,
                overflow: 'auto',
              }}
            >
              {parsedPreview.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginBottom: 6,
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flexShrink: 0 }}>
                    {c.tickets.map((t) => (
                      <Tag key={t} color="orange">
                        {t}
                      </Tag>
                    ))}
                  </div>
                  <Text
                    ellipsis
                    type="secondary"
                    style={{ flex: 1, fontSize: 11, fontFamily: token.fontFamilyCode }}
                  >
                    {c.line.replace(/[A-Z][A-Z0-9]+-\d+/g, '').trim()}
                  </Text>
                </div>
              ))}
              <Text type="secondary" style={{ fontSize: 11, marginTop: 8, display: 'block' }}>
                {Object.keys(groupByTicket(parseCommits(commitLog))).length} unique tickets detected
              </Text>
            </div>
          )}
        </Card>
      )}

      {/* Additional Context */}
      <Card title="Additional Context (Optional)">
        <NoteBox>
          Add meetings, Jira ceremonies, or other tasks not in the log above. Include the ticket ID
          and duration. AI will create time blocks for these too.
        </NoteBox>
        <FormField label="ADDITIONAL CONTEXT" noMargin>
          {({ id }) => (
            <Input.TextArea
              id={id}
              placeholder={`Sprint planning meeting for CREW-252 (1 hour)\nRetro + sprint review for CREW-252 (1.5 hours)\nCode review session for CES-917 PR #42 (45 min)`}
              value={additionalContext}
              onChange={(e) => onAdditionalContextChange(e.target.value)}
              autoSize={{ minRows: 3 }}
            />
          )}
        </FormField>
      </Card>

      <StepActions>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          disabled={!canProceed}
          loading={loading}
          loadingText={loadingMsg}
          onClick={onGenerate}
        >
          Generate with OpenRouter
        </Button>
      </StepActions>
    </div>
  );
}
