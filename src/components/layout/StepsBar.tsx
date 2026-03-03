import type { StepNumber } from '@/hooks/useWorkflow';
import styles from '@/styles/components/steps-bar.module.css';

const STEPS = [
  { n: 1, label: 'Configure' },
  { n: 2, label: 'Commits' },
  { n: 3, label: 'Review' },
  { n: 4, label: 'Done' },
] as const;

interface StepsBarProps {
  currentStep: StepNumber;
}

export function StepsBar({ currentStep }: StepsBarProps) {
  return (
    <div className={styles.stepsBar}>
      {STEPS.map(({ n, label }) => {
        const cls = [
          styles.stepItem,
          currentStep === n ? styles.active : '',
          currentStep > n ? styles.done : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <div key={n} className={cls}>
            <div className={styles.stepNum}>{currentStep > n ? '✓' : n}</div>
            <span className={styles.stepLabel}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
