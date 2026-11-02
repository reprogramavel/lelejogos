import { useEffect, useState } from 'react';
import SolitairePage from '../features/solitaire/SolitairePage';
import LibraryPage from '../features/library/LibraryPage';
import PifePage from '../features/pife/PifePage';
import TermoPage from '../features/termo/TermoPage';
import type { GameId } from '../features/library/catalog';
function currentRoute() {
  const game = location.hash.slice(1);
  return ['paciencia', 'pife', 'termo'].includes(game) ? game as GameId : 'biblioteca';
}
export default function App() {
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const navigate = () => {
      setRoute(currentRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  useEffect(() => {
    document.title = route === 'biblioteca' ? 'Lelê Jogos · Seu cantinho de diversão'
      : `${({ paciencia: 'Paciência', pife: 'Pife', termo: 'Termo' })[route]} · Lelê Jogos`;
  }, [route]);
  const onHome = () => { location.hash = 'biblioteca'; };
  if (route === 'paciencia') return <SolitairePage onHome={onHome}/>;
  if (route === 'pife') return <PifePage onHome={onHome}/>;
  if (route === 'termo') return <TermoPage onHome={onHome}/>;
  return <LibraryPage onPlay={game => { location.hash = game; }}/>;
}
