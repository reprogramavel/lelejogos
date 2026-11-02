import { ArrowRight, Check, Clock3, Flag, Settings2, Shuffle, Trophy } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
export type SolitaireDialogKind = 'new' | 'restart' | 'settings' | 'help' | null;
type Props = {
  kind: SolitaireDialogKind;
  victory: boolean;
  time: string;
  moves: number;
  drawCount: 1 | 3;
  pendingDraw: 1 | 3 | null;
  onClose: () => void;
  onDrawMode: (count: 1 | 3) => void;
  onStart: (count?: 1 | 3, restart?: boolean) => void;
};
export function SolitaireDialog({ kind, victory, time, moves, drawCount, pendingDraw, onClose, onDrawMode, onStart }: Props) {
  if (!kind && !victory)
    return null;
  return (<Modal titleId="modal-title" onClose={victory ? undefined : onClose}>
    {victory ? <>
      <div className="win-icon">
        <Trophy size={40} />
      </div>
      <div className="eyebrow">AS 52 CARTAS NO LUGAR</div>
      <h2 id="modal-title">Você conseguiu!</h2>
      <p>Um pouco de estratégia. Uma boa dose de paciência.</p>
      <div className="win-stats">
        <span>
          <Clock3 size={17} />
          {time}
        </span>
        <span><Flag size={17} />{moves} movimentos</span>
      </div>
      <button className="primary" onClick={() => onStart()}><Shuffle size={17} /> Jogar outra vez</button>
      <div className="confetti" aria-hidden="true">✦ · ✧ · ✦ · ✧</div>
    </> : kind === 'help' ? <>
      <div className="modal-symbol">♠</div>
      <h2 id="modal-title">Uma carta de cada vez.</h2>
      <p>Leve todas as cartas às quatro fundações, do ás ao rei, separadas por naipe.</p>
      <div className="help-steps">
        <p><b>01</b> Nas colunas, alterne cartas vermelhas e pretas em ordem decrescente.</p>
        <p><b>02</b> Clique uma vez na carta para movê-la automaticamente. O jogo prioriza as fundações e depois uma coluna válida. Você também pode arrastar cartas ou sequências.</p>
        <p><b>03</b> Clique no monte para comprar cartas. Quando acabar, clique novamente para reciclar.</p>
        <p><b>04</b> Se não houver destino automático, a carta fica selecionada para você escolher onde colocar. Só reis ocupam colunas vazias. Use dicas e desfaça quando precisar.</p>
      </div>
      <button className="primary" onClick={onClose}>Vamos jogar <ArrowRight size={16} /></button>
    </> : kind === 'settings' ? <>
      <Settings2 className="modal-icon" size={30} />
      <h2 id="modal-title">Do seu jeito.</h2>
      <p>Escolha quantas cartas comprar por vez. Alterar a modalidade inicia uma nova partida.</p>
      <div className="mode-options">
        {([1, 3] as const).map(count => <button className={drawCount === count ? 'active' : ''} key={count} onClick={() => {
          if (drawCount !== count)
            onDrawMode(count);
        }}>
          <span>
            <b>
              {count === 1 ? 'Uma carta' : 'Três cartas'}
            </b>
            <small>
              {count === 1 ? 'Um ritmo mais tranquilo' : 'Um desafio a mais'}
            </small>
          </span>
          {drawCount === count && <Check size={20} />}
        </button>)}
      </div>
      <button className="secondary" onClick={onClose}>Voltar ao jogo</button>
    </> : <>
      <div className="modal-symbol">
        {kind === 'restart' ? '↻' : '♠'}
      </div>
      <h2 id="modal-title">
        {kind === 'restart' ? 'Mais uma chance?' : 'Um novo começo.'}
      </h2>
      <p>
        {kind === 'restart'
          ? 'Você vai recomeçar com a mesma distribuição de cartas. O progresso desta partida será substituído.'
          : `Vamos embaralhar as cartas${pendingDraw ? ` e comprar ${pendingDraw} por vez` : ''}. O progresso da partida atual será substituído.`}
      </p>
      <div className="modal-actions">
        <button className="secondary" onClick={onClose}>Continuar jogando</button>
        <button className="primary" onClick={() => onStart(pendingDraw ?? drawCount, kind === 'restart')}>
          {kind === 'restart' ? 'Reiniciar' : 'Nova partida'}
          <ArrowRight size={16} />
        </button>
      </div>
    </>}
  </Modal>);
}
