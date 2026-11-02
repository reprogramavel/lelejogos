import { ArrowLeft, CircleHelp } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function GameHeader({ title, symbol, onHome, onHelp }: {
  title: string; symbol: string; onHome: () => void; onHelp: () => void;
}) {
  return <header className="header floating-navbar">
    <button className="back-library" onClick={onHome} aria-label="Voltar à biblioteca" title="Todos os jogos"><ArrowLeft size={17}/><span>Todos os jogos</span></button>
    <div className="brand solitaire-brand"><span className="brand-mark">{symbol}</span><span>{title}<span className="brand-sub">LELÊ JOGOS</span></span></div>
    <div className="game-header-actions"><ThemeToggle/><button className="icon-button" onClick={onHelp} aria-label={`Como jogar ${title}`}><CircleHelp size={21}/></button></div>
  </header>;
}
