import { createContext } from 'react';

interface ThemeState {
  theme: 'default' | 'nascent';
}

export const ThemeContext = createContext<ThemeState>({ theme: 'default' });
