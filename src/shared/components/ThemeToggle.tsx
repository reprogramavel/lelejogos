import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../app/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return <button className="theme-toggle" onClick={toggleTheme}
    aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'} aria-pressed={dark}
    title={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
    <span className={`theme-symbol ${!dark ? 'active' : ''}`} aria-hidden="true"><Sun size={16} strokeWidth={1.7}/></span>
    <span className={`theme-symbol ${dark ? 'active' : ''}`} aria-hidden="true"><Moon size={15} strokeWidth={1.7}/></span>
  </button>;
}
