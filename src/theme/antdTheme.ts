import { theme, type ThemeConfig } from 'antd';

const sharedTokens = {
  colorPrimary: '#f59e0b',
  colorSuccess: '#10b981',
  colorError: '#ef4444',
  colorWarning: '#f59e0b',
  colorInfo: '#38bdf8',

  fontFamily: "'Syne', ui-sans-serif, system-ui, -apple-system, sans-serif",
  fontFamilyCode: "'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace",
  fontSize: 13,

  borderRadius: 8,
  borderRadiusLG: 10,
  borderRadiusSM: 6,

  motionDurationFast: '0.15s',
  motionDurationMid: '0.2s',
  motionDurationSlow: '0.3s',
};

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...sharedTokens,
    colorBgBase: '#070710',
    colorBgContainer: '#0d0d1f',
    colorBgElevated: '#0e0e1e',
    colorBgLayout: '#070710',
    colorBorder: '#1e1e35',
    colorBorderSecondary: '#2a2a45',
    colorText: '#dde3f0',
    colorTextSecondary: '#6b7494',
    colorTextTertiary: '#4a5278',
    colorTextQuaternary: '#3a4060',
  },
  components: {
    Layout: {
      siderBg: '#0d0d1f',
      bodyBg: '#070710',
      headerBg: '#0d0d1f',
    },
    Card: {
      colorBgContainer: '#0d0d1f',
      colorBorderSecondary: '#1e1e35',
    },
    Input: {
      colorBgContainer: '#07070f',
      fontFamily: "'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace",
    },
    InputNumber: {
      colorBgContainer: '#07070f',
      fontFamily: "'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace",
    },
    Select: {
      colorBgContainer: '#07070f',
      fontFamily: "'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace",
    },
    Button: {
      fontWeight: 700,
    },
    Steps: {
      colorPrimary: '#f59e0b',
    },
  },
};

export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...sharedTokens,
    colorBgBase: '#f8f9fc',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f8f9fc',
    colorBorder: '#e2e4ea',
    colorBorderSecondary: '#cdd0d9',
    colorText: '#1a1d2d',
    colorTextSecondary: '#5c6275',
    colorTextTertiary: '#7b8298',
    colorTextQuaternary: '#9ca2b4',
  },
  components: {
    Layout: {
      siderBg: '#ffffff',
      bodyBg: '#f8f9fc',
      headerBg: '#ffffff',
    },
    Card: {
      colorBgContainer: '#ffffff',
      colorBorderSecondary: '#e2e4ea',
    },
    Input: {
      colorBgContainer: '#f1f3f8',
      fontFamily: "'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace",
    },
    InputNumber: {
      colorBgContainer: '#f1f3f8',
      fontFamily: "'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace",
    },
    Select: {
      colorBgContainer: '#f1f3f8',
      fontFamily: "'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace",
    },
    Button: {
      fontWeight: 700,
    },
  },
};
