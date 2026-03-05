import { Row, Col, Flex, Typography, theme } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { SubmitResult } from '@/types';
import { StatCard, NoteBox, Button, StepActions } from '@/components/shared';

const { Text } = Typography;

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
  const { token } = theme.useToken();
  const failureCount = submitResults.length - successCount;

  return (
    <div>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <StatCard value={successCount} label="LOGGED" color="success" />
        </Col>
        <Col xs={24} md={8}>
          <StatCard value={failureCount} label="FAILED" color="danger" />
        </Col>
        <Col xs={24} md={8}>
          <StatCard value={`${totalHours.toFixed(1)}h`} label="TOTAL LOGGED" />
        </Col>
      </Row>

      {failureCount > 0 && (
        <NoteBox variant="warning">
          Some entries failed. This may be due to browser CORS restrictions on the Tempo API.
          <br />
          If you see CORS errors, run this as a local script instead: copy the entries and use curl
          or a small Node.js script to submit them.
        </NoteBox>
      )}

      {submitResults.map((r, i) => (
        <Flex
          key={i}
          align="center"
          justify="space-between"
          style={{
            padding: '10px 16px',
            borderRadius: token.borderRadiusLG,
            marginBottom: 8,
            fontFamily: token.fontFamilyCode,
            fontSize: 13,
            animation: `staggerIn 0.4s ease-out both`,
            animationDelay: `${i * 40}ms`,
            background: r.ok ? `${token.colorSuccess}12` : `${token.colorError}12`,
            border: `1px solid ${r.ok ? token.colorSuccess : token.colorError}40`,
            color: r.ok ? token.colorSuccess : token.colorError,
          }}
        >
          <Flex align="center" gap={8}>
            {r.ok ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            <Text style={{ color: 'inherit', fontFamily: 'inherit' }}>{r.issueKey}</Text>
          </Flex>
          <Text style={{ color: 'inherit', fontFamily: 'inherit', opacity: 0.7 }}>
            HTTP {r.status} {r.msg ? `· ${r.msg}` : ''}
          </Text>
        </Flex>
      ))}

      <StepActions>
        <Button variant="ghost" onClick={onBackToReview}>
          Back to Review
        </Button>
        <Button variant="primary" onClick={onStartNew}>
          Start New
        </Button>
      </StepActions>
    </div>
  );
}
