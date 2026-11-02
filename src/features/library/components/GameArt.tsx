import type { GameId } from '../catalog';
function MiniCard({ value, suit, position }: {
  value: string;
  suit: string;
  position: string;
}) {
  return <div className={`mini-card ${position} ${['♥', '♦'].includes(suit) ? 'is-red' : ''}`}>
    <span className="mini-card-corner">
      {value}
      <small>
        {suit}
      </small>
    </span>
    <span className="mini-card-pip">
      {suit}
    </span>
    <span className="mini-card-corner reverse">
      {value}
      <small>
        {suit}
      </small>
    </span>
  </div>;
}
export function GameArt({ id }: {
  id: GameId;
}) {
  if (id === 'termo')
    return <div className="word-art" aria-hidden="true">
      <div className="word-art-row">
        {'TERMO'.split('').map((letter, i) => <span key={i} className={['tile-green', 'tile-gold', 'tile-muted', 'tile-green', 'tile-muted'][i]}>
          {letter}
        </span>)}
      </div>
      <div className="word-art-row word-art-empty">
        {Array.from({ length: 5 }, (_, i) => <span key={i} />)}
      </div>
      <div className="word-art-row word-art-empty last-row">
        {Array.from({ length: 5 }, (_, i) => <span key={i} />)}
      </div>
    </div>;
  return <div className={`cards-art ${id === 'pife' ? 'triple-art' : ''}`} aria-hidden="true">
    <span className="art-orbit" />
    <MiniCard value={id === 'pife' ? '7' : 'K'} suit="♠" position="card-left" />
    <MiniCard value={id === 'pife' ? '7' : 'Q'} suit="♥" position="card-center" />
    <MiniCard value={id === 'pife' ? '7' : 'A'} suit="♣" position="card-right" />
    {id === 'pife' && <span className="art-trinca">TRINCA!</span>}
  </div>;
}
