import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { Colors } from './Colors';

export const AppLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: '#ffffff',
    card: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
    notification: Colors.accent,
  },
};

export const AppDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.surfaceHighlight,
    notification: Colors.accent,
  },
};
