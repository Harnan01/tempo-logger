import { Card as AntCard } from 'antd';
import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  titleAs?: 'h2' | 'h3' | 'div';
  children: ReactNode;
  className?: string;
  animationDelay?: number;
}

export function Card({ title, children, className, animationDelay }: CardProps) {
  return (
    <AntCard
      title={
        title ? (
          <span
            style={{
              color: '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {title}
          </span>
        ) : undefined
      }
      className={className}
      style={{
        marginBottom: 20,
        animationDelay: animationDelay ? `${animationDelay}ms` : undefined,
      }}
    >
      {children}
    </AntCard>
  );
}
