export type GameId = 'paciencia' | 'pife' | 'termo';
export type Category = 'todos' | 'cartas' | 'palavras';
export type GameDefinition = {
  id: GameId;
  name: string;
  category: Exclude<Category, 'todos'>;
  description: string;
  subtitle: string;
  detail: string;
  ready: boolean;
};
export const games: readonly GameDefinition[] = [
  {
    id: 'paciencia',
    name: 'Paciência',
    category: 'cartas',
    subtitle: 'O clássico que nunca envelhece.',
    description: 'Organize as cartas, encontre seu ritmo e aproveite uma boa companhia: você.',
    detail: '',
    ready: true,
  },
  {
    id: 'pife',
    name: 'Pife',
    category: 'cartas',
    subtitle: 'Uma boa mão. Uma boa estratégia.',
    description: 'Trincas, sequências e aquela vontade de bater antes de todo mundo.',
    detail: 'Jogue contra Lelê: compre e combine todas as nove ou dez cartas em trincas e sequências.',
    ready: true,
  },
  {
    id: 'termo',
    name: 'Termo',
    category: 'palavras',
    subtitle: 'Cinco letras. Muitas possibilidades.',
    description: 'Descubra a palavra escondida e coloque suas melhores ideias em jogo.',
    detail: 'Descubra a palavra de cinco letras em até seis tentativas. Jogue quantas vezes quiser.',
    ready: true,
  },
];
