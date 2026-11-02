// Additional vocabulary curated for this app. Guesses are broader than the answer pool.
const commonWords = `
abono abona abone acode adido adita adite adito afins afora alada alamo ambar amido anoes anual anuir aquem arcas arido arida aries atimo atola atole atolo axila azara azare azaro
baias bambu baque barco bases bates bebia berco bicam biela bigua bisao bodes boiar bolao botos brejo breus brins broas broca brios burra burro
cabia cacas cajus calca calce calco calda calos canja caqui cardo carga caroa caspa ceifa ceife ceifo celta cerda cerro cerva ciano ciosa cioso circo cisao cisme cismo ciume clave clero clube cliva clive clivo cofre coifa coiro colmo colos comer cones corar cores corja corno coros cosmo cotos coxas coxim crase creio crera cruel cubas cuica cujos cupro curia cutis
dardo dedal dedao dedos dengo deusa divas divos dolar donos dorna doses dreno drone dutos
edema edito egide eiras elfos elmos elude enema ereto ereta escoa escoe escoo esgar estai estao estio esvai etnia evoca exima exime eximi eximo expor
facao facho fados faixa falaz famas fauce faxes fende fendi fendo feral feraz fetos fiapo fiais ficas fidos fobia foles fossa frade frisa frise friso fruir funga fungo funil futil
gaita galao gamba gamas gamos ganso gansa garfo gazes gelos gemea gemeo gleba gorar gorra gumes gueto guizo gulas
harem hifas hifen hiato hindu horda hoste humus
icone ictus ignea igneo ileso ilesa imola imole imolo imune inata inato indio india inibe inibi inibo istmo
jazer jazes jazem jazia jegue jotas juiza juizo juras
labio lacre lagar lapso laser lauda lemas lenco lerda lerdo lesma leste lider limas limos liras lisas lisos lobao logar loira loiro lombo lonas lotes lutas
macas macia macio magia manda mande mando mania meada meado mecha meses mesma mesmo migra migre migro mimos miolo mirra mitra mogno mofos molas morsa mossa mucos mugem mugia mugir mugiu mumia munus
nariz nardo neons nervo ninar ninou nival nulas nulos
odres ofega ofego olmos omita omite omiti omito oncas opaca opaco orcas orfao orfas orgia ouvis oxala
pagao pagas pagos pajem palas pampa papar pareo parra patua pavao paves pedem pedes peias penar penha penou perca perco perto piada piava picas pifes pifia pifio pinca pince pinco pirao pirar pirou poias porem porre potra potro praxe prole priva prive privo prosa pudim pudor pugna pugne pugno purga purgo puser
quilo
racao ralos rapas rapto rapta rapte raspa raspe raspo regar regei regem reger regia regou relho retem rezas rijas rijos rimam rimas rirem riria roais rocas rodam rodes roias rojam rolam rombo rompa rompe rompi rompo ruais rufar rufei rufou rumor
samba sambe sambo sarau sarda sardo seara sedar sedei sedou selim senil sepia sexta sexto silvo sisal sodio socia socio soada soado sobem socam sonda sonde sondo sonsa sonso sopes sovam sovar sovei sovou suino suina sumos sutil
talas talco talha talhe talho talos tango tasca taxam tedio teias telha tenis tensa tenso terna terno torax tosar tosei tosou totem trena trevo tribo truco turva turve turvo
ufana ufano uivam uivar uivei uivou uivos umida umido urdem urdes urdia urdir urdiu urgem urgia urgir urgiu
vadia vadio vagem veado velas verao vetos vieis vigor virao virus vogas volva volve volvi volvo vulva
xelim xenon zanga zango zarpa zarpe zarpo zelos
`;

// Regular five-letter infinitives supply short forms missing from the base list.
// E forms preserve spelling changes: ficar → fiquem; caçar → cacei.
const regularAR = `achar adiar afiar aguar aliar arcar arfar armar assar atuar aviar babar botar caçar calar capar casar catar cavar cegar cevar citar colar corar cotar curar datar ditar domar dopar dosar dotar durar errar falar fitar fixar focar furar gabar gelar gerar girar gozar guiar ilhar jogar laçar lavar lesar lidar ligar limar lixar locar lotar lutar mamar manar matar mimar mirar morar mudar nadar negar notar ornar ousar optar parar pecar pegar penar picar pilar pisar podar posar pular puxar raiar ralar rapar remar rezar rimar rodar rogar rolar roçar rumar sacar sarar secar selar solar somar sovar sujar sugar taxar tirar tocar tomar topar tosar untar vagar vaiar varar vazar vedar velar vetar visar votar zelar`;
const regularER = `arder bater beber ceder comer coser cozer dever gemer mexer mover reger temer`;

export const extraWords = [
  ...commonWords.split(/\s+/),
  ...regularAR.split(/\s+/).flatMap(word => {
    const stem = word.slice(0, -2);
    const eStem = stem.replace(/c$/, 'qu').replace(/ç$/, 'c').replace(/g$/, 'gu');
    return [...['ar', 'as', 'am', 'ai', 'ou'].map(ending => stem + ending), ...['ei', 'em', 'es'].map(ending => eStem + ending)];
  }),
  ...regularER.split(/\s+/).flatMap(word => {
    const stem = word.slice(0, -2);
    return ['er', 'es', 'em', 'ei', 'eu', 'ia'].map(ending => stem + ending);
  }),
];
