import { useId, type ReactNode } from 'react';
import { Form, Typography } from 'antd';

const { Text } = Typography;

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string | null;
  noMargin?: boolean;
  children: (props: { id: string; hasError: boolean }) => ReactNode;
}

export function FormField({ label, hint, error, noMargin, children }: FormFieldProps) {
  const id = useId();
  const hasError = !!error;

  return (
    <Form.Item
      label={
        <span
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: 0.5,
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      }
      validateStatus={hasError ? 'error' : undefined}
      help={
        error ||
        (hint ? (
          <Text type="secondary" style={{ fontSize: 11 }}>
            {hint}
          </Text>
        ) : undefined)
      }
      style={{ marginBottom: noMargin ? 0 : 18 }}
    >
      {children({ id, hasError })}
    </Form.Item>
  );
}
