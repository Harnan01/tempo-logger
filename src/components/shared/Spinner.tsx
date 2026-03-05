import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface SpinnerProps {
  size?: 'sm' | 'md';
  color?: 'accent' | 'white';
}

export function Spinner({ size = 'sm' }: SpinnerProps) {
  const fontSize = size === 'sm' ? 14 : 20;
  return <Spin indicator={<LoadingOutlined style={{ fontSize }} spin />} />;
}
