import { ArrowRight, ChevronRight, Clock3, Heart, Sparkles, Spade } from 'lucide-react';
import type { GameDefinition } from '../catalog';
import { GameArt } from './GameArt';
type Props = {
  game: GameDefinition;
  favorite: boolean;
  resumable: boolean;
  onOpen: (game: GameDefinition, button: HTMLButtonElement) => void;
  onFavorite: () => void;
};
export function GameCard({ game, favorite, resumable, onOpen, onFavorite }: Props) {
  return (<article className={`library-game-card ${game.id}`} data-game={game.id}>
    <div className="game-cover">
      <button className="game-cover-button" onClick={event => onOpen(game, event.currentTarget)} aria-label={game.ready ? `Jogar ${game.name}` : `Conhecer ${game.name}`}>
        <GameArt id={game.id} />
      </button>
      <span className={`game-availability ${game.ready ? 'available' : ''}`}>
        {game.ready ? <><span /> PRONTO PARA JOGAR</> : <><Clock3 size={11} /> EM BREVE</>}
      </span>
      <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} aria-label={`${favorite ? 'Remover' : 'Adicionar'} ${game.name} ${favorite ? 'dos' : 'aos'} favoritos`} aria-pressed={favorite} onClick={onFavorite}>
        <Heart size={17} fill={favorite ? 'currentColor' : 'none'} />
      </button>
    </div>
    <div className="game-card-info">
      <div className="game-category">
        {game.category === 'cartas' ? <><Spade size={11} /> CARTAS</> : <><Sparkles size={11} /> PALAVRAS</>}
      </div>
      <h3>
        {game.name}
      </h3>
      <p>
        {game.description}
      </p>
      <div className="game-card-bottom">
        <span>
          {game.id === 'pife' ? 'Você × Lelê · Offline' : game.id === 'termo' ? '6 tentativas · Sem limite' : '1 jogador · No seu ritmo'}
        </span>
        <button onClick={event => onOpen(game, event.currentTarget)}>
          {game.ready ? resumable ? 'Continuar' : 'Jogar agora' : 'Conhecer'}
          {game.ready ? <ArrowRight size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>
    </div>
  </article>);
}
