import { Flex } from 'antd';
import type { ReactNode } from 'react';

interface StepActionsProps {
  children: ReactNode;
}

export function StepActions({ children }: StepActionsProps) {
  return (
    <Flex gap={12} align="center" wrap style={{ marginTop: 24 }}>
      {children}
    </Flex>
  );
}
