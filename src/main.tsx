import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { applyTheme, readTheme, ThemeProvider } from './app/ThemeProvider';
import { LiquidBackdrop } from './shared/components/LiquidBackdrop';
import './shared/styles/base.css';
import './features/solitaire/solitaire.css';
import './features/library/library.css';
import './shared/styles/games.css';
import './shared/styles/theme.css';
import './shared/styles/navbar.css';
import './shared/styles/liquid-glass.css';
import './features/solitaire/fullscreen.css';
import './shared/styles/hig.css';
import './shared/styles/game-fullscreen.css';
applyTheme(readTheme());
createRoot(document.getElementById('root')!).render(<StrictMode>
  <ThemeProvider><LiquidBackdrop/><App /></ThemeProvider>
</StrictMode>);
