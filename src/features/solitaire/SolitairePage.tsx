import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, CircleHelp, Clock3, Lightbulb, Maximize2, Minimize2, Pause, Play, Plus, RotateCcw, Settings2, Undo2, Volume2, VolumeX, X } from 'lucide-react';
import { formatTime } from '../../shared/lib/format';
import { useSolitaire } from './hooks/useSolitaire';
import { SolitaireBoard } from './components/SolitaireBoard';
import { SolitaireDialog } from './components/SolitaireDialog';
import type { SolitaireDialogKind } from './components/SolitaireDialog';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
import { useGameFullscreen } from '../../shared/hooks/useGameFullscreen';
export default function SolitairePage({ onHome }: {
  onHome: () => void;
}) {
  const [modal, setModal] = useState<SolitaireDialogKind>(null);
  const [paused, setPaused] = useState(false);
  const [pendingDraw, setPendingDraw] = useState<1 | 3 | null>(null);
  const { game, history, seconds, selected, setSelected, suggestion, notice, setNotice, sound, setSound, storageError, victory, onMove, onSelect, onDraw, undo, showHint, start: startGame } = useSolitaire(paused, !!modal);
  const resume = useCallback(() => setPaused(false), []);
  const { gameRef, isFullscreen, toggleFullscreen } = useGameFullscreen(setNotice);
  function closeModal() {
    setModal(null);
    setPendingDraw(null);
  }
  function start(count?: 1 | 3, restart = false) {
    startGame(count, restart);
    closeModal();
    setPaused(false);
  }
  const time = formatTime(seconds);
  return <div className="app">
    <header className="header floating-navbar">
      <button className="back-library" onClick={onHome} aria-label="Voltar à biblioteca" title="Todos os jogos">
        <ArrowLeft size={17} />
        <span>Todos os jogos</span>
      </button>
      <a className="brand solitaire-brand" href="#" onClick={e => {
        e.preventDefault();
        setModal('help');
      }}>
        <span className="brand-mark">♠</span>
        <span>Paciência<span className="brand-sub">UM MOMENTO SÓ SEU</span></span>
      </a>
      <div className="game-header-actions"><ThemeToggle/><button className="icon-button" onClick={() => setModal('settings')} aria-label="Configurações">
        <Settings2 size={21} />
      </button></div>
    </header>
    <main>
      <section className="heading">
        <div>
          <div className="eyebrow">O SEU PRÓXIMO BOM MOMENTO</div>
          <h1>Uma carta de cada vez<span>.</span></h1>
          <p>Desacelere. Encontre seu ritmo. O resto pode esperar.</p>
        </div>
        <button className="new-button" onClick={() => {
          setPendingDraw(null);
          setModal('new');
        }}><Plus size={18} /> Nova partida</button>
      </section>
      <section ref={gameRef} className="game-shell" aria-label="Jogo de Paciência">
        <div className="game-top">
          <div className="game-title">
            <span className="mini-suit">♠</span>
            <strong>Klondike</strong>
            <span className="pill">CLÁSSICO</span>
          </div>
          <div className="stats">
            <span>
              <Clock3 size={15} />
              <b>
                {time}
              </b>
            </span>
            <i />
            <span className="moves-stat">
              <span>Movimentos</span>
              <b>
                {game.moves.toString().padStart(2, '0')}
              </b>
            </span>
            <button className="icon-button small" disabled={victory} onClick={() => setPaused(!paused)} aria-label={paused ? 'Continuar' : 'Pausar'}>
              {paused ? <Play size={17} /> : <Pause size={17} />}
            </button>
          </div>
        </div>
        <SolitaireBoard game={game} selected={selected} suggestion={suggestion} stockHint={!suggestion && notice.startsWith('Compre')} paused={paused} victory={victory} onResume={resume} onMove={onMove} onSelect={onSelect} onDraw={onDraw} onNotice={setNotice} onDragSelect={setSelected} />
        <div className="game-bottom">
          <div className="tools">
            <button onClick={undo} disabled={!history.length || paused || victory}>
              <Undo2 size={18} />
              <span>Desfazer</span>
            </button>
            <button onClick={showHint} disabled={paused || victory}>
              <Lightbulb size={18} />
              <span>Dica</span>
            </button>
            <button onClick={() => setModal('restart')}>
              <RotateCcw size={17} />
              <span>Reiniciar</span>
            </button>
            <button className="fullscreen-new-game" onClick={() => { setPendingDraw(null); setModal('new'); }} aria-label="Nova partida em tela cheia">
              <Plus size={18}/><span>Nova partida</span>
            </button>
          </div>
          <div className="bottom-right">
            <div className="fullscreen-actions">
              <ThemeToggle/>
              <button className="icon-button" onClick={() => setModal('help')} aria-label="Como jogar em tela cheia"><CircleHelp size={18}/></button>
              <button className="icon-button" onClick={() => setModal('settings')} aria-label="Configurações em tela cheia"><Settings2 size={18}/></button>
            </div>
            <span className="draw-indicator">COMPRA DE {game.drawCount}</span>
            <button className="icon-button" onClick={() => setSound(!sound)} aria-label={sound ? 'Desligar som' : 'Ligar som'}>
              {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button className="icon-button fullscreen" onClick={() => void toggleFullscreen()}
              aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia do jogo'}
              aria-pressed={isFullscreen} title={isFullscreen ? 'Sair da tela cheia (Esc)' : 'Jogar em tela cheia'}>
              {isFullscreen ? <Minimize2 size={17}/> : <Maximize2 size={17}/>}
            </button>
          </div>
        </div>
      </section>
      <div className="under-table">
        <span>
          <span className="status-dot" />
          {storageError ? 'Não foi possível salvar a partida neste dispositivo.' : 'Seu progresso é salvo automaticamente'}
        </span>
        <button onClick={() => setModal('help')}><CircleHelp size={16} /> Como jogar <ArrowRight size={14} /></button>
      </div>
      <footer>
        <span>FEITO PARA JOGAR SEM PRESSA</span>
        <span>52 cartas. Infinitas possibilidades.</span>
        <span className="footer-suits">♠ <em>♥</em> ♣ <em>♦</em></span>
      </footer>
    </main>
    {notice && createPortal(<div className="toast" role="status">
      <Lightbulb size={18} />
      {notice}
      <button onClick={() => setNotice('')} aria-label="Fechar aviso">
        <X size={16} />
      </button>
    </div>, isFullscreen && gameRef.current ? gameRef.current : document.body)}
    <SolitaireDialog kind={modal} victory={victory} time={time} moves={game.moves} drawCount={game.drawCount} pendingDraw={pendingDraw} onClose={closeModal} onDrawMode={count => {
      setPendingDraw(count);
      setModal('new');
    }} onStart={start} />
  </div>;
}
