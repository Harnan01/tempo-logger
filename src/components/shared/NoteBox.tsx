import { Alert } from 'antd';
import type { ReactNode } from 'react';

type NoteVariant = 'info' | 'error' | 'warning';

interface NoteBoxProps {
  variant?: NoteVariant;
  children: ReactNode;
  className?: string;
}

export function NoteBox({ variant = 'info', children, className }: NoteBoxProps) {
  return (
    <Alert
      type={variant}
      title={children}
      showIcon
      className={className}
      style={{ marginBottom: 16 }}
    />
  );
}
