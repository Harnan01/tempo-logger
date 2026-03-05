import { Row, Col, Input, Tag, Typography, Flex, Card as AntCard, theme } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { WorklogEntry } from '@/types';
import { secToHuman, calcEndTime } from '@/utils/formatTime';
import {
  StatCard,
  NoteBox,
  Button,
  FormField,
  DurationInput,
  StepActions,
} from '@/components/shared';

const { Text } = Typography;

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
  const { token } = theme.useToken();

  return (
    <div>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <StatCard value={entries.length} label="WORKLOG ENTRIES" />
        </Col>
        <Col xs={24} md={8}>
          <StatCard value={`${totalHours.toFixed(1)}h`} label="TOTAL TIME" />
        </Col>
        <Col xs={24} md={8}>
          <StatCard value={`${uniqueDays}d`} label="DAYS COVERED" />
        </Col>
      </Row>

      <NoteBox>
        Review and edit entries below before submitting. Adjust descriptions, times, and dates as
        needed.
      </NoteBox>

      {entries.map((entry, index) => (
        <AntCard
          key={entry.id}
          size="small"
          style={{
            marginBottom: 14,
            background: token.colorBgElevated,
            animationDelay: `${index * 50}ms`,
          }}
          className="staggerIn"
          title={
            <Flex align="center" gap={12} wrap="wrap">
              <Tag
                color="orange"
                style={{
                  fontFamily: token.fontFamilyCode,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '2px 10px',
                }}
              >
                {entry.issueKey}
              </Tag>
              <Text type="secondary" style={{ fontSize: 11, fontFamily: token.fontFamilyCode }}>
                {entry.startDate} · {entry.startTime.slice(0, 5)} –{' '}
                {calcEndTime(entry.startTime, Number(entry.timeSpentSeconds))}
              </Text>
              <Text
                style={{
                  fontFamily: token.fontFamilyCode,
                  fontSize: 12,
                  color: token.colorSuccess,
                  marginLeft: 'auto',
                }}
              >
                {secToHuman(Number(entry.timeSpentSeconds))}
              </Text>
              <Button
                variant="danger"
                size="small"
                onClick={() => removeEntry(entry.id)}
                aria-label={`Remove ${entry.issueKey}`}
              >
                <DeleteOutlined />
              </Button>
            </Flex>
          }
        >
          <Row gutter={12}>
            <Col xs={24} lg={12}>
              <FormField label="DESCRIPTION" noMargin>
                {({ id }) => (
                  <Input.TextArea
                    id={id}
                    value={entry.description}
                    onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                    autoSize={{ minRows: 3 }}
                    style={{ fontSize: 12 }}
                  />
                )}
              </FormField>
            </Col>
            <Col xs={12} lg={5}>
              <FormField label="DATE" noMargin>
                {({ id }) => (
                  <Input
                    id={id}
                    type="date"
                    value={entry.startDate}
                    onChange={(e) => updateEntry(entry.id, 'startDate', e.target.value)}
                  />
                )}
              </FormField>
              <div style={{ marginTop: 8 }}>
                <FormField label="START TIME" noMargin>
                  {({ id }) => (
                    <Input
                      id={id}
                      value={entry.startTime}
                      placeholder="09:00:00"
                      onChange={(e) => updateEntry(entry.id, 'startTime', e.target.value)}
                    />
                  )}
                </FormField>
              </div>
            </Col>
            <Col xs={12} lg={7}>
              <DurationInput
                totalSeconds={Number(entry.timeSpentSeconds)}
                onChange={(secs) => updateEntry(entry.id, 'timeSpentSeconds', secs)}
              />
              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                  marginTop: 6,
                  display: 'block',
                  fontFamily: token.fontFamilyCode,
                }}
              >
                = {secToHuman(Number(entry.timeSpentSeconds))} (ends{' '}
                {calcEndTime(entry.startTime, Number(entry.timeSpentSeconds))})
              </Text>
            </Col>
          </Row>
        </AntCard>
      ))}

      <StepActions>
        <Button variant="ghost" onClick={onBack}>
          Regenerate
        </Button>
        <Button
          variant="success"
          disabled={entries.length === 0}
          loading={loading}
          loadingText={loadingMsg}
          onClick={onSubmit}
        >
          Log {entries.length} entries to Tempo
        </Button>
      </StepActions>
    </div>
  );
}
