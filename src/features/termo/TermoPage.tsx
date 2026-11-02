import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Delete, Keyboard, Plus, Trophy } from 'lucide-react';
import { GameHeader } from '../../shared/components/GameHeader';
import { GameViewControls } from '../../shared/components/GameViewControls';
import { Modal } from '../../shared/components/Modal';
import { STORAGE_KEYS } from '../../shared/lib/storage';
import { useSavedGame } from '../../shared/hooks/useSavedGame';
import { useGameFullscreen } from '../../shared/hooks/useGameFullscreen';
import { evaluateGuess, newTermo, submitGuess, termoStatus, validTermo } from './game';
import type { LetterMark } from './game';
import { normalizeWord } from './words';

const keyboardRows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
export default function TermoPage({ onHome }: { onHome: () => void }) {
  const { game, setGame, saveError } = useSavedGame(STORAGE_KEYS.termo, validTermo, newTermo);
  const [dialog, setDialog] = useState<'help' | 'new' | null>(null);
  const [notice, setNotice] = useState('');
  const [fullscreenError, setFullscreenError] = useState('');
  const { gameRef, isFullscreen, toggleFullscreen } = useGameFullscreen(setFullscreenError);
  const status = termoStatus(game);
  const marks = useMemo(() => game.guesses.map(word => evaluateGuess(word, game.answer)), [game.guesses, game.answer]);
  const keyMarks = useMemo(() => {
    const result: Record<string, LetterMark> = {};
    const priority = { absent: 0, present: 1, correct: 2 };
    game.guesses.forEach((word, row) => [...word].forEach((letter, index) => {
      const mark = marks[row][index];
      if (!result[letter] || priority[mark] > priority[result[letter]]) result[letter] = mark;
    }));
    return result;
  }, [game.guesses, marks]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const typeKey = useCallback((key: string) => {
    if (dialog || status !== 'playing') return;
    setNotice('');
    if (key === 'ENTER') {
      const result = submitGuess(game);
      if (result.error) setNotice(result.error);
      else setGame(result.game);
      return;
    }
    setGame(current => {
      if (key === 'BACKSPACE') return { ...current, current: current.current.slice(0, -1) };
      const letter = normalizeWord(key);
      return /^[A-Z]$/.test(letter) && current.current.length < 5
        ? { ...current, current: current.current + letter } : current;
    });
  }, [dialog, status, game, setGame]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing || dialog) return;
      const key = event.key.toUpperCase();
      if (key === 'ENTER' && (event.target as HTMLElement)?.closest('button') && !(event.target as HTMLElement)?.closest('.word-key')) return;
      if (key === 'ENTER' || key === 'BACKSPACE' || (key.length === 1 && /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]$/.test(key))) {
        event.preventDefault(); typeKey(key);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [typeKey, dialog]);

  function start() {
    setGame(newTermo(game.stats, game.answer));
    setNotice(''); setDialog(null);
    (document.activeElement as HTMLElement | null)?.blur();
  }
  function requestNew() { if (status === 'playing' && (game.guesses.length || game.current)) setDialog('new'); else start(); }

  return <div className="word-game-page">
    <GameHeader title="Termo" symbol="Aa" onHome={onHome} onHelp={() => setDialog('help')}/>
    <main className="play-main termo-main">
      <section className="play-heading"><div><div className="eyebrow">CINCO LETRAS. UM BOM DESAFIO.</div><h1>Qual é a palavra<span>?</span></h1><p>Seis tentativas. Cada letra traz uma pista.</p></div>
        <button className="new-button" onClick={() => status === 'playing' && (game.guesses.length || game.current) ? setDialog('new') : start()}><Plus size={17}/> Nova palavra</button>
      </section>
      <section ref={gameRef} className="termo-panel" aria-label="Jogo Termo">
        <GameViewControls title="Termo" isFullscreen={isFullscreen} onFullscreen={() => { setFullscreenError(''); void toggleFullscreen(); }} onHelp={() => setDialog('help')} onNew={requestNew} newLabel="Nova palavra" error={fullscreenError}/>
        <div className="termo-panel-top"><span><Keyboard size={15}/> PORTUGUÊS</span><span>{status === 'playing' ? Math.min(game.guesses.length + 1, 6) : game.guesses.length} / 6 TENTATIVAS</span></div>
        <div className="word-board" aria-label="Tentativas">
          {Array.from({ length: 6 }, (_, row) => {
            const word = game.guesses[row] ?? (row === game.guesses.length ? game.current : '');
            return <div className="word-row" key={row} aria-label={`Tentativa ${row + 1}${game.guesses[row] ? `: ${game.guesses[row]}` : ''}`}>
              {Array.from({ length: 5 }, (_, column) => <div key={column}
                className={`word-tile ${marks[row]?.[column] ?? ''} ${word[column] ? 'filled' : ''} ${row === game.guesses.length && column === game.current.length && status === 'playing' ? 'cursor' : ''}`}
                aria-label={word[column] ? `${word[column]}${marks[row] ? `: ${({ correct: 'posição correta', present: 'em outra posição', absent: 'não aparece' })[marks[row][column]]}` : ''}` : 'Vazia'}>
                {word[column] ?? ''}
              </div>)}
            </div>;
          })}
        </div>
        <div className="word-feedback" role="status" aria-live="polite">
          {notice || (status === 'won' ? 'Muito bem! Você encontrou a palavra.' : status === 'lost' ? `A palavra era ${game.answer}. A próxima pode ser sua!` : 'Digite uma palavra e pressione Enter.')}
        </div>
        {status !== 'playing' && <div className="word-result"><Trophy size={22}/><span>{status === 'won' ? `Acertou em ${game.guesses.length} tentativa${game.guesses.length === 1 ? '' : 's'}!` : `Resposta: ${game.answer}`}</span><button onClick={start}>Jogar outra<ArrowRight size={15}/></button></div>}
        <div className="word-keyboard" aria-label="Teclado do Termo">
          {keyboardRows.map((letters, index) => <div className="key-row" key={letters}>
            {index === 2 && <button className="word-key wide" onClick={() => typeKey('ENTER')} disabled={status !== 'playing'} aria-label="Confirmar palavra">ENTER</button>}
            {[...letters].map(letter => <button key={letter} className={`word-key ${keyMarks[letter] ?? ''}`} onClick={() => typeKey(letter)} disabled={status !== 'playing'} aria-label={`Letra ${letter}`}>{letter}</button>)}
            {index === 2 && <button className="word-key wide" onClick={() => typeKey('BACKSPACE')} disabled={status !== 'playing'} aria-label="Apagar letra"><Delete size={19}/></button>}
          </div>)}
        </div>
        <div className="word-legend"><span><i className="correct"/> Letra e lugar certos</span><span><i className="present"/> Em outro lugar</span><span><i className="absent"/> Não aparece</span></div>
      </section>
      <div className="word-stats"><div><strong>{game.stats.played}</strong><span>PARTIDAS</span></div><div><strong>{game.stats.wins}</strong><span>VITÓRIAS</span></div><div><strong>{game.stats.streak}</strong><span>SEQUÊNCIA ATUAL</span></div><div><strong>{game.stats.best}</strong><span>MELHOR SEQUÊNCIA</span></div></div>
      <p className="play-save-note"><Check size={13}/>{saveError ? 'Não foi possível salvar neste dispositivo.' : 'Sua palavra e suas estatísticas ficam salvas automaticamente.'}</p>
    </main>
    {dialog && <Modal titleId="termo-dialog-title" onClose={() => setDialog(null)}>
      <div className="modal-symbol">Aa</div><h2 id="termo-dialog-title">{dialog === 'help' ? 'Cada letra é uma pista.' : 'Uma nova palavra?'}</h2>
      {dialog === 'help' ? <><p>Descubra uma palavra de cinco letras em até seis tentativas. Use o teclado do computador ou as teclas da tela.</p><div className="termo-help"><p><b className="correct">A</b> Verde: letra no lugar certo.</p><p><b className="present">A</b> Dourado: letra existe em outra posição.</p><p><b className="absent">A</b> Cinza: letra não aparece, ou você já usou todas as ocorrências dela.</p></div><p>Acentos e cedilha são aceitos sem os sinais. Letras podem se repetir. Você pode jogar quantas partidas quiser.</p><button className="primary" onClick={() => setDialog(null)}>Vamos jogar<ArrowRight size={16}/></button></>
        : <><p>A tentativa atual será substituída. Suas estatísticas serão mantidas.</p><div className="modal-actions"><button className="secondary" onClick={() => setDialog(null)}>Continuar esta</button><button className="primary" onClick={start}>Nova palavra<ArrowRight size={16}/></button></div></>}
    </Modal>}
  </div>;
}
