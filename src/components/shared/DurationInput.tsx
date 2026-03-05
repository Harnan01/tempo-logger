import { InputNumber, Select, Space, Typography } from 'antd';

const { Text } = Typography;
const MINUTE_OPTIONS = [0, 15, 30, 45];

interface DurationInputProps {
  totalSeconds: number;
  onChange: (seconds: number) => void;
  id?: string;
}

export function DurationInput({ totalSeconds, onChange, id }: DurationInputProps) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);

  const snappedMinutes = MINUTE_OPTIONS.reduce((prev, curr) =>
    Math.abs(curr - minutes) < Math.abs(prev - minutes) ? curr : prev,
  );

  const handleHoursChange = (h: number | null) => {
    const newSecs = Math.max(0, h ?? 0) * 3600 + snappedMinutes * 60;
    onChange(Math.max(900, newSecs));
  };

  const handleMinutesChange = (m: number) => {
    const newSecs = hours * 3600 + m * 60;
    onChange(Math.max(900, newSecs));
  };

  return (
    <Space align="end">
      <div>
        <Text
          type="secondary"
          style={{
            fontSize: 11,
            display: 'block',
            marginBottom: 4,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: 0.5,
            fontWeight: 500,
          }}
        >
          HOURS
        </Text>
        <InputNumber
          id={id ? `${id}-h` : undefined}
          min={0}
          max={23}
          value={hours}
          onChange={handleHoursChange}
          style={{ width: 70 }}
        />
      </div>
      <Text strong style={{ paddingBottom: 6, fontSize: 18 }}>
        :
      </Text>
      <div>
        <Text
          type="secondary"
          style={{
            fontSize: 11,
            display: 'block',
            marginBottom: 4,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: 0.5,
            fontWeight: 500,
          }}
        >
          MINUTES
        </Text>
        <Select
          id={id ? `${id}-m` : undefined}
          value={snappedMinutes}
          onChange={handleMinutesChange}
          style={{ width: 70 }}
          options={MINUTE_OPTIONS.map((m) => ({
            value: m,
            label: String(m).padStart(2, '0'),
          }))}
        />
      </div>
    </Space>
  );
}
