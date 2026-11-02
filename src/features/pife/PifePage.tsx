import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Layers3, Plus, RotateCcw, Sparkles, Trophy, UserRound } from 'lucide-react';
import { GameHeader } from '../../shared/components/GameHeader';
import { GameViewControls } from '../../shared/components/GameViewControls';
import { HandCard } from '../../shared/components/HandCard';
import { Modal } from '../../shared/components/Modal';
import { useSavedGame } from '../../shared/hooks/useSavedGame';
import { useGameFullscreen } from '../../shared/hooks/useGameFullscreen';
import { label, rank, suit, suits } from '../../shared/lib/cards';
import { STORAGE_KEYS } from '../../shared/lib/storage';
import { arrangeHand, canDiscard, cpuTurn, declarePife, discardPife, drawPife, newPife, validPife, winningHand } from './game';

export default function PifePage({ onHome }: { onHome: () => void }) {
  const { game, setGame, saveError } = useSavedGame(STORAGE_KEYS.pife, validPife, newPife);
  const [selected, setSelected] = useState<number | null>(null);
  const [organized, setOrganized] = useState(true);
  const [dialog, setDialog] = useState<'help' | 'new' | null>(null);
  const [fullscreenError, setFullscreenError] = useState('');
  const { gameRef, isFullscreen, toggleFullscreen } = useGameFullscreen(setFullscreenError);
  const arrangement = useMemo(() => arrangeHand(game.player), [game.player]);
  const grouped = useMemo(() => new Set(arrangement.groups.flat()), [arrangement]);
  const hand = organized ? [...arrangement.groups.flat(), ...arrangement.loose.slice().sort((a, b) => rank(a) - rank(b) || suit(a) - suit(b))] : game.player;
  const finished = game.phase === 'finished';
  const canFinishTen = game.phase === 'discard' && winningHand(game.player);
  const canFinish = selected !== null && canDiscard(game, selected) && winningHand(game.player.filter(card => card !== selected));

  useEffect(() => {
    if (game.phase !== 'cpu' || dialog) return;
    const timer = window.setTimeout(() => setGame(current => cpuTurn(current)), 850);
    return () => window.clearTimeout(timer);
  }, [game.phase, dialog, setGame]);

  function buy(from: 'stock' | 'waste') {
    const next = drawPife(game, from);
    if (next) { setGame(next); setSelected(null); }
  }
  function discard() {
    if (selected === null) return;
    const next = discardPife(game, selected);
    if (next) { setGame(next); setSelected(null); }
  }
  function finishTen() {
    const next = declarePife(game);
    if (next) { setGame(next); setSelected(null); }
  }
  function start() { setGame(newPife(game.score)); setSelected(null); setDialog(null); }
  function requestNew() { if (!finished && (game.turns || game.phase === 'discard')) setDialog('new'); else start(); }

  const instruction = finished ? game.result === 'player' ? `Você bateu com ${game.player.length} cartas!` : game.result === 'cpu' ? 'Lelê bateu. A próxima pode ser sua!' : 'Rodada empatada. Vamos jogar outra?'
    : game.phase === 'cpu' ? 'Lelê está pensando…'
      : game.phase === 'draw' ? 'Sua vez: compre uma carta do monte ou do descarte.'
        : canFinishTen ? 'Todas as dez cartas estão combinadas. Você pode bater sem descartar!'
        : selected !== null && game.fromWaste && selected === game.drawnCard ? 'A carta que veio do descarte deve ficar na sua mão neste turno.'
          : 'Escolha uma carta da sua mão e descarte para terminar a vez.';

  return <div className="pife-page">
    <GameHeader title="Pife" symbol="♣" onHome={onHome} onHelp={() => setDialog('help')}/>
    <main className="play-main">
      <section className="play-heading"><div><div className="eyebrow">UMA BOA MÃO. UM BOM DESAFIO.</div><h1>Uma partida de Pife<span>.</span></h1><p>Compre, forme suas combinações e bata antes da Lelê.</p></div><button className="new-button" onClick={requestNew}><Plus size={17}/> Nova rodada</button></section>
      <section ref={gameRef} className="pife-table" aria-label="Jogo Pife">
        <GameViewControls title="Pife" isFullscreen={isFullscreen} onFullscreen={() => { setFullscreenError(''); void toggleFullscreen(); }} onHelp={() => setDialog('help')} onNew={requestNew} newLabel="Nova rodada" error={fullscreenError}/>
        <div className="pife-topbar"><span><Layers3 size={16}/> PIFE <small>VOCÊ × LELÊ</small></span><span>VOCÊ <b>{game.score.player}</b><i/>LELÊ <b>{game.score.cpu}</b></span></div>
        <div className="pife-opponent"><div className="pife-avatar"><Sparkles size={21}/></div><div><strong>Lelê</strong><small>{game.phase === 'cpu' ? 'Pensando na próxima jogada…' : 'Sua adversária'}</small></div><span className="pife-player-tag">{game.cpu.length} CARTAS</span></div>
        <div className={`cpu-hand ${finished ? 'revealed' : ''}`} aria-label="Cartas da adversária">
          {game.cpu.map(card => finished ? <HandCard key={card} id={card} disabled/> : <span className="cpu-card-back" key={card} aria-label="Carta fechada"><i>♣</i></span>)}
        </div>
        <div className="pife-center">
          <div className="pife-pile"><button className="hand-card pife-stock" onClick={() => buy('stock')} disabled={game.phase !== 'draw'} aria-label="Comprar do monte do Pife"><span>♣</span><small>{game.stock.length ? game.stock.length : <RotateCcw size={17}/>}</small></button><span>MONTE · {game.stock.length} CARTAS</span></div>
          <div className="pife-center-copy"><span className="pife-turn-dot"/><strong>{finished ? 'RODADA ENCERRADA' : game.phase === 'cpu' ? 'VEZ DA LELÊ' : 'SUA VEZ'}</strong><p>Trincas de valores iguais.<br/>Sequências do mesmo naipe.</p><span>{game.turns} JOGADAS</span></div>
          <div className="pife-pile">{game.waste.length > 0 ? <HandCard id={game.waste.at(-1)!} onClick={() => buy('waste')} disabled={game.phase !== 'draw'}/> : <div className="pife-empty-pile">♧</div>}<span>DESCARTE · {game.waste.length}</span></div>
        </div>
        <div className={`pife-instruction ${finished ? 'pife-finished' : ''}`} role="status" aria-live="polite">{finished ? <Trophy size={18}/> : <UserRound size={17}/>}<span>{instruction}</span>{finished && <button onClick={start}>Jogar outra<ArrowRight size={16}/></button>}</div>
        <div className="pife-hand-header"><span>SUA MÃO <small>{game.player.length} CARTAS</small></span><button className={organized ? 'organized' : ''} onClick={() => setOrganized(!organized)}><Layers3 size={14}/>{organized ? 'Jogos organizados' : 'Organizar jogos'}</button></div>
        <div className="pife-hand" aria-label="Sua mão de cartas">
          {hand.map(card => <HandCard key={card} id={card} selected={selected === card} grouped={grouped.has(card)} disabled={game.phase === 'cpu' || finished} onClick={() => setSelected(selected === card ? null : card)}/>)}
        </div>
        <div className="pife-hand-bottom"><span><span className="meld-dot"/>{game.player.length - arrangement.loose.length} de {game.player.length} cartas combinadas</span><button className="pife-discard" onClick={canFinishTen ? finishTen : discard} disabled={!canFinishTen && (selected === null || !canDiscard(game, selected))}>{canFinishTen ? 'Bater com 10 cartas' : canFinish ? 'Descartar e bater!' : 'Descartar selecionada'}<ArrowRight size={16}/></button></div>
      </section>
      <div className="pife-details"><section><h3>Suas combinações</h3>{arrangement.groups.length ? arrangement.groups.map((group, index) => <p key={index}><Check size={14}/><strong>{group.every(card => rank(card) === rank(group[0])) ? 'Trinca' : 'Sequência'}</strong><span>{group.map(card => `${label(card)}${suits[suit(card)]}`).join(' · ')}</span></p>) : <p className="pife-empty-note">As combinações completas aparecem aqui. As cartas com borda dourada já fazem parte de um jogo.</p>}</section><section><h3>Últimas jogadas</h3>{game.log.slice(0, 3).map((line, index) => <p key={index} className="pife-log">{line}</p>)}</section></div>
      <p className="play-save-note"><Check size={13}/>{saveError ? 'Não foi possível salvar neste dispositivo.' : 'Sua rodada e seu placar são salvos automaticamente.'}</p>
    </main>
    {dialog && <Modal titleId="pife-dialog-title" onClose={() => setDialog(null)}>
      <div className="modal-symbol">♣</div><h2 id="pife-dialog-title">{dialog === 'help' ? 'Vamos jogar Pife.' : 'Embaralhar de novo?'}</h2>
      {dialog === 'help' ? <><p>Você e Lelê recebem nove cartas de dois baralhos, sem curingas. Combine todas as nove ou dez cartas em jogos de pelo menos três cartas para bater.</p><div className="help-steps"><p><b>01</b> Compre uma carta do monte ou a carta de cima do descarte antes de bater. Sua mão passa a ter dez cartas.</p><p><b>02</b> Trinca: cartas do mesmo valor, com pelo menos três naipes diferentes. Pode incluir cartas adicionais do mesmo valor. Sequência: três ou mais cartas seguidas do mesmo naipe. O ás fica antes do 2 ou depois do rei, nunca no meio de K–A–2.</p><p><b>03</b> Clique em uma carta da sua mão e depois em Descartar. Se pegou do descarte, precisa descartar outra carta. Com as nove cartas restantes combinadas, a batida é automática.</p><p><b>04</b> Se todas as dez cartas estiverem combinadas, use Bater com 10 cartas, sem descartar. Uma carta não pode pertencer a dois jogos. Não há limite de jogadas; o monte é reciclado quando necessário.</p></div><button className="primary" onClick={() => setDialog(null)}>Vamos jogar<ArrowRight size={16}/></button></>
        : <><p>A rodada atual será substituída. O placar das rodadas concluídas será mantido.</p><div className="modal-actions"><button className="secondary" onClick={() => setDialog(null)}>Continuar esta</button><button className="primary" onClick={start}>Nova rodada<ArrowRight size={16}/></button></div></>}
    </Modal>}
  </div>;
}
