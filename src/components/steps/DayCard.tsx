import { Row, Col, Input, Card as AntCard, Flex, theme } from 'antd';
import type { DayConfig, Meeting } from '@/types';
import { WORK_LOG_LINE_FORMAT } from '@/utils/buildEntries';
import { FormField, Button } from '@/components/shared';

interface DayCardProps {
  day: DayConfig;
  index: number;
  today: string;
  canRemove: boolean;
  onUpdate: (field: keyof DayConfig, value: string) => void;
  onMeetingsChange: (meetings: Meeting[]) => void;
  onRemove: () => void;
}

export function DayCard({
  day,
  index,
  today,
  canRemove,
  onUpdate,
  onMeetingsChange,
  onRemove,
}: DayCardProps) {
  const { token } = theme.useToken();

  const addMeeting = () => {
    onMeetingsChange([
      ...day.meetings,
      { description: '', startTime: '', endTime: '', jiraId: '' },
    ]);
  };

  const updateMeeting = (mIdx: number, field: keyof Meeting, value: string) => {
    const updated = day.meetings.map((m, i) =>
      i === mIdx ? { ...m, [field]: field === 'jiraId' ? value.toUpperCase() : value } : m,
    );
    onMeetingsChange(updated);
  };

  const removeMeeting = (mIdx: number) => {
    onMeetingsChange(day.meetings.filter((_, i) => i !== mIdx));
  };

  return (
    <AntCard
      size="small"
      style={{ marginBottom: 14, background: token.colorBgElevated }}
      title={
        <Flex justify="space-between" align="center">
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: token.colorTextSecondary,
              letterSpacing: 1,
            }}
          >
            DAY {index + 1}
          </span>
          {canRemove && (
            <Button
              variant="danger"
              size="small"
              onClick={onRemove}
              aria-label={`Remove day ${index + 1}`}
            >
              Remove
            </Button>
          )}
        </Flex>
      }
    >
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <FormField label="DATE" noMargin>
            {({ id }) => (
              <Input
                id={id}
                type="date"
                value={day.date}
                max={today}
                onChange={(e) => onUpdate('date', e.target.value)}
              />
            )}
          </FormField>
        </Col>
        <Col xs={24} md={8}>
          <FormField label="WORK START" noMargin>
            {({ id }) => (
              <Input
                id={id}
                type="time"
                value={day.startTime}
                onChange={(e) => onUpdate('startTime', e.target.value)}
              />
            )}
          </FormField>
        </Col>
        <Col xs={24} md={8}>
          <FormField label="WORK END" noMargin>
            {({ id }) => (
              <Input
                id={id}
                type="time"
                value={day.endTime}
                onChange={(e) => onUpdate('endTime', e.target.value)}
              />
            )}
          </FormField>
        </Col>
      </Row>

      {/* Lunch + DSM times — 4 equal columns, enough room for the native time picker */}
      <Row gutter={12} style={{ marginTop: 12 }}>
        <Col xs={12} md={6}>
          <FormField label="LUNCH START" noMargin>
            {({ id }) => (
              <Input
                id={id}
                type="time"
                value={day.lunchStart}
                onChange={(e) => onUpdate('lunchStart', e.target.value)}
              />
            )}
          </FormField>
        </Col>
        <Col xs={12} md={6}>
          <FormField label="LUNCH END" noMargin>
            {({ id }) => (
              <Input
                id={id}
                type="time"
                value={day.lunchEnd}
                onChange={(e) => onUpdate('lunchEnd', e.target.value)}
              />
            )}
          </FormField>
        </Col>
        <Col xs={12} md={6}>
          <FormField label="DSM START" noMargin>
            {({ id }) => (
              <Input
                id={id}
                type="time"
                value={day.dsmStart}
                onChange={(e) => onUpdate('dsmStart', e.target.value)}
              />
            )}
          </FormField>
        </Col>
        <Col xs={12} md={6}>
          <FormField label="DSM END" noMargin>
            {({ id }) => (
              <Input
                id={id}
                type="time"
                value={day.dsmEnd}
                onChange={(e) => onUpdate('dsmEnd', e.target.value)}
              />
            )}
          </FormField>
        </Col>
      </Row>

      {/* DSM Ticket on its own row — needs enough width for IDs like CREW-1234 */}
      <Row gutter={12} style={{ marginTop: 12 }}>
        <Col xs={24} md={10}>
          <FormField label="DSM TICKET" noMargin>
            {({ id }) => (
              <Input
                id={id}
                placeholder="CREW-100"
                value={day.dsmTicket}
                onChange={(e) => onUpdate('dsmTicket', e.target.value.toUpperCase())}
              />
            )}
          </FormField>
        </Col>
      </Row>

      {/* Meetings / Ceremonies */}
      <div
        style={{
          margin: '14px 0 10px',
          fontSize: 11,
          fontWeight: 600,
          color: token.colorTextSecondary,
          letterSpacing: 0.5,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          paddingTop: 12,
        }}
      >
        MEETINGS / CEREMONIES (Optional)
      </div>

      {day.meetings.map((m, mIdx) => (
        <div
          key={mIdx}
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
            padding: '10px 12px',
            marginBottom: 8,
          }}
        >
          <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: token.colorTextSecondary,
                letterSpacing: 0.5,
              }}
            >
              MEETING {mIdx + 1}
            </span>
            <Button
              variant="danger"
              size="small"
              onClick={() => removeMeeting(mIdx)}
              aria-label={`Remove meeting ${mIdx + 1}`}
            >
              Remove
            </Button>
          </Flex>
          <Row gutter={12}>
            <Col xs={24} md={8}>
              <FormField label="DESCRIPTION" noMargin>
                {({ id }) => (
                  <Input
                    id={id}
                    placeholder="Sprint planning"
                    value={m.description}
                    onChange={(e) => updateMeeting(mIdx, 'description', e.target.value)}
                  />
                )}
              </FormField>
            </Col>
            <Col xs={12} md={5}>
              <FormField label="START TIME" noMargin>
                {({ id }) => (
                  <Input
                    id={id}
                    type="time"
                    value={m.startTime}
                    onChange={(e) => updateMeeting(mIdx, 'startTime', e.target.value)}
                  />
                )}
              </FormField>
            </Col>
            <Col xs={12} md={5}>
              <FormField label="END TIME" noMargin>
                {({ id }) => (
                  <Input
                    id={id}
                    type="time"
                    value={m.endTime}
                    onChange={(e) => updateMeeting(mIdx, 'endTime', e.target.value)}
                  />
                )}
              </FormField>
            </Col>
            <Col xs={24} md={6}>
              <FormField label="JIRA ID" noMargin>
                {({ id }) => (
                  <Input
                    id={id}
                    placeholder="CREW-252"
                    value={m.jiraId}
                    onChange={(e) => updateMeeting(mIdx, 'jiraId', e.target.value)}
                  />
                )}
              </FormField>
            </Col>
          </Row>
        </div>
      ))}

      <Button variant="ghost" size="small" onClick={addMeeting} style={{ marginBottom: 4 }}>
        + Add Meeting
      </Button>

      <div style={{ marginTop: 12 }}>
        <FormField
          label="WORK LOG"
          hint={`One line per work block: ${WORK_LOG_LINE_FORMAT}. DSM and meetings above are added automatically.`}
          noMargin
        >
          {({ id }) => (
            <Input.TextArea
              id={id}
              placeholder={`09:00 – 10:30: Created BatchMapping entity [CREW-1026]\n10:45 – 12:30: Extended Batch entity with validity fields [CREW-1026]\n13:30 – 18:00: Implemented assignCrewToBatch() logic [CREW-1027]`}
              value={day.workLog}
              onChange={(e) => onUpdate('workLog', e.target.value)}
              autoSize={{ minRows: 5 }}
            />
          )}
        </FormField>
      </div>
    </AntCard>
  );
}
