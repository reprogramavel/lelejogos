# Desenvolvimento

## Estrutura

```text
src/
  app/                       Navegação e composição do aplicativo
  features/
    library/                 Catálogo, favoritos, busca e página inicial
    solitaire/               Paciência: regras, sessão, hook e componentes
    pife/                    Pife: combinações, adversário e tela da partida
    termo/                   Termo: vocabulário, pistas, estatísticas e teclado
  shared/                    Modal, armazenamento, formatação e estilos comuns
desktop/                     Inicialização Windows e manifesto do executável
scripts/                     Compilação e empacotamento
vendor/                      Bibliotecas e bases licenciadas para preparar o vocabulário offline
tests/
  unit/                      Regras e compatibilidade do salvamento
  ui/                        Interações da biblioteca e do Paciência
  desktop/                   Conteúdo e integridade do pacote final
dist/                        Interface gerada para teste e empacotamento
release/                     Somente LeleJogos.exe
.cache/                      Perfil de testes, capturas e arquivos antigos
```

`src/main.tsx` inicializa o React. O catálogo apresenta os três jogos disponíveis. As rotas são `#biblioteca`, `#paciencia`, `#pife` e `#termo`. As regras não dependem de React; componentes cuidam da apresentação e hooks controlam persistência e interação.

O `ThemeProvider` centraliza os temas claro e escuro em `data-theme` no elemento raiz. A chave `lele.theme.v1` guarda a preferência; o tema claro é o padrão e a inicialização aplica a escolha salva antes de renderizar. As cores semânticas estão em `src/shared/styles/theme.css`; a navbar flutuante compartilhada está em `navbar.css`. O blur usa `backdrop-filter`, mantendo o conteúdo nítido, com superfícies legíveis mesmo sem suporte ao efeito. Cabeçalhos não usam traços decorativos antes dos textos.

O material Liquid Glass é centralizado em `src/shared/styles/liquid-glass.css`, com cores, transparências, bordas de luz e sombras compartilhadas entre biblioteca, mesas, teclado, controles e diálogos. `LiquidBackdrop` desenha o fundo decorativo sem capturar cliques e controla o reflexo do painel sob o mouse, limitado a um `requestAnimationFrame` pendente; não há animação contínua em repouso. O reflexo fica estático em toque e com movimento reduzido. A preferência por transparência reduzida e a ausência de `backdrop-filter` usam superfícies opacas. Cartas e cores das pistas mantêm contraste próprio, e teclas não criam camadas individuais de blur.

A adaptação às HIG em `src/shared/styles/hig.css` refina esses estilos: vidro e reflexos ficam na navegação/controles, enquanto o conteúdo usa materiais estáveis. O reflexo acompanha apenas navbar e diálogos. A escala de texto, os alvos de interação e as referências estão documentados em [DESIGN.md](DESIGN.md).

A tela cheia usa `requestFullscreen` na seção `.game-shell`, com o estado sincronizado por `fullscreenchange`. O CSS do Paciência adapta cartas e mesa à área disponível; pilhas longas rolam dentro da mesa e os controles continuam fixos no limite inferior. A navbar e a apresentação da página ficam ocultas. `Modal` cria seu portal dentro do elemento em tela cheia e desativa apenas os elementos irmãos do diálogo, mantendo-o acessível. Vitória, nova partida, ajuda, configurações e avisos continuam funcionando sem sair do modo.

## Comandos

Requisitos de desenvolvimento: Node.js 24 ou superior; Windows com o compilador .NET Framework para gerar o executável. O navegador Edge é necessário para executar o app e os testes de interface.

```powershell
npm.cmd ci
npm.cmd run dev       # Interface local em http://127.0.0.1:5173
npm.cmd run check     # TypeScript, regras, salvamento e testes da interface
npm.cmd run package   # Gera e verifica release/LeleJogos.exe
```

Os arquivos `dist/` são internos. Nenhum HTML, CMD ou DLL precisa acompanhar o executável. A versão de desenvolvimento é uma ferramenta para editar o projeto; a entrega é o app Windows.

## Empacotamento e otimizações

O esbuild gera JavaScript e CSS minificados, com apenas os ícones usados. A interface completa é compactada em gzip e incorporada ao executável C#. O empacotamento confere se o conteúdo embutido é idêntico à interface testada e se `release/` contém somente um executável.

O inicializador abre a interface em uma janela de aplicativo do Edge, sem abas ou barra de endereço. Ele usa o Edge existente no Windows; não incorpora outra cópia do Chromium. Na primeira abertura, prepara os arquivos internos em AppData. Nas aberturas seguintes, só substitui a interface quando o conteúdo mudou, usando escrita atômica.

As jogadas preservam os estados anteriores e copiam apenas as pilhas afetadas. O histórico conserva até 100 jogadas. A mesa é memorizada para não renderizar novamente a cada segundo do cronômetro. A serialização de cartas e histórico só é refeita quando seus estados mudam.

## Dados e compatibilidade

