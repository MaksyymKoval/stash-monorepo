// The only place for colours, spacing and type. Rebranding = editing this file.
export const theme = {
  color: {
    background: '#FFFFFF',
    surface: '#F6F3F2',
    text: '#1C1917',
    muted: '#78716C',
    primary: '#BE185D',
    onPrimary: '#FFFFFF',
    border: '#E7E5E4',
    danger: '#B91C1C',
  },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 8, md: 12 },
  font: { body: 16, small: 14, title: 28 },
} as const;
