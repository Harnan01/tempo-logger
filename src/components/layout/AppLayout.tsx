import type { ReactNode } from 'react';
import type { StepNumber } from '@/hooks/useWorkflow';
import { Header } from './Header';
import { StepsBar } from './StepsBar';

interface AppLayoutProps {
  currentStep: StepNumber;
  children: ReactNode;
}

export function AppLayout({ currentStep, children }: AppLayoutProps) {
  return (
    <div className="app">
      <Header />
      <StepsBar currentStep={currentStep} />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 40px 0' }}>{children}</div>
    </div>
  );
}
