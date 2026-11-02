import { memo, useRef } from 'react';
import type { CSSProperties, DragEvent } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { suits } from '../game';
import type { Game, Source, Target, hint } from '../game';
import { sameSource } from '../hooks/useSolitaire';
import { PlayingCard } from './PlayingCard';
type Props = {
  game: Game;
  selected: Source | null;
  suggestion: ReturnType<typeof hint>;
  stockHint: boolean;
  paused: boolean;
  victory: boolean;
  onResume: () => void;
  onMove: (source: Source, target: Target) => boolean;
  onSelect: (source: Source) => void;
  onDragSelect: (source: Source) => void;
  onDraw: () => void;
  onNotice: (notice: string) => void;
};
function CardBack() {
  return <div className="back-design">
    <span>♠</span>
  </div>;
}
export const SolitaireBoard = memo(function SolitaireBoard({ game, selected, suggestion, stockHint, paused, victory, onResume, onMove, onSelect, onDragSelect, onDraw, onNotice }: Props) {
  const drag = useRef<Source | null>(null);
  function drop(event: DragEvent, target: Target) {
    event.preventDefault();
    if (drag.current && !onMove(drag.current, target)) {
      onNotice('Essa carta não pode ser movida para cá.');
    }
    drag.current = null;
  }
  function card(id: number, source: Source, style?: CSSProperties, disabled = false) {
    return <PlayingCard key={id} id={id} source={source} style={style} disabled={disabled} selected={sameSource(selected, source)} suggested={!!suggestion && sameSource(suggestion.source, source)} paused={paused} onSelect={onSelect} onDragStart={(event, origin) => {
      drag.current = origin;
      onDragSelect(origin);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify(origin));
    }} onDragEnd={() => {
      drag.current = null;
    }} />;
  }
  return (<div className="table-area">
    <div className={`table ${paused ? 'is-paused' : ''}`} inert={paused || victory}>
      <div className="top-piles">
        <div className={`stock-wrap ${stockHint ? 'suggested' : ''}`}>
          <button className={`card ${game.stock.length ? 'back' : 'slot recycle'}`} onClick={onDraw} disabled={paused || victory} aria-label={game.stock.length ? `Comprar ${game.drawCount} carta${game.drawCount === 3 ? 's' : ''}` : 'Reciclar monte'}>
            {game.stock.length ? <CardBack /> : <RotateCcw size={29} />}
          </button>
          <span className="pile-label">
            {game.stock.length ? `${game.stock.length} CARTAS` : 'RECICLAR'}
          </span>
        </div>
        <div className="waste-wrap">
          <div className="card slot empty-waste" />
          {game.waste.slice(-game.drawCount).map((id, i, visible) => card(id, { kind: 'waste' }, { left: `${i * 17}%`, zIndex: i }, i !== visible.length - 1))}
          <span className="pile-label">DESCARTE</span>
        </div>
        <div className="pile-spacer" />
        {game.foundations.map((pile, index) => (<div key={index} className={`foundation ${suggestion?.target.kind === 'foundation' && suggestion.target.pile === index ? 'target-hint' : ''}`} onDragOver={event => event.preventDefault()} onDrop={event => drop(event, { kind: 'foundation', pile: index })}>
          <button className="card slot" aria-label={`Fundação ${index + 1}`} onClick={() => {
            if (selected)
              onMove(selected, { kind: 'foundation', pile: index });
          }}>
            <span className="foundation-suit">
              {suits[index]}
            </span>
          </button>
          {pile.length > 0 && card(pile.at(-1)!, { kind: 'foundation', pile: index })}
          <span className="pile-label">
            {pile.length ? `${pile.length} / 13` : 'ÁS AO REI'}
          </span>
        </div>))}
      </div>
      <div className="tableau">
        {game.tableau.map((pile, index) => {
          let offset = 0;
          return (<div key={index} className={`column ${suggestion?.target.kind === 'tableau' && suggestion.target.pile === index ? 'target-hint' : ''}`} style={{ minHeight: `calc(var(--card-height) + ${pile.reduce((height, card) => height + (card.faceUp ? 29 : 21), 0)}px)` }} onDragOver={event => event.preventDefault()} onDrop={event => drop(event, { kind: 'tableau', pile: index })} onClick={() => {
            if (selected)
              onMove(selected, { kind: 'tableau', pile: index });
          }}>
            <button className="card slot column-slot" aria-label={`Coluna ${index + 1}, espaço para rei`} onClick={event => {
              event.stopPropagation();
              if (selected)
                onMove(selected, { kind: 'tableau', pile: index });
            }}>
              <span>K</span>
            </button>
            {pile.map((entry, row) => {
              const top = offset;
              offset += entry.faceUp ? 29 : 21;
              return entry.faceUp
                ? card(entry.id, { kind: 'tableau', pile: index, index: row }, { top, zIndex: row + 1 })
                : <div key={entry.id} className="card back covered" style={{ top, zIndex: row + 1 }}>
                  <CardBack />
                </div>;
            })}
          </div>);
        })}
      </div>
      <div className="table-watermark" aria-hidden="true">♠<span>PACIÊNCIA</span></div>
    </div>
    {paused && <div className="pause-overlay">
      <Pause size={36} />
      <h2>Uma pequena pausa.</h2>
      <p>Suas cartas esperam por você.</p>
      <button className="primary" onClick={onResume}><Play size={16} /> Continuar partida</button>
    </div>}
  </div>);
});
