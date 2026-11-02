# Lelê Jogos

Aplicativo de jogos offline para Windows. A entrega fica em **release/LeleJogos.exe**: copie apenas esse arquivo e abra com dois cliques. Ele abre em uma janela própria usando o Edge instalado no Windows.

- Biblioteca com busca, categorias e favoritos.
- Design orientado pelas HIG: Liquid Glass na navegação e nos controles, conteúdo legível com fonte do sistema, hierarquia tipográfica e controles principais de pelo menos 44 px. Temas claro e escuro, foco de teclado visível e respeito a movimento, transparência reduzida e contraste aumentado.
- Paciência: um clique move a carta ou sequência automaticamente; o jogo abre com compra de uma carta. Dicas, desfazer, reiniciar, pausa, som e salvamento automático continuam disponíveis. A compra de três permanece como opção nas configurações.
- Tela cheia do Paciência ocupa a tela com a mesa, amplia as cartas e esconde navbar, apresentação e rodapé da página. Controles e diálogos continuam acessíveis; saia pelo botão ou pela tecla Esc.
- Pife: nove cartas iniciais e dois baralhos sem curingas, contra um adversário local. Aceita trincas ampliadas, sequências de três ou mais cartas e batidas com nove ou dez cartas após a compra. Não há limite artificial de jogadas. Rodadas e placar funcionam offline.
- Termo: palavra de cinco letras em seis tentativas, 18.564 palpites aceitos e 463 respostas selecionadas. Vocabulário ampliado com dictionary-pt/VERO, nspell e fserb/pt-br. Teclado físico e virtual, cores para letras repetidas e estatísticas. Partidas ilimitadas, sem conexão.
- Pife e Termo também têm tela cheia só do jogo, com nova partida, tema, ajuda e saída disponíveis na barra interna. A partida é preservada ao entrar e sair; Esc também sai da tela cheia.

As partidas e preferências dos três jogos ficam salvas automaticamente e separadamente em `%LOCALAPPDATA%/PacienciaLeve`, na mesma pasta da versão anterior. Ao abrir o Paciência, partidas antigas com compra de três passam para compra de uma, conservando cartas, histórico e tempo.

**Assinatura pendente:** este executável ainda não tem assinatura digital. O bloqueio de integridade observado neste Windows não foi resolvido; uma compilação menor não substitui uma assinatura confiável.

Para trabalhar no código:

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run check
npm.cmd run package
```

Para contar o vocabulário: `npm.cmd run vocabulary:stats`. Para regenerar a lista externa com as bases locais: `npm.cmd run vocabulary:generate`. Os créditos, revisões e licenças estão em [vendor/README.md](vendor/README.md). A geração usa mais recursos que o jogo; o executável incorpora somente a lista filtrada e os avisos de licença.

A estrutura, os testes, a compatibilidade dos dados e a assinatura estão documentados em [docs/DESENVOLVIMENTO.md](docs/DESENVOLVIMENTO.md).
As escolhas de design e suas referências oficiais estão em [docs/DESIGN.md](docs/DESIGN.md).
