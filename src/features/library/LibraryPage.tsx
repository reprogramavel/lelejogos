import { useEffect, useState } from 'react';
import { ArrowRight, Check, Gamepad2, Heart, Layers3, LayoutGrid, Search, Sparkles, Spade, X } from 'lucide-react';
import { games } from './catalog';
import type { GameId, Category, GameDefinition } from './catalog';
import { readFavorites } from './favorites';
import { resumableProgress } from '../solitaire/session';
import { GameCard } from './components/GameCard';
import { LibraryHero } from './components/LibraryHero';
import { normalizeSearch, formatTime } from '../../shared/lib/format';
import { STORAGE_KEYS, writeStorage } from '../../shared/lib/storage';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
export default function LibraryPage({ onPlay }: {
  onPlay: (game: GameId) => void;
}) {
  const [favorites, setFavorites] = useState<GameId[]>(readFavorites);
  const [view, setView] = useState<'all' | 'favorites'>('all');
  const [category, setCategory] = useState<Category>('todos');
  const [search, setSearch] = useState('');
  const [saveWarning, setSaveWarning] = useState(false);
  const [progress] = useState(resumableProgress);
  useEffect(() => {
    setSaveWarning(!writeStorage(STORAGE_KEYS.favorites, favorites));
  }, [favorites]);
  const visible = games.filter(game => (view === 'all' || favorites.includes(game.id)) && (category === 'todos' || game.category === category) && normalizeSearch(`${game.name} ${game.description}`).includes(normalizeSearch(search.trim())));
  function openGame(game: GameDefinition) {
    onPlay(game.id);
  }
  function clearFilters() {
    setSearch('');
    setCategory('todos');
    setView('all');
  }
  return <div className="library-app">
    <div className="library-content">
      <header className="library-header floating-navbar">
        <a className="library-brand" href="#biblioteca" onClick={clearFilters}>
          <span className="library-brand-symbol">
            <Gamepad2 size={24} strokeWidth={1.6} />
          </span>
          <span>Lelê jogos<small>PEQUENAS PAUSAS, BONS MOMENTOS</small></span>
        </a>
        <nav className="library-nav" aria-label="Biblioteca">
          <button className={view === 'all' ? 'active' : ''} aria-pressed={view === 'all'} onClick={() => setView('all')}><LayoutGrid size={16} /> Todos os jogos</button>
          <button className={view === 'favorites' ? 'active' : ''} aria-pressed={view === 'favorites'} onClick={() => setView('favorites')}><Heart size={16} /> Favoritos{favorites.length > 0 && <span className="favorites-count">
            {favorites.length}
          </span>}</button>
        </nav>
        <div className="library-header-actions"><div className="library-offline"><span />Seu cantinho, offline</div><ThemeToggle/></div>
      </header>
      <main className="library-main">
        <LibraryHero resumable={!!progress} onPlay={() => onPlay('paciencia')} />
        {progress && <section className="resume-banner">
          <div className="resume-icon">
            <Spade size={20} />
          </div>
          <div>
            <strong>Sua partida está esperando.</strong>
            <span>Paciência · {progress.moves} movimentos · {formatTime(progress.seconds)}</span>
          </div>
          <button onClick={() => onPlay('paciencia')}>Continuar de onde parei<ArrowRight size={17} /></button>
        </section>}
        <section className="library-games" aria-labelledby="games-title">
          <div className="library-section-heading">
            <div>
              <div className="library-eyebrow">ESCOLHA SEU PRÓXIMO DESAFIO</div>
              <h2 id="games-title">
                {view === 'favorites' ? 'Os seus favoritos' : 'Um jogo para cada momento'}
                <span>.</span>
              </h2>
            </div>
            <label className="library-search">
              <Search size={17} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Encontrar um jogo" aria-label="Encontrar um jogo" />
              {search && <button onClick={() => setSearch('')} aria-label="Limpar busca">
                <X size={14} />
              </button>}
            </label>
          </div>
          <div className="library-filter-row">
            <div className="library-filters" role="group" aria-label="Categorias">
              {([{ id: 'todos', name: 'Todos', icon: LayoutGrid }, { id: 'cartas', name: 'Cartas', icon: Layers3 }, { id: 'palavras', name: 'Palavras', icon: Sparkles }] as const).map(item => <button key={item.id} className={category === item.id ? 'active' : ''} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>
                <item.icon size={14} />
                {item.name}
              </button>)}
            </div>
            <span className="library-game-count">
              {visible.length} {visible.length === 1 ? 'jogo na coleção' : 'jogos na coleção'}
            </span>
          </div>
          <div className="game-grid">
            {visible.map(game => <GameCard key={game.id} game={game} favorite={favorites.includes(game.id)} resumable={!!progress && game.id === 'paciencia'} onOpen={openGame} onFavorite={() => setFavorites(value => value.includes(game.id) ? value.filter(id => id !== game.id) : [...value, game.id])} />)}
          </div>
          {!visible.length && <div className="library-empty">
            <Search size={27} />
            <h3>
              {view === 'favorites' && !favorites.length ? 'Seus favoritos moram aqui.' : 'Nenhum jogo por aqui ainda.'}
            </h3>
            <p>
              {view === 'favorites' && !favorites.length ? 'Toque no coração de um jogo para guardá-lo neste cantinho.' : 'Experimente outra busca ou explore todos os jogos.'}
            </p>
            <button onClick={clearFilters}>Ver todos os jogos<ArrowRight size={15} /></button>
          </div>}
          {saveWarning && <p className="favorites-warning" role="status">Os favoritos funcionam nesta sessão, mas não foi possível salvá-los neste dispositivo.</p>}
        </section>
        <div className="collection-note">
          <span className="collection-note-icon">
            <Sparkles size={19} />
          </span>
          <div>
            <strong>Três jogos, muitos bons momentos.</strong>
            <p>Cartas ou palavras: escolha seu desafio e jogue no seu ritmo.</p>
          </div>
          <span className="note-decoration" aria-hidden="true">♠ <i>♥</i> A B C</span>
        </div>
        <footer className="library-footer">
          <span>Lelê jogos <i>·</i> Feito para jogar sem pressa.</span>
          <span><Check size={13} /> Seu progresso fica neste dispositivo</span>
          <span>BONS JOGOS, BONS MOMENTOS</span>
        </footer>
      </main>
    </div>
  </div>;
}
