import { useState } from 'react';
import { Input, theme, Modal, App as AntApp } from 'antd';
import { CopyOutlined, RobotOutlined } from '@ant-design/icons';
import type { DayConfig, Meeting } from '@/types';
import { buildExternalAiPrompt } from '@/utils/prompts';
import { WORK_LOG_LINE_FORMAT } from '@/utils/buildEntries';
import { createDefaultDay } from '@/App';
import { Card, NoteBox, Button, StepActions } from '@/components/shared';
import { DayCard } from './DayCard';

interface Step2Props {
  dayConfigs: DayConfig[];
  onDayConfigsChange: (configs: DayConfig[]) => void;
  today: string;
  onBuild: () => void;
  onBack: () => void;
  canProceed: boolean;
}

export function Step2Input({
  dayConfigs,
  onDayConfigsChange,
  today,
  onBuild,
  onBack,
  canProceed,
}: Step2Props) {
  const { token } = theme.useToken();
  const { message } = AntApp.useApp();
  const [promptModalOpen, setPromptModalOpen] = useState(false);

  const externalPrompt = buildExternalAiPrompt(dayConfigs);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(externalPrompt).then(() => {
      message.success('Prompt copied to clipboard');
    });
  };

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
      {/* Day Schedule Cards */}
      <Card
        title="Day Schedule"
        extra={
          <Button variant="ghost" size="small" onClick={() => setPromptModalOpen(true)}>
            <RobotOutlined /> Get AI Prompt
          </Button>
        }
      >
        <NoteBox>
          Write one line per work block in each day&apos;s Work Log:{' '}
          <strong>{WORK_LOG_LINE_FORMAT}</strong>. The DSM and meetings are added from the day card.
          Entries are built in the app — nothing is sent to an AI.
        </NoteBox>
        {dayConfigs.map((day, i) => (
          <DayCard
            key={i}
            day={day}
            index={i}
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

      {/* External AI Prompt Modal */}
      <Modal
        open={promptModalOpen}
        onCancel={() => setPromptModalOpen(false)}
        footer={null}
        width={700}
        title={
          <span style={{ fontWeight: 600 }}>
            <RobotOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
            AI Prompt — Copy &amp; paste into Claude / ChatGPT / Gemini
          </span>
        }
      >
        <p style={{ fontSize: 13, color: token.colorTextSecondary, marginBottom: 12 }}>
          Copy this prompt, paste it into any AI tool, fill in what you worked on where indicated,
          then paste the AI response back into the <strong>Work Log</strong> field in each day card.
        </p>
        <Input.TextArea
          value={externalPrompt}
          readOnly
          autoSize={{ minRows: 14, maxRows: 22 }}
          style={{ fontFamily: token.fontFamilyCode, fontSize: 12 }}
        />
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={handleCopyPrompt}>
            <CopyOutlined /> Copy Prompt
          </Button>
        </div>
      </Modal>

      <StepActions>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" disabled={!canProceed} onClick={onBuild}>
          Build entries
        </Button>
      </StepActions>
    </div>
  );
}
