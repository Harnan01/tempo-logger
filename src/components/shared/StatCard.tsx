import { Card, Statistic } from 'antd';

type StatColor = 'accent' | 'success' | 'danger';

const colorMap: Record<StatColor, string> = {
  accent: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
};

interface StatCardProps {
  value: string | number;
  label: string;
  color?: StatColor;
}

export function StatCard({ value, label, color = 'accent' }: StatCardProps) {
  return (
    <Card>
      <Statistic
        title={
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{label}</span>
        }
        value={value}
        styles={{ content: { color: colorMap[color], fontWeight: 800, fontSize: 28 } }}
      />
    </Card>
  );
}
