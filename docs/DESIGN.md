# Design e Human Interface Guidelines

O projeto aplica princípios das Human Interface Guidelines ao aplicativo Windows e à interface web existente. A interface continua em React/CSS e usa a fonte do sistema Windows, Segoe UI. Não se trata de um aplicativo nativo de uma plataforma Apple nem de uma certificação de conformidade integral.

## Materiais e hierarquia

Liquid Glass destaca a navbar, a navegação e os controles. Catálogo, textos, mesas, tentativas e estatísticas usam superfícies estáveis, com contraste previsível e sem reflexos móveis sobre o conteúdo. O comportamento óptico acompanha somente a navbar e os diálogos. Isso segue a separação entre a camada funcional e a de conteúdo indicada pela Apple.

Os temas claro e escuro permanecem disponíveis. O contraste dos parágrafos do catálogo e da apresentação é verificado nos dois temas, com razão mínima de 4,5:1 nas superfícies testadas. Não há alegação de auditoria completa de acessibilidade do aplicativo.

## Texto e controles

A identidade usa verde profundo `#0F3D2E` e dourado `#C9A227`. No tema claro, fundos branco suave e ações verdes mantêm o contraste; o dourado exato fica nos detalhes, e textos dourados pequenos usam `#806315`. No escuro, superfícies verde-carvão e ações douradas com texto verde preservam a hierarquia. O contraste do texto da ação principal é verificado contra as duas extremidades de seu gradiente nos dois temas. Favoritos têm fundo próprio para manter o ícone legível sobre todas as capas.

A tipografia usa uma família de fontes, pesos regulares e semibold, corpo de 14–15 px e legendas de 11–13 px, com títulos proporcionais. Textos essenciais deixaram de usar os antigos tamanhos decorativos de 5–9 px.

Os controles principais — navegação, tema, favoritos, ações e botões de ícones — têm área mínima de 44 × 44 px. Esta é uma adaptação prática para CSS, não uma equivalência universal entre pixels CSS e pontos Apple. Teclas de letras em janelas estreitas mantêm largura responsiva semelhante à de um teclado virtual, com 48 px de altura; pilhas de cartas mantêm sua disposição específica de jogo e podem ser acionadas pelo teclado.

A navegação expõe seu estado selecionado. Os botões de voltar mantêm nome acessível mesmo quando o texto é ocultado em telas estreitas. Os controles têm indicação de foco visível, e o conteúdo evita rolagem horizontal nas janelas testadas.

## Manutenção

`src/shared/styles/hig.css` centraliza a escala, o contraste e a separação entre materiais. O arquivo é carregado após os estilos específicos dos jogos, incluindo a tela cheia. Não deve alterar as regras dos jogos, as chaves de salvamento ou a distribuição das cartas.

Movimento reduzido desativa o reflexo do mouse. Transparência reduzida oferece superfícies opacas. Contraste aumentado fortalece bordas e texto. As preferências do jogador e o tema não são apagados pelas atualizações visuais.

## Referências oficiais

- [HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [HIG — Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Apple — UI Design Dos and Don’ts](https://developer.apple.com/design/tips/)
