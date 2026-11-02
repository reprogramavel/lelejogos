import type { CSSProperties, DragEvent } from 'react';
import { label, red, suit, suits } from '../game';
import type { Source } from '../game';
type Props = {
  id: number;
  source: Source;
  style?: CSSProperties;
  disabled?: boolean;
  selected: boolean;
  suggested: boolean;
  paused: boolean;
  onSelect: (source: Source) => void;
  onDragStart: (event: DragEvent, source: Source) => void;
  onDragEnd: () => void;
};
export function PlayingCard({ id, source, style, disabled, selected, suggested, paused, onSelect, onDragStart, onDragEnd }: Props) {
  const value = label(id);
  const symbol = suits[suit(id)];
  const royal = ['J', 'Q', 'K'].includes(value);
  return (<button className={`card face ${red(id) ? 'red' : 'black'} ${selected ? 'selected' : ''} ${suggested ? 'suggested' : ''}`} style={style} disabled={disabled} aria-label={`${value} de ${['espadas', 'copas', 'paus', 'ouros'][suit(id)]}`} aria-pressed={selected} draggable={!disabled && !paused} onClick={event => {
    event.stopPropagation();
    onSelect(source);
  }} onDragStart={event => onDragStart(event, source)} onDragEnd={onDragEnd}>
    <span className="corner">
      <b>
        {value}
      </b>
      <span>
        {symbol}
      </span>
    </span>
    <span className={`pip ${royal ? 'royal' : ''}`}>
      {royal ? <>
        <span>
          {value}
        </span>
        <small>
          {symbol}
        </small>
      </> : symbol}
    </span>
    <span className="corner bottom">
      <b>
        {value}
      </b>
      <span>
        {symbol}
      </span>
    </span>
  </button>);
}
