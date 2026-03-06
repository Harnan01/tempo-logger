import { useState } from 'react';
import { Layout, Steps, Button, theme } from 'antd';
import { MenuUnfoldOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { StepNumber } from '@/hooks/useWorkflow';

const { Sider, Content } = Layout;

const STEPS = [
  { title: 'Configure', description: 'API credentials' },
  { title: 'Input', description: 'Commits & logs' },
  { title: 'Review', description: 'Edit entries' },
  { title: 'Results', description: 'Submit status' },
];

interface AppLayoutProps {
  currentStep: StepNumber;
  onStepClick?: (step: StepNumber) => void;
  themeMode: 'dark' | 'light';
  onThemeToggle: () => void;
  children: ReactNode;
}

export function AppLayout({
  currentStep,
  onStepClick,
  themeMode,
  onThemeToggle,
  children,
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: '20px 20px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: 34,
              height: 34,
              background: `linear-gradient(140deg, ${token.colorPrimary} 0%, #f97316 100%)`,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 2px 8px ${token.colorPrimary}55`,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 3L5 13.5H11.5L10.5 21L19 10.5H12.5L13 3Z"
                fill="white"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Brand text */}
          <div style={{ lineHeight: 1 }}>
            <div
              style={{
                fontFamily: "'Inter', ui-sans-serif, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: '-0.2px',
                color: token.colorText,
                lineHeight: '20px',
              }}
            >
              Tempo <span style={{ color: token.colorPrimary }}>AutoLogger</span>
            </div>
            <div
              style={{
                fontFamily: token.fontFamilyCode,
                fontSize: 10,
                color: token.colorTextTertiary,
                letterSpacing: '0.3px',
                lineHeight: '16px',
                marginTop: 1,
              }}
            >
              git · AI · Tempo
            </div>
          </div>
        </div>

        {/* Steps navigation */}
        <div style={{ padding: '24px 20px', flex: 1 }}>
          <Steps
            direction="vertical"
            current={currentStep - 1}
            items={STEPS.map((s, i) => ({
              ...s,
              status: i + 1 < currentStep ? 'finish' : i + 1 === currentStep ? 'process' : 'wait',
              style: {
                cursor: i + 1 < currentStep ? 'pointer' : 'default',
              },
            }))}
            onChange={(idx) => {
              const target = (idx + 1) as StepNumber;
              if (target < currentStep && onStepClick) {
                onStepClick(target);
              }
            }}
            size="small"
          />
        </div>

        {/* Theme toggle */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            block
            onClick={onThemeToggle}
            size="small"
            icon={themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          >
            {themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 0 : 260,
          transition: 'margin-left 0.2s',
        }}
      >
        {/* Mobile menu toggle */}
        {collapsed && (
          <div style={{ padding: '12px 24px' }}>
            <Button type="text" icon={<MenuUnfoldOutlined />} onClick={() => setCollapsed(false)} />
          </div>
        )}

        <Content
          style={{
            padding: '32px 40px',
            maxWidth: 960,
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div className="stepContent">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
