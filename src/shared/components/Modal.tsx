import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
type Props = {
  titleId: string;
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
  children: ReactNode;
};
export function Modal({ titleId, onClose, closeLabel = 'Fechar', className = '', children }: Props) {
  const dialog = useRef<HTMLElement | null>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const portalHost = document.fullscreenElement ?? document.body;
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    // A fullscreen game is in the browser's top layer; its dialogs must live inside it.
    const background = Array.from(portalHost.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && !element.contains(dialog.current))
      .map(element => ({ element, inert: element.inert }));
    const previousOverflow = document.body.style.overflow;
    background.forEach(({ element }) => { element.inert = true; });
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => {
      background.forEach(({ element, inert }) => { element.inert = inert; });
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected)
        previousFocus.focus();
    };
  }, [portalHost]);
  return createPortal(<div className="modal-backdrop" onClick={() => close.current?.()}>
    <section ref={dialog} className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={event => event.stopPropagation()} onKeyDown={event => {
      if (event.key === 'Escape')
        close.current?.();
      if (event.key !== 'Tab')
        return;
      const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }}>
      {onClose && <button className="close-modal icon-button" onClick={onClose} aria-label={closeLabel}>
        <X size={20} />
      </button>}
      {children}
    </section>
  </div>, portalHost);
}
