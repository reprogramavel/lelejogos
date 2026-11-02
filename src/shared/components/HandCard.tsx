import { label, red, suit, suits } from '../lib/cards';

export function HandCard({ id, selected = false, grouped = false, onClick, disabled = false }: {
  id: number; selected?: boolean; grouped?: boolean; disabled?: boolean; onClick?: () => void;
}) {
  const name = label(id), symbol = suits[suit(id)];
  return <button className={`hand-card ${red(id) ? 'is-red' : ''} ${selected ? 'is-selected' : ''} ${grouped ? 'is-grouped' : ''}`}
    data-card={id} aria-label={`${name} de ${['espadas', 'copas', 'paus', 'ouros'][suit(id)]}`}
    aria-pressed={selected} onClick={onClick} disabled={disabled}>
    <span className="hand-corner">{name}<small>{symbol}</small></span>
    <span className="hand-pip">{symbol}</span>
    <span className="hand-corner reverse">{name}<small>{symbol}</small></span>
  </button>;
}
