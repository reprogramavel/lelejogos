import { CircleHelp, Maximize, Minimize, Plus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

type Props = {
  title: string;
  isFullscreen: boolean;
  onFullscreen: () => void;
  onHelp: () => void;
  onNew: () => void;
  newLabel: string;
  error: string;
};

export function GameViewControls({ title, isFullscreen, onFullscreen, onHelp, onNew, newLabel, error }: Props) {
  return <div className="game-view-controls">
    <strong className="game-only-fullscreen">{title}</strong>
    <div className="game-view-actions">
      <button className="game-only-fullscreen game-view-new" onClick={onNew} aria-label={newLabel}><Plus size={18}/><span>{newLabel}</span></button>
      <div className="game-only-fullscreen"><ThemeToggle/></div>
      <button className="icon-button game-only-fullscreen" onClick={onHelp} aria-label={`Como jogar ${title} em tela cheia`}><CircleHelp size={20}/></button>
      <button className="icon-button game-fullscreen-toggle" onClick={onFullscreen} aria-pressed={isFullscreen}
        aria-label={isFullscreen ? `Sair da tela cheia do ${title}` : `Tela cheia do ${title}`} title={isFullscreen ? 'Sair da tela cheia (Esc)' : 'Tela cheia do jogo'}>
        {isFullscreen ? <Minimize size={20}/> : <Maximize size={20}/>}
      </button>
    </div>
    {error && <span className="game-fullscreen-error" role="status">{error}</span>}
  </div>;
}
