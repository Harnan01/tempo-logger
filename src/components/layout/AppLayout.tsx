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
            padding: '24px 20px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: `linear-gradient(135deg, ${token.colorPrimary}, #f97316)`,
              borderRadius: token.borderRadius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>
              Tempo AutoLogger
            </div>
            <div
              style={{
                fontSize: 11,
                color: token.colorTextTertiary,
                fontFamily: token.fontFamilyCode,
              }}
            >
              git → AI → Tempo
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
