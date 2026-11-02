import { ArrowUpRight, ShieldCheck } from 'lucide-react';
export function LibraryHero({ resumable, onPlay }: {
  resumable: boolean;
  onPlay: () => void;
}) {
  return (<section className="library-hero">
    <div className="hero-copy">
      <div className="library-eyebrow">TEMPO LIVRE BEM APROVEITADO</div>
      <h1>Sua pausa começa <em>aqui.</em></h1>
      <p>Entre uma tarefa e outra, um bom jogo.<br />Escolha o seu favorito e fique à vontade.</p>
      <button className="hero-cta" onClick={onPlay}>
        {resumable ? 'Continuar Paciência' : 'Jogar Paciência'}
        <ArrowUpRight size={17} />
      </button>
      <div className="hero-caption"><ShieldCheck size={13} /> Sem anúncios. Sem pressa. Só diversão.</div>
    </div>
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art-circle" />
      <span className="hero-spark spark-one">✦</span>
      <span className="hero-spark spark-two">✧</span>
      <div className="hero-floating-card">
        <span>A<small>♠</small></span>
        <b>♠</b>
        <span>A<small>♠</small></span>
      </div>
      <div className="hero-floating-back">
        <div>♣</div>
      </div>
      <div className="hero-letter letter-l">L</div>
      <div className="hero-letter letter-e">Ê</div>
      <span className="hero-art-note">o seu momento de jogar</span>
    </div>
  </section>);
}