Mantenha `%LOCALAPPDATA%/PacienciaLeve`, o arquivo interno `index.html` e a subpasta `perfil`: esses caminhos preservam a origem e os dados do app anterior. As chaves continuam `paciencia.v1`, `paciencia.sound` e `lele.favorites.v1`; o formato de salvamento permanece na versão 1. Não houve migração destrutiva nem remoção de dados do jogador.

Pife usa `lele.pife.v1` e Termo usa `lele.termo.v1`, ambos com envelope `{ version: 1, game }`. Os dados são validados antes de restaurar. O Paciência abre com compra de uma carta, inclusive para partidas antigas com compra de três, sem redistribuir cartas; a opção de três ainda pode ser escolhida na sessão atual.

## Regras dos novos jogos

Pife é uma partida local contra um adversário do app, com 104 cartas físicas identificadas individualmente, sem curingas e nove cartas iniciais por jogador. As combinações são disjuntas: sequências de pelo menos três cartas do mesmo naipe e mesmo valor em pelo menos três naipes para trincas, permitindo cartas adicionais do mesmo valor. O ás aceita o início ou o final da sequência, nunca K–A–2. A organização busca a maior quantidade de cartas cobertas, sem reutilizar cartas. A compra é obrigatória antes de bater, mesmo com uma mão inicial completa. Após descartar, nove cartas combinadas encerram a rodada; dez cartas combinadas podem bater sem descarte pelo botão dedicado. O adversário também aceita as duas batidas e considera apenas sua mão e o descarte visível, sem consultar cartas futuras. O monte é reciclado preservando o topo do descarte, e não há empate automático por quantidade de jogadas. Salvamentos antigos continuam aceitos; vitórias novas com dez cartas e partidas com mais de 200 jogadas também são restauradas.

Termo aceita 18.564 palavras normalizadas e mantém 463 respostas selecionadas. O vocabulário anterior de 3.213 palavras é preservado em `words.ts` e `vocabulary-extra.ts`. A lista `external-words.ts` adiciona os dados de dictionary-pt/VERO expandidos com nspell e o léxico/conjugações de fserb/pt-br. Apenas entradas de cinco letras são incorporadas, sem duplicatas após a normalização de acentos e cedilha; nomes grafados com maiúsculas, números e hífens são filtrados na importação. A filtragem não garante cobertura ou classificação perfeita de todas as palavras do português.

Execute `npm.cmd run vocabulary:generate` para reproduzir a lista a partir das cópias locais em `vendor/`, com revisões fixadas. A expansão roda em lotes para limitar o uso de memória. O relatório `external-words.stats.json` registra hashes das fontes e contagens; `npm.cmd run vocabulary:stats` conta diretamente o conjunto usado pelo jogo. As bibliotecas nspell/is-buffer e o dicionário completo são dependências apenas de desenvolvimento e não entram no JavaScript do app. Os avisos e a licença MPL-2.0 dos dados são incorporados ao HTML empacotado. Veja [vendor/README.md](../vendor/README.md) para fontes, alterações e licenças.

O jogo não depende de serviços externos. Normaliza acentos e cedilha, aceita seis palpites válidos e avalia as letras em duas passagens para respeitar ocorrências repetidas. Palavras inválidas ou repetidas não gastam tentativas. Estatísticas são atualizadas no término da partida, sem contagem duplicada ao reabrir. As respostas anteriores e os palpites já aceitos permanecem válidos para restaurar partidas.

As dicas da Paciência procuram primeiro movimentos do descarte e das colunas. Quando não encontram nenhum, também verificam devoluções das fundações às colunas, evitando informar ausência de movimentos nesses casos. As dicas são sugestões legais, não um solucionador que garante vitória.

Arquivos das antigas entregas HTML/CMD e do empacotamento anterior foram arquivados em `.cache/legacy`, fora da entrega. Dados que tenham sido salvos manualmente no navegador pela antiga versão HTML pertencem ao perfil daquele navegador; não são importados automaticamente para o app.

## Assinatura do Windows

O executável gerado neste ambiente não está assinado digitalmente. O bloqueio de integridade já observado neste computador pode persistir; reduzir o tamanho, alterar a extensão ou recompilar não resolve a falta de uma assinatura confiável. O projeto não altera as configurações de segurança do Windows.

Quando houver um certificado de assinatura de código válido e confiável, com a chave privada no repositório de certificados do usuário, o empacotamento aceita:

```powershell
npm.cmd run build
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/package.ps1 -CertificateThumbprint "IMPRESSAO_DIGITAL_DO_CERTIFICADO"
```

O parâmetro de política acima vale somente para o processo de compilação do script local, não altera a configuração permanente do Windows e não libera o executável no controle de aplicativos. O script verifica o resultado da assinatura. Não cria certificados nem instala raízes de confiança.

Referência: [Microsoft — Smart App Control](https://support.microsoft.com/en-us/windows/security/threat-malware-protection/smart-app-control-frequently-asked-questions).
