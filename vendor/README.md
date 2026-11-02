# Fontes do vocabulário e bibliotecas de preparação

Estas cópias locais tornam a geração reproduzível e dispensam downloads durante a compilação. Apenas o vocabulário filtrado entra no aplicativo; o corretor e os dicionários completos ficam nas ferramentas de desenvolvimento.

| Fonte | Versão/revisão | Licença |
| --- | --- | --- |
| [dictionary-pt / VERO](https://github.com/wooorm/dictionaries/tree/8cfea406b505e4d7df52d5a19bce525df98c54ab/dictionaries/pt) | 4.0.0, commit `8cfea406b505e4d7df52d5a19bce525df98c54ab` | Dados utilizados sob MPL-2.0; opção alternativa LGPL-3.0 preservada no aviso original |
| [fserb/pt-br](https://github.com/fserb/pt-br/tree/93ba2a6f3b2f85262fba72df09d448c6bb2fa50a) | commit `93ba2a6f3b2f85262fba72df09d448c6bb2fa50a` | MIT |
| [nspell](https://github.com/wooorm/nspell/tree/9f57ccdedb53f4e0b498db55474443dbbfc4bd8a) | 2.1.5 | MIT |
| [is-buffer](https://github.com/feross/is-buffer/tree/ec4bf3415108e8971375e6717ad63dde752faebf) | 2.0.5 | MIT |

O VERO é de Raimundo Santos Moura e colaboradores; `dictionary-pt` é empacotado por Titus Wormer e colaboradores. O léxico e as conjugações de `pt-br` são de Fernando Serboncini. Os avisos originais e textos de licença estão nas respectivas pastas. O `index.js` de `dictionary-pt` pertence ao código de integração do pacote, sob MIT; o dicionário e as regras têm a licença de dados indicada acima. Metadados de desenvolvimento dos pacotes locais foram reduzidos; o código das bibliotecas foi preservado. O arquivo `conjugações` da origem está nomeado `conjugacoes` nesta cópia.

## Geração e arquivos modificados

Execute `npm run vocabulary:generate` após instalar as dependências. `scripts/generate-vocabulary.mjs` expande `dictionary-pt` com `nspell`, aplica os indicadores de proibição do dicionário e mantém apenas entradas originalmente minúsculas com cinco letras portuguesas. Isso remove nomes próprios grafados com maiúscula, siglas, números, espaços e hífens dessas entradas. A filtragem não constitui uma garantia linguística sobre todas as entradas.

Em seguida, une o léxico e as conjugações de `fserb/pt-br`, normaliza acentos/cedilha e elimina duplicatas. Siglas técnicas selecionadas (`ASCII`, `HTTPS`) são excluídas dos palpites. O arquivo modificado/derivado é `src/features/termo/external-words.ts`; o relatório `external-words.stats.json` registra contagens e hashes SHA-256 das fontes. O código-fonte desse arquivo, as fontes originais e o script de transformação estão disponíveis neste projeto, juntamente com a licença MPL-2.0. A lista normalizada é texto simples, preservado como texto no código do aplicativo incorporado ao executável.

Os arquivos locais `words.ts` e `vocabulary-extra.ts` continuam fornecendo o vocabulário anterior para compatibilidade. A lista de respostas sorteadas permanece selecionada separadamente. Nenhum serviço externo é consultado durante o jogo.
