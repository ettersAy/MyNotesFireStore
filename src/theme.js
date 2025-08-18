export function getTheme(mode) {
  const m = mode === 'light' ? 'light' : 'dark';
  const colors = m === 'light'
    ? {
        background: '#FFFFFF',
        surface: '#F5F7FA',
        text: '#0B1220',
        subtext: '#4B5563',
        border: '#E5E7EB',
        primary: '#2563EB',
        danger: '#DC2626',
        accent: '#10B981',
        tabActive: '#111827',
        tabInactive: '#6B7280',
        inputBg: '#FFFFFF'
      }
    : {
        background: '#0B1220',
        surface: '#151B2A',
        text: '#E5E7EB',
        subtext: '#9CA3AF',
        border: '#1F2937',
        primary: '#60A5FA',
        danger: '#F87171',
        accent: '#34D399',
        tabActive: '#FFFFFF',
        tabInactive: '#9CA3AF',
        inputBg: '#0F172A'
      };
  return { mode: m, colors };
}
