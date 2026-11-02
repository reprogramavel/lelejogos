import { useCallback, useEffect, useRef, useState } from 'react';

export function useGameFullscreen(onError: (message: string) => void) {
  const gameRef = useRef<HTMLElement | null>(null);
  const pending = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const target = gameRef.current;
    const sync = () => setIsFullscreen(document.fullscreenElement === target);
    document.addEventListener('fullscreenchange', sync);
    sync();
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      if (target && document.fullscreenElement === target) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const target = gameRef.current;
    if (!target || pending.current) return;
    pending.current = true;
    try {
      if (document.fullscreenElement === target) {
        await document.exitFullscreen();
      } else {
        if (document.fullscreenElement) await document.exitFullscreen();
        await target.requestFullscreen({ navigationUI: 'hide' });
      }
    } catch {
      onError('Não foi possível alternar a tela cheia nesta janela.');
    } finally {
      pending.current = false;
    }
  }, [onError]);

  return { gameRef, isFullscreen, toggleFullscreen };
}
