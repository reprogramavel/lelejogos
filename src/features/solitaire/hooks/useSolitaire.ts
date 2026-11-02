import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { automaticTarget, draw, hint, move, newGame, sourceCards, won } from '../game';
import type { Game, Source, Target } from '../game';
import { HISTORY_LIMIT, loadSession } from '../session';
import type { Session } from '../session';
import { readStorage, STORAGE_KEYS, writeStorage } from '../../../shared/lib/storage';
export const sameSource = (a: Source | null, b: Source) => a?.kind === b.kind &&
  (a.kind === 'waste' || ('pile' in b && a.pile === b.pile &&
    (a.kind !== 'tableau' || (b.kind === 'tableau' && a.index === b.index))));
export function useSolitaire(paused: boolean, dialogOpen: boolean) {
  const [session, setSession] = useState<Session>(() => {
    const saved = loadSession();
    return {
      ...saved,
      game: { ...saved.game, drawCount: 1 },
      history: saved.history.map(previous => ({ ...previous, drawCount: 1 })),
    };
  });
  const { game, history, seconds } = session;
  const [selected, setSelected] = useState<Source | null>(null);
  const [suggestion, setSuggestion] = useState<ReturnType<typeof hint>>(null);
  const [notice, setNotice] = useState('');
  const [sound, setSound] = useState(() => readStorage(STORAGE_KEYS.sound) === true);
  const [storageError, setStorageError] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const victory = won(game);
  // The clock changes every second; serialize the much larger game/history only on moves.
  const savedGame = useMemo(() => JSON.stringify(game), [game]);
  const savedHistory = useMemo(() => JSON.stringify(history), [history]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.solitaire, `{"version":1,"game":${savedGame},"history":${savedHistory},"seconds":${seconds}}`);
      setStorageError(false);
    }
    catch {
      setStorageError(true);
    }
  }, [savedGame, savedHistory, seconds]);
  useEffect(() => {
    if (paused || dialogOpen || victory || game.moves === 0)
      return;
    const timer = window.setInterval(() => {
      setSession(current => ({ ...current, seconds: current.seconds + 1 }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [paused, dialogOpen, victory, game.moves]);
  useEffect(() => {
    writeStorage(STORAGE_KEYS.sound, sound);
  }, [sound]);
  useEffect(() => {
    if (!notice)
      return;
    const timer = window.setTimeout(() => setNotice(''), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!suggestion)
      return;
    const timer = window.setTimeout(() => setSuggestion(null), 5000);
    return () => window.clearTimeout(timer);
  }, [suggestion]);
  useEffect(() => () => {
    void audio.current?.close().catch(() => { });
  }, []);
  const tone = useCallback(() => {
    if (!sound)
      return;
    try {
      const context = audio.current ??= new AudioContext();
      void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.frequency.value = 530;
      gain.gain.setValueAtTime(0.035, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.09);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
    }
    catch { /* Sound is optional. */ }
  }, [sound]);
  const commit = useCallback((next: Game | null) => {
    if (!next || paused || victory)
      return false;
    setSession(current => ({
      ...current,
      game: next,
      history: [...current.history, current.game].slice(-HISTORY_LIMIT),
    }));
    setSelected(null);
    setSuggestion(null);
    tone();
    return true;
  }, [paused, victory, tone]);
  const onMove = useCallback((source: Source, target: Target) => commit(move(game, source, target)), [game, commit]);
  const onSelect = useCallback((source: Source) => {
    if (paused || victory)
      return;
    if (selected && source.kind !== 'waste' &&
      onMove(selected, { kind: source.kind, pile: source.pile }))
      return;
    const target = automaticTarget(game, source);
    if (target && onMove(source, target)) return;
    if (sourceCards(game, source).length) {
      setSelected(sameSource(selected, source) ? null : source);
    }
  }, [paused, victory, selected, game, onMove]);
  const onDraw = useCallback(() => {
    commit(draw(game));
  }, [game, commit]);
  const undo = useCallback(() => {
    if (paused || victory)
      return;
    setSession(current => current.history.length ? {
      ...current,
      game: current.history.at(-1)!,
      history: current.history.slice(0, -1),
    } : current);
    setSelected(null);
    setSuggestion(null);
  }, [paused, victory]);
  const showHint = useCallback(() => {
    const result = hint(game);
    setSuggestion(result);
    if (!result)
      setNotice(game.stock.length
        ? 'Compre cartas do monte para continuar.'
        : game.waste.length
          ? 'Clique no monte vazio para reciclar as cartas.'
          : 'Não há movimentos disponíveis. Tente desfazer ou iniciar outra partida.');
  }, [game]);
  const start = useCallback((drawCount: 1 | 3 = 1, restart = false) => {
    setSession({
      game: newGame(drawCount, restart ? game.initialDeck : undefined),
      history: [],
      seconds: 0,
    });
    setSelected(null);
    setSuggestion(null);
    setNotice('');
  }, [game.drawCount, game.initialDeck]);
  return {
    game, history, seconds, selected, setSelected, suggestion, notice, setNotice, sound, setSound,
    storageError, victory, onMove, onSelect, onDraw, undo, showHint, start,
  };
}
