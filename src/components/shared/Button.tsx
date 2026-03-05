import { Button as AntButton, type ButtonProps as AntButtonProps } from 'antd';
import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'success';

interface ButtonProps extends Omit<AntButtonProps, 'type' | 'variant' | 'danger' | 'loading'> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  loading = false,
  loadingText,
  children,
  style,
  ...rest
}: ButtonProps) {
  const antdProps: Partial<AntButtonProps> = {};
  const extraStyle: React.CSSProperties = { ...style };

  switch (variant) {
    case 'primary':
      antdProps.type = 'primary';
      break;
    case 'ghost':
      antdProps.type = 'default';
      break;
    case 'danger':
      antdProps.danger = true;
      break;
    case 'success':
      antdProps.type = 'primary';
      extraStyle.background = '#10b981';
      extraStyle.borderColor = '#10b981';
      break;
  }

  return (
    <AntButton {...antdProps} loading={loading} block={fullWidth} style={extraStyle} {...rest}>
      {loading && loadingText ? loadingText : children}
    </AntButton>
  );
}
