"use strict";
{
const $=s=>document.querySelector(s);
const app=$('#app');
const ST={venda:{t:'Venda – negócio fechado',g:'ok'},deg_ag:{t:'Degustação agendada',g:'warn'},deg_re:{t:'Degustação realizada',g:'warn'},negoc:{t:'Em negociação',g:'info'},nv_preco:{t:'Não venda – preço',g:'bad'},nv_abertura:{t:'Não venda – sem abertura',g:'bad'},nv_propria:{t:'Não venda – produção própria',g:'bad'},nv_desist:{t:'Não venda – desistência',g:'bad'}};
const GR={todos:'Todos',ok:'Vendas',warn:'Degustação',info:'Negociação',bad:'Não venda'};
const PROX=['Visita','Ligação','Degustação','Entrega'];
const S={sess:null,uid:'',nome:'',km:[],cli:[],vis:[],phc:{},map:{},fila:[],view:'hoje',cid:null,v:null,kd:{},busy:false,up:null,filtro:'todos',busca:'',msg:'',ok:null,syncing:false};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const hoje=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const fdt=ts=>ts?new Date(ts).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
const fh=ts=>ts?new Date(ts).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'';
const fd=s=>{const p=String(s).split('-');return p[2]+'/'+p[1]};
const nf=n=>Number(n||0).toLocaleString('pt-BR');
const digits=s=>String(s||'').replace(/\D/g,'');
const pill=s=>ST[s]?`<span class="pill ${ST[s].g}">${ST[s].t}</span>`:'';
const CAM='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
const IC={hoje:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3.5"/>',clientes:'<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>',mais:'<path d="M12 5v14M5 12h14"/>',agenda:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',hist:'<path d="M4 19h16"/><path d="M7 16V9M12 16V5M17 16v-4"/>'};
const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${IC[k]}</svg>`;
const COL={km:'km',clientes:'cli',visitas:'vis'};
const CID={"MG":["Abadia dos Dourados","Abaeté","Abre Campo","Acaiaca","Açucena","Água Boa","Água Comprida","Aguanil","Águas Formosas","Águas Vermelhas","Aimorés","Aiuruoca","Alagoa","Albertina","Além Paraíba","Alfenas","Alfredo Vasconcelos","Almenara","Alpercata","Alpinópolis","Alterosa","Alto Caparaó","Alto Jequitibá","Alto Rio Doce","Alvarenga","Alvinópolis","Alvorada de Minas","Amparo do Serra","Andradas","Andrelândia","Angelândia","Antônio Carlos","Antônio Dias","Antônio Prado de Minas","Araçaí","Aracitaba","Araçuaí","Araguari","Arantina","Araponga","Araporã","Arapuá","Araújos","Araxá","Arceburgo","Arcos","Areado","Argirita","Aricanduva","Arinos","Astolfo Dutra","Ataléia","Augusto de Lima","Baependi","Baldim","Bambuí","Bandeira","Bandeira do Sul","Barão de Cocais","Barão de Monte Alto","Barbacena","Barra Longa","Barroso","Bela Vista de Minas","Belmiro Braga","Belo Horizonte","Belo Oriente","Belo Vale","Berilo","Berizal","Bertópolis","Betim","Bias Fortes","Bicas","Biquinhas","Boa Esperança","Bocaina de Minas","Bocaiúva","Bom Despacho","Bom Jardim de Minas","Bom Jesus da Penha","Bom Jesus do Amparo","Bom Jesus do Galho","Bom Repouso","Bom Sucesso","Bonfim","Bonfinópolis de Minas","Bonito de Minas","Borda da Mata","Botelhos","Botumirim","Brás Pires","Brasilândia de Minas","Brasília de Minas","Brasópolis","Braúnas","Brumadinho","Bueno Brandão","Buenópolis","Bugre","Buritis","Buritizeiro","Cabeceira Grande","Cabo Verde","Cachoeira da Prata","Cachoeira de Minas","Cachoeira de Pajeú","Cachoeira Dourada","Caetanópolis","Caeté","Caiana","Cajuri","Caldas","Camacho","Camanducaia","Cambuí","Cambuquira","Campanário","Campanha","Campestre","Campina Verde","Campo Azul","Campo Belo","Campo do Meio","Campo Florido","Campos Altos","Campos Gerais","Cana Verde","Canaã","Canápolis","Candeias","Cantagalo","Caparaó","Capela Nova","Capelinha","Capetinga","Capim Branco","Capinópolis","Capitão Andrade","Capitão Enéas","Capitólio","Caputira","Caraí","Caranaíba","Carandaí","Carangola","Caratinga","Carbonita","Careaçu","Carlos Chagas","Carmésia","Carmo da Cachoeira","Carmo da Mata","Carmo de Minas","Carmo do Cajuru","Carmo do Paranaíba","Carmo do Rio Claro","Carmópolis de Minas","Carneirinho","Carrancas","Carvalhópolis","Carvalhos","Casa Grande","Cascalho Rico","Cássia","Cataguases","Catas Altas","Catas Altas da Noruega","Catuji","Catuti","Caxambu","Cedro do Abaeté","Central de Minas","Centralina","Chácara","Chalé","Chapada do Norte","Chapada Gaúcha","Chiador","Cipotânea","Claraval","Claro dos Poções","Cláudio","Coimbra","Coluna","Comendador Gomes","Comercinho","Conceição da Aparecida","Conceição da Barra de Minas","Conceição das Alagoas","Conceição das Pedras","Conceição de Ipanema","Conceição do Mato Dentro","Conceição do Pará","Conceição do Rio Verde","Conceição dos Ouros","Cônego Marinho","Confins","Congonhal","Congonhas","Congonhas do Norte","Conquista","Conselheiro Lafaiete","Conselheiro Pena","Consolação","Contagem","Coqueiral","Coração de Jesus","Cordisburgo","Cordislândia","Corinto","Coroaci","Coromandel","Coronel Fabriciano","Coronel Murta","Coronel Pacheco","Coronel Xavier Chaves","Córrego Danta","Córrego do Bom Jesus","Córrego Fundo","Córrego Novo","Couto de Magalhães de Minas","Crisólita","Cristais","Cristália","Cristiano Otoni","Cristina","Crucilândia","Cruzeiro da Fortaleza","Cruzília","Cuparaque","Curral de Dentro","Curvelo","Datas","Delfim Moreira","Delfinópolis","Delta","Descoberto","Desterro de Entre Rios","Desterro do Melo","Diamantina","Diogo de Vasconcelos","Dionísio","Divinésia","Divino","Divino das Laranjeiras","Divinolândia de Minas","Divinópolis","Divisa Alegre","Divisa Nova","Divisópolis","Dom Bosco","Dom Cavati","Dom Joaquim","Dom Silvério","Dom Viçoso","Dona Euzébia","Dores de Campos","Dores de Guanhães","Dores do Indaiá","Dores do Turvo","Doresópolis","Douradoquara","Durandé","Elói Mendes","Engenheiro Caldas","Engenheiro Navarro","Entre Folhas","Entre Rios de Minas","Ervália","Esmeraldas","Espera Feliz","Espinosa","Espírito Santo do Dourado","Estiva","Estrela Dalva","Estrela do Indaiá","Estrela do Sul","Eugenópolis","Ewbank da Câmara","Extrema","Fama","Faria Lemos","Felício dos Santos","Felisburgo","Felixlândia","Fernandes Tourinho","Ferros","Fervedouro","Florestal","Formiga","Formoso","Fortaleza de Minas","Fortuna de Minas","Francisco Badaró","Francisco Dumont","Francisco Sá","Franciscópolis","Frei Gaspar","Frei Inocêncio","Frei Lagonegro","Fronteira","Fronteira dos Vales","Fruta de Leite","Frutal","Funilândia","Galiléia","Gameleiras","Glaucilândia","Goiabeira","Goianá","Gonçalves","Gonzaga","Gouveia","Governador Valadares","Grão Mogol","Grupiara","Guanhães","Guapé","Guaraciaba","Guaraciama","Guaranésia","Guarani","Guarará","Guarda-Mor","Guaxupé","Guidoval","Guimarânia","Guiricema","Gurinhatã","Heliodora","Iapu","Ibertioga","Ibiá","Ibiaí","Ibiracatu","Ibiraci","Ibirité","Ibitiúra de Minas","Ibituruna","Icaraí de Minas","Igarapé","Igaratinga","Iguatama","Ijaci","Ilicínea","Imbé de Minas","Inconfidentes","Indaiabira","Indianópolis","Ingaí","Inhapim","Inhaúma","Inimutaba","Ipaba","Ipanema","Ipatinga","Ipiaçu","Ipuiúna","Iraí de Minas","Itabira","Itabirinha de Mantena","Itabirito","Itacambira","Itacarambi","Itaguara","Itaipé","Itajubá","Itamarandiba","Itamarati de Minas","Itambacuri","Itambé do Mato Dentro","Itamogi","Itamonte","Itanhandu","Itanhomi","Itaobim","Itapagipe","Itapecerica","Itapeva","Itatiaiuçu","Itaú de Minas","Itaúna","Itaverava","Itinga","Itueta","Ituiutaba","Itumirim","Iturama","Itutinga","Jaboticatubas","Jacinto","Jacuí","Jacutinga","Jaguaraçu","Jaíba","Jampruca","Janaúba","Januária","Japaraíba","Japonvar","Jeceaba","Jenipapo de Minas","Jequeri","Jequitaí","Jequitibá","Jequitinhonha","Jesuânia","Joaíma","Joanésia","João Monlevade","João Pinheiro","Joaquim Felício","Jordânia","José Gonçalves de Minas","José Raydan","Josenópolis","Juatuba","Juiz de Fora","Juramento","Juruaia","Juvenília","Ladainha","Lagamar","Lagoa da Prata","Lagoa dos Patos","Lagoa Dourada","Lagoa Formosa","Lagoa Grande","Lagoa Santa","Lajinha","Lambari","Lamim","Laranjal","Lassance","Lavras","Leandro Ferreira","Leme do Prado","Leopoldina","Liberdade","Lima Duarte","Limeira do Oeste","Lontra","Luisburgo","Luislândia","Luminárias","Luz","Machacalis","Machado","Madre de Deus de Minas","Malacacheta","Mamonas","Manga","Manhuaçu","Manhumirim","Mantena","Mar de Espanha","Maravilhas","Maria da Fé","Mariana","Marilac","Mário Campos","Maripá de Minas","Marliéria","Marmelópolis","Martinho Campos","Martins Soares","Mata Verde","Materlândia","Mateus Leme","Mathias Lobato","Matias Barbosa","Matias Cardoso","Matipó","Mato Verde","Matozinhos","Matutina","Medeiros","Medina","Mendes Pimentel","Mercês","Mesquita","Minas Novas","Minduri","Mirabela","Miradouro","Miraí","Miravânia","Moeda","Moema","Monjolos","Monsenhor Paulo","Montalvânia","Monte Alegre de Minas","Monte Azul","Monte Belo","Monte Carmelo","Monte Formoso","Monte Santo de Minas","Monte Sião","Montes Claros","Montezuma","Morada Nova de Minas","Morro da Garça","Morro do Pilar","Munhoz","Muriaé","Mutum","Muzambinho","Nacip Raydan","Nanuque","Naque","Natalândia","Natércia","Nazareno","Nepomuceno","Ninheira","Nova Belém","Nova Era","Nova Lima","Nova Módica","Nova Ponte","Nova Porteirinha","Nova Resende","Nova Serrana","Nova União","Novo Cruzeiro","Novo Oriente de Minas","Novorizonte","Olaria","Olhos-d'Água","Olímpio Noronha","Oliveira","Oliveira Fortes","Onça de Pitangui","Oratórios","Orizânia","Ouro Branco","Ouro Fino","Ouro Preto","Ouro Verde de Minas","Padre Carvalho","Padre Paraíso","Pai Pedro","Paineiras","Pains","Paiva","Palma","Palmópolis","Papagaios","Pará de Minas","Paracatu","Paraguaçu","Paraisópolis","Paraopeba","Passa Quatro","Passa Tempo","Passa-Vinte","Passabém","Passos","Patis","Patos de Minas","Patrocínio","Patrocínio do Muriaé","Paula Cândido","Paulistas","Pavão","Peçanha","Pedra Azul","Pedra Bonita","Pedra do Anta","Pedra do Indaiá","Pedra Dourada","Pedralva","Pedras de Maria da Cruz","Pedrinópolis","Pedro Leopoldo","Pedro Teixeira","Pequeri","Pequi","Perdigão","Perdizes","Perdões","Periquito","Pescador","Piau","Piedade de Caratinga","Piedade de Ponte Nova","Piedade do Rio Grande","Piedade dos Gerais","Pimenta","Pingo-d'Água","Pintópolis","Piracema","Pirajuba","Piranga","Piranguçu","Piranguinho","Pirapetinga","Pirapora","Piraúba","Pitangui","Piumhi","Planura","Poço Fundo","Poços de Caldas","Pocrane","Pompéu","Ponte Nova","Ponto Chique","Ponto dos Volantes","Porteirinha","Porto Firme","Poté","Pouso Alegre","Pouso Alto","Prados","Prata","Pratápolis","Pratinha","Presidente Bernardes","Presidente Juscelino","Presidente Kubitschek","Presidente Olegário","Prudente de Morais","Quartel Geral","Queluzito","Raposos","Raul Soares","Recreio","Reduto","Resende Costa","Resplendor","Ressaquinha","Riachinho","Riacho dos Machados","Ribeirão das Neves","Ribeirão Vermelho","Rio Acima","Rio Casca","Rio do Prado","Rio Doce","Rio Espera","Rio Manso","Rio Novo","Rio Paranaíba","Rio Pardo de Minas","Rio Piracicaba","Rio Pomba","Rio Preto","Rio Vermelho","Ritápolis","Rochedo de Minas","Rodeiro","Romaria","Rosário da Limeira","Rubelita","Rubim","Sabará","Sabinópolis","Sacramento","Salinas","Salto da Divisa","Santa Bárbara","Santa Bárbara do Leste","Santa Bárbara do Monte Verde","Santa Bárbara do Tugúrio","Santa Cruz de Minas","Santa Cruz de Salinas","Santa Cruz do Escalvado","Santa Efigênia de Minas","Santa Fé de Minas","Santa Helena de Minas","Santa Juliana","Santa Luzia","Santa Margarida","Santa Maria de Itabira","Santa Maria do Salto","Santa Maria do Suaçuí","Santa Rita de Caldas","Santa Rita de Ibitipoca","Santa Rita de Jacutinga","Santa Rita de Minas","Santa Rita do Itueto","Santa Rita do Sapucaí","Santa Rosa da Serra","Santa Vitória","Santana da Vargem","Santana de Cataguases","Santana de Pirapama","Santana do Deserto","Santana do Garambéu","Santana do Jacaré","Santana do Manhuaçu","Santana do Paraíso","Santana do Riacho","Santana dos Montes","Santo Antônio do Amparo","Santo Antônio do Aventureiro","Santo Antônio do Grama","Santo Antônio do Itambé","Santo Antônio do Jacinto","Santo Antônio do Monte","Santo Antônio do Retiro","Santo Antônio do Rio Abaixo","Santo Hipólito","Santos Dumont","São Bento Abade","São Brás do Suaçuí","São Domingos das Dores","São Domingos do Prata","São Félix de Minas","São Francisco","São Francisco de Paula","São Francisco de Sales","São Francisco do Glória","São Geraldo","São Geraldo da Piedade","São Geraldo do Baixio","São Gonçalo do Abaeté","São Gonçalo do Pará","São Gonçalo do Rio Abaixo","São Gonçalo do Rio Preto","São Gonçalo do Sapucaí","São Gotardo","São João Batista do Glória","São João da Lagoa","São João da Mata","São João da Ponte","São João das Missões","São João del Rei","São João do Manhuaçu","São João do Manteninha","São João do Oriente","São João do Pacuí","São João do Paraíso","São João Evangelista","São João Nepomuceno","São Joaquim de Bicas","São José da Barra","São José da Lapa","São José da Safira","São José da Varginha","São José do Alegre","São José do Divino","São José do Goiabal","São José do Jacuri","São José do Mantimento","São Lourenço","São Miguel do Anta","São Pedro da União","São Pedro do Suaçuí","São Pedro dos Ferros","São Romão","São Roque de Minas","São Sebastião da Bela Vista","São Sebastião da Vargem Alegre","São Sebastião do Anta","São Sebastião do Maranhão","São Sebastião do Oeste","São Sebastião do Paraíso","São Sebastião do Rio Preto","São Sebastião do Rio Verde","São Thomé das Letras","São Tiago","São Tomás de Aquino","São Vicente de Minas","Sapucaí-Mirim","Sardoá","Sarzedo","Sem-Peixe","Senador Amaral","Senador Cortes","Senador Firmino","Senador José Bento","Senador Modestino Gonçalves","Senhora de Oliveira","Senhora do Porto","Senhora dos Remédios","Sericita","Seritinga","Serra Azul de Minas","Serra da Saudade","Serra do Salitre","Serra dos Aimorés","Serrania","Serranópolis de Minas","Serranos","Serro","Sete Lagoas","Setubinha","Silveirânia","Silvianópolis","Simão Pereira","Simonésia","Sobrália","Soledade de Minas","Tabuleiro","Taiobeiras","Taparuba","Tapira","Tapiraí","Taquaraçu de Minas","Tarumirim","Teixeiras","Teófilo Otoni","Timóteo","Tiradentes","Tiros","Tocantins","Tocos do Moji","Toledo","Tombos","Três Corações","Três Marias","Três Pontas","Tumiritinga","Tupaciguara","Turmalina","Turvolândia","Ubá","Ubaí","Ubaporanga","Uberaba","Uberlândia","Umburatiba","Unaí","União de Minas","Uruana de Minas","Urucânia","Urucuia","Vargem Alegre","Vargem Bonita","Vargem Grande do Rio Pardo","Varginha","Varjão de Minas","Várzea da Palma","Varzelândia","Vazante","Verdelândia","Veredinha","Veríssimo","Vermelho Novo","Vespasiano","Viçosa","Vieiras","Virgem da Lapa","Virgínia","Virginópolis","Virgolândia","Visconde do Rio Branco","Volta Grande","Wenceslau Braz"],"GO":["Abadia de Goiás","Abadiânia","Acreúna","Adelândia","Água Fria de Goiás","Água Limpa","Águas Lindas de Goiás","Alexânia","Aloândia","Alto Horizonte","Alto Paraíso de Goiás","Alvorada do Norte","Amaralina","Americano do Brasil","Amorinópolis","Anápolis","Anhanguera","Anicuns","Aparecida de Goiânia","Aparecida do Rio Doce","Aporé","Araçu","Aragarças","Aragoiânia","Araguapaz","Arenópolis","Aruanã","Aurilândia","Avelinópolis","Baliza","Barro Alto","Bela Vista de Goiás","Bom Jardim de Goiás","Bom Jesus de Goiás","Bonfinópolis","Bonópolis","Brazabrantes","Britânia","Buriti Alegre","Buriti de Goiás","Buritinópolis","Cabeceiras","Cachoeira Alta","Cachoeira de Goiás","Cachoeira Dourada","Caçu","Caiapônia","Caldas Novas","Caldazinha","Campestre de Goiás","Campinaçu","Campinorte","Campo Alegre de Goiás","Campos Limpo de Goiás","Campos Belos","Campos Verdes","Carmo do Rio Verde","Castelândia","Catalão","Caturaí","Cavalcante","Ceres","Cezarina","Chapadão do Céu","Cidade Ocidental","Cocalzinho de Goiás","Colinas do Sul","Córrego do Ouro","Corumbá de Goiás","Corumbaíba","Cristalina","Cristianópolis","Crixás","Cromínia","Cumari","Damianópolis","Damolândia","Davinópolis","Diorama","Divinópolis de Goiás","Doverlândia","Edealina","Edéia","Estrela do Norte","Faina","Fazenda Nova","Firminópolis","Flores de Goiás","Formosa","Formoso","Gameleira de Goiás","Goianápolis","Goiandira","Goianésia","Goiânia","Goianira","Goiás","Goiatuba","Gouvelândia","Guapó","Guaraíta","Guarani de Goiás","Guarinos","Heitoraí","Hidrolândia","Hidrolina","Iaciara","Inaciolândia","Indiara","Inhumas","Ipameri","Ipiranga de Goiás","Iporá","Israelândia","Itaberaí","Itaguari","Itaguaru","Itajá","Itapaci","Itapirapuã","Itapuranga","Itarumã","Itauçu","Itumbiara","Ivolândia","Jandaia","Jaraguá","Jataí","Jaupaci","Jesúpolis","Joviânia","Jussara","Lagoa Santa","Leopoldo de Bulhões","Luziânia","Mairipotaba","Mambaí","Mara Rosa","Marzagão","Matrinchã","Maurilândia","Mimoso de Goiás","Minaçu","Mineiros","Moiporá","Monte Alegre de Goiás","Montes Claros de Goiás","Montividiu","Montividiu do Norte","Morrinhos","Morro Agudo de Goiás","Mossâmedes","Mozarlândia","Mundo Novo","Mutunópolis","Nazário","Nerópolis","Niquelândia","Nova América","Nova Aurora","Nova Crixás","Nova Glória","Nova Iguaçu de Goiás","Nova Roma","Nova Veneza","Novo Brasil","Novo Gama","Novo Planalto","Orizona","Ouro Verde de Goiás","Ouvidor","Padre Bernardo","Palestina de Goiás","Palmeiras de Goiás","Palmelo","Palminópolis","Panamá","Paranaiguara","Paraúna","Perolândia","Petrolina de Goiás","Pilar de Goiás","Piracanjuba","Piranhas","Pirenópolis","Pires do Rio","Planaltina","Pontalina","Porangatu","Porteirão","Portelândia","Posse","Professor Jamil","Quirinópolis","Rialma","Rianápolis","Rio Quente","Rio Verde","Rubiataba","Sanclerlândia","Santa Bárbara de Goiás","Santa Cruz de Goiás","Santa Fé de Goiás","Santa Helena de Goiás","Santa Isabel","Santa Rita do Araguaia","Santa Rita do Novo Destino","Santa Rosa de Goiás","Santa Tereza de Goiás","Santa Terezinha de Goiás","Santo Antônio da Barra","Santo Antônio de Goiás","Santo Antônio do Descoberto","São Domingos","São Francisco de Goiás","São João d'Aliança","São João da Paraúna","São Luís de Montes Belos","São Luíz do Norte","São Miguel do Araguaia","São Miguel do Passa Quatro","São Patrício","São Simão","Senador Canedo","Serranópolis","Silvânia","Simolândia","Sítio d'Abadia","Taquaral de Goiás","Teresina de Goiás","Terezópolis de Goiás","Três Ranchos","Trindade","Trombas","Turvânia","Turvelândia","Uirapuru","Uruaçu","Uruana","Urutaí","Valparaíso de Goiás","Varjão","Vianópolis","Vicentinópolis","Vila Boa","Vila Propício"],"SP":["Adamantina","Adolfo","Aguaí","Águas da Prata","Águas de Lindóia","Águas de Santa Bárbara","Águas de São Pedro","Agudos","Alambari","Alfredo Marcondes","Altair","Altinópolis","Alto Alegre","Alumínio","Álvares Florence","Álvares Machado","Álvaro de Carvalho","Alvinlândia","Americana","Américo Brasiliense","Américo de Campos","Amparo","Analândia","Andradina","Angatuba","Anhembi","Anhumas","Aparecida","Aparecida d'Oeste","Apiaí","Araçariguama","Araçatuba","Araçoiaba da Serra","Aramina","Arandu","Arapeí","Araraquara","Araras","Arco-Íris","Arealva","Areias","Areiópolis","Ariranha","Artur Nogueira","Arujá","Aspásia","Assis","Atibaia","Auriflama","Avaí","Avanhandava","Avaré","Bady Bassitt","Balbinos","Bálsamo","Bananal","Barão de Antonina","Barbosa","Bariri","Barra Bonita","Barra do Chapéu","Barra do Turvo","Barretos","Barrinha","Barueri","Bastos","Batatais","Bauru","Bebedouro","Bento de Abreu","Bernardino de Campos","Bertioga","Bilac","Birigui","Biritiba-Mirim","Boa Esperança do Sul","Bocaina","Bofete","Boituva","Bom Jesus dos Perdões","Bom Sucesso de Itararé","Borá","Boracéia","Borborema","Borebi","Botucatu","Bragança Paulista","Braúna","Brejo Alegre","Brodowski","Brotas","Buri","Buritama","Buritizal","Cabrália Paulista","Cabreúva","Caçapava","Cachoeira Paulista","Caconde","Cafelândia","Caiabu","Caieiras","Caiuá","Cajamar","Cajati","Cajobi","Cajuru","Campina do Monte Alegre","Campinas","Campo Limpo Paulista","Campos do Jordão","Campos Novos Paulista","Cananéia","Canas","Cândido Mota","Cândido Rodrigues","Canitar","Capão Bonito","Capela do Alto","Capivari","Caraguatatuba","Carapicuíba","Cardoso","Casa Branca","Cássia dos Coqueiros","Castilho","Catanduva","Catiguá","Cedral","Cerqueira César","Cerquilho","Cesário Lange","Charqueada","Chavantes","Clementina","Colina","Colômbia","Conchal","Conchas","Cordeirópolis","Coroados","Coronel Macedo","Corumbataí","Cosmópolis","Cosmorama","Cotia","Cravinhos","Cristais Paulista","Cruzália","Cruzeiro","Cubatão","Cunha","Descalvado","Diadema","Dirce Reis","Divinolândia","Dobrada","Dois Córregos","Dolcinópolis","Dourado","Dracena","Duartina","Dumont","Echaporã","Eldorado","Elias Fausto","Elisiário","Embaúba","Embu","Embu-Guaçu","Emilianópolis","Engenheiro Coelho","Espírito Santo do Pinhal","Espírito Santo do Turvo","Estiva Gerbi","Estrela d'Oeste","Estrela do Norte","Euclides da Cunha Paulista","Fartura","Fernando Prestes","Fernandópolis","Fernão","Ferraz de Vasconcelos","Flora Rica","Floreal","Florínia","Flórida Paulista","Franca","Francisco Morato","Franco da Rocha","Gabriel Monteiro","Gália","Garça","Gastão Vidigal","Gavião Peixoto","General Salgado","Getulina","Glicério","Guaiçara","Guaimbê","Guaíra","Guapiaçu","Guapiara","Guará","Guaraçaí","Guaraci","Guarani d'Oeste","Guarantã","Guararapes","Guararema","Guaratinguetá","Guareí","Guariba","Guarujá","Guarulhos","Guatapará","Guzolândia","Herculândia","Holambra","Hortolândia","Iacanga","Iacri","Iaras","Ibaté","Ibirá","Ibirarema","Ibitinga","Ibiúna","Icém","Iepê","Igaraçu do Tietê","Igarapava","Igaratá","Iguape","Ilha Comprida","Ilha Solteira","Ilhabela","Indaiatuba","Indiana","Indiaporã","Inúbia Paulista","Ipauçu","Iperó","Ipeúna","Ipiguá","Iporanga","Ipuã","Iracemápolis","Irapuã","Irapuru","Itaberá","Itaí","Itajobi","Itaju","Itanhaém","Itaóca","Itapecerica da Serra","Itapetininga","Itapeva","Itapevi","Itapira","Itapirapuã Paulista","Itápolis","Itaporanga","Itapuí","Itapura","Itaquaquecetuba","Itararé","Itariri","Itatiba","Itatinga","Itirapina","Itirapuã","Itobi","Itu","Itupeva","Ituverava","Jaborandi","Jaboticabal","Jacareí","Jaci","Jacupiranga","Jaguariúna","Jales","Jambeiro","Jandira","Jardinópolis","Jarinu","Jaú","Jeriquara","Joanópolis","João Ramalho","José Bonifácio","Júlio Mesquita","Jumirim","Jundiaí","Junqueirópolis","Juquiá","Juquitiba","Lagoinha","Laranjal Paulista","Lavínia","Lavrinhas","Leme","Lençóis Paulista","Limeira","Lindóia","Lins","Lorena","Lourdes","Louveira","Lucélia","Lucianópolis","Luís Antônio","Luiziânia","Lupércio","Lutécia","Macatuba","Macaubal","Macedônia","Magda","Mairinque","Mairiporã","Manduri","Marabá Paulista","Maracaí","Marapoama","Mariápolis","Marília","Marinópolis","Martinópolis","Matão","Mauá","Mendonça","Meridiano","Mesópolis","Miguelópolis","Mineiros do Tietê","Mira Estrela","Miracatu","Mirandópolis","Mirante do Paranapanema","Mirassol","Mirassolândia","Mococa","Mogi das Cruzes","Mogi-Guaçu","Mogi-Mirim","Mombuca","Monções","Mongaguá","Monte Alegre do Sul","Monte Alto","Monte Aprazível","Monte Azul Paulista","Monte Castelo","Monte Mor","Monteiro Lobato","Morro Agudo","Morungaba","Motuca","Murutinga do Sul","Nantes","Narandiba","Natividade da Serra","Nazaré Paulista","Neves Paulista","Nhandeara","Nipoã","Nova Aliança","Nova Campina","Nova Canaã Paulista","Nova Castilho","Nova Europa","Nova Granada","Nova Guataporanga","Nova Independência","Nova Luzitânia","Nova Odessa","Novais","Novo Horizonte","Nuporanga","Ocauçu","Óleo","Olímpia","Onda Verde","Oriente","Orindiúva","Orlândia","Osasco","Oscar Bressane","Osvaldo Cruz","Ourinhos","Ouro Verde","Ouroeste","Pacaembu","Palestina","Palmares Paulista","Palmeira d'Oeste","Palmital","Panorama","Paraguaçu Paulista","Paraibuna","Paraíso","Paranapanema","Paranapuã","Parapuã","Pardinho","Pariquera-Açu","Parisi","Patrocínio Paulista","Paulicéia","Paulínia","Paulistânia","Paulo de Faria","Pederneiras","Pedra Bela","Pedranópolis","Pedregulho","Pedreira","Pedrinhas Paulista","Pedro de Toledo","Penápolis","Pereira Barreto","Pereiras","Peruíbe","Piacatu","Piedade","Pilar do Sul","Pindamonhangaba","Pindorama","Pinhalzinho","Piquerobi","Piquete","Piracaia","Piracicaba","Piraju","Pirajuí","Pirangi","Pirapora do Bom Jesus","Pirapozinho","Pirassununga","Piratininga","Pitangueiras","Planalto","Platina","Poá","Poloni","Pompéia","Pongaí","Pontal","Pontalinda","Pontes Gestal","Populina","Porangaba","Porto Feliz","Porto Ferreira","Potim","Potirendaba","Pracinha","Pradópolis","Praia Grande","Pratânia","Presidente Alves","Presidente Bernardes","Presidente Epitácio","Presidente Prudente","Presidente Venceslau","Promissão","Quadra","Quatá","Queiroz","Queluz","Quintana","Rafard","Rancharia","Redenção da Serra","Regente Feijó","Reginópolis","Registro","Restinga","Ribeira","Ribeirão Bonito","Ribeirão Branco","Ribeirão Corrente","Ribeirão do Sul","Ribeirão dos Índios","Ribeirão Grande","Ribeirão Pires","Ribeirão Preto","Rifaina","Rincão","Rinópolis","Rio Claro","Rio das Pedras","Rio Grande da Serra","Riolândia","Riversul","Rosana","Roseira","Rubiácea","Rubinéia","Sabino","Sagres","Sales","Sales Oliveira","Salesópolis","Salmourão","Saltinho","Salto","Salto de Pirapora","Salto Grande","Sandovalina","Santa Adélia","Santa Albertina","Santa Bárbara d'Oeste","Santa Branca","Santa Clara d'Oeste","Santa Cruz da Conceição","Santa Cruz da Esperança","Santa Cruz das Palmeiras","Santa Cruz do Rio Pardo","Santa Ernestina","Santa Fé do Sul","Santa Gertrudes","Santa Isabel","Santa Lúcia","Santa Maria da Serra","Santa Mercedes","Santa Rita d'Oeste","Santa Rita do Passa Quatro","Santa Rosa de Viterbo","Santa Salete","Santana da Ponte Pensa","Santana de Parnaíba","Santo Anastácio","Santo André","Santo Antônio da Alegria","Santo Antônio de Posse","Santo Antônio do Aracanguá","Santo Antônio do Jardim","Santo Antônio do Pinhal","Santo Expedito","Santópolis do Aguapeí","Santos","São Bento do Sapucaí","São Bernardo do Campo","São Caetano do Sul","São Carlos","São Francisco","São João da Boa Vista","São João das Duas Pontes","São João de Iracema","São João do Pau d'Alho","São Joaquim da Barra","São José da Bela Vista","São José do Barreiro","São José do Rio Pardo","São José do Rio Preto","São José dos Campos","São Lourenço da Serra","São Luís do Paraitinga","São Manuel","São Miguel Arcanjo","São Paulo","São Pedro","São Pedro do Turvo","São Roque","São Sebastião","São Sebastião da Grama","São Simão","São Vicente","Sarapuí","Sarutaiá","Sebastianópolis do Sul","Serra Azul","Serra Negra","Serrana","Sertãozinho","Sete Barras","Severínia","Silveiras","Socorro","Sorocaba","Sud Mennucci","Sumaré","Suzanápolis","Suzano","Tabapuã","Tabatinga","Taboão da Serra","Taciba","Taguaí","Taiaçu","Taiúva","Tambaú","Tanabi","Tapiraí","Tapiratiba","Taquaral","Taquaritinga","Taquarituba","Taquarivaí","Tarabai","Tarumã","Tatuí","Taubaté","Tejupá","Teodoro Sampaio","Terra Roxa","Tietê","Timburi","Torre de Pedra","Torrinha","Trabiju","Tremembé","Três Fronteiras","Tuiuti","Tupã","Tupi Paulista","Turiúba","Turmalina","Ubarana","Ubatuba","Ubirajara","Uchoa","União Paulista","Urânia","Uru","Urupês","Valentim Gentil","Valinhos","Valparaíso","Vargem","Vargem Grande do Sul","Vargem Grande Paulista","Várzea Paulista","Vera Cruz","Vinhedo","Viradouro","Vista Alegre do Alto","Vitória Brasil","Votorantim","Votuporanga","Zacarias"]};
const CIDS=new Set(Object.keys(CID).flatMap(u=>CID[u].map(c=>c+' - '+u)));
const arr=r=>Array.isArray(r)?r.filter(Boolean):(r?[r]:[]);
const ths=(l,alt)=>arr(l).map(r=>`<img src="${esc(fsrc(r))}" data-a="zoom" alt="${esc(alt)}">`).join('');
function getp(p){const k=p.split('.');return k.length===1?S[k[0]]:S[k[0]][k[1]]}

function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(S.tt);S.tt=setTimeout(()=>e.classList.remove('on'),3200)}
const CFG=window.VILLA_CONFIG||{};
/* ---------- armazenamento local (IndexedDB) ---------- */
const idb=(()=>{let p;const open=()=>p||(p=new Promise((r,j)=>{const q=indexedDB.open('villa-vendas',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)}));
  const tx=(m,f)=>open().then(db=>new Promise((r,j)=>{const t=db.transaction('kv',m);const q=f(t.objectStore('kv'));t.oncomplete=()=>r(q&&q.result);t.onerror=()=>j(t.error)}));
  return {get:k=>tx('readonly',s=>s.get(k)),set:(k,v)=>tx('readwrite',s=>s.put(v,k)),del:k=>tx('readwrite',s=>s.delete(k))}})();
const salvarCache=()=>idb.set('cache',{email:S.uid,km:S.km,cli:S.cli,vis:S.vis}).catch(()=>{});
/* ---------- API (Google Apps Script) ---------- */
async function api(acao,dados){
  if(!CFG.API_URL)throw Object.assign(new Error('App não configurado (API_URL).'),{code:'cfg'});
  let r;try{r=await fetch(CFG.API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({acao,token:S.sess?S.sess.token:'',...dados})})}catch(e){throw Object.assign(new Error('Sem conexão'),{code:'rede'})}
  let j;try{j=await r.json()}catch(e){throw Object.assign(new Error('Resposta inválida do servidor'),{code:'rede'})}
  if(!j.ok)throw Object.assign(new Error(j.erro||'Erro no servidor'),{code:j.code||'erro'});
  return j;
}
function upLocal(col,id,obj){const a=S[COL[col]];const o={...obj,id};const i=a.findIndex(x=>x.id===id);i<0?a.push(o):a[i]=o}
async function put(col,id,obj){
  obj={...obj,uid:S.uid};upLocal(col,id,obj);S.fila.push({col,id,obj});
  await idb.set('fila',S.fila);salvarCache();sync();
}
const refsIn=(o,a=[])=>{if(typeof o==='string'){if(o.startsWith('l:'))a.push(o.slice(2))}else if(Array.isArray(o))o.forEach(x=>refsIn(x,a));else if(o&&typeof o==='object')Object.values(o).forEach(x=>refsIn(x,a));return a};
const swap=o=>{if(typeof o==='string')return o.startsWith('l:')&&S.map[o.slice(2)]?S.map[o.slice(2)]:o;if(Array.isArray(o))return o.map(swap);if(o&&typeof o==='object'){const r={};for(const k in o)r[k]=swap(o[k]);return r}return o};
async function sync(){
  if(S.syncing||!S.sess||!S.fila.length)return;S.syncing=true;soft();
  try{
    while(S.fila.length){
      const op=S.fila[0],lids=[...new Set(refsIn(op.obj))];
      for(const lid of lids){
        if(S.map[lid])continue;
        const data=S.phc[lid]||await idb.get('ph:'+lid);
        if(!data){S.map[lid]='x:';continue}
        const j=await api('foto',{lid,data,tipo:op.col});
        S.map[lid]='d:'+j.id;await idb.set('map',S.map);
      }
      await api('salvar',{col:op.col,id:op.id,obj:swap(op.obj)});
      S.fila.shift();await idb.set('fila',S.fila);
      const resto=new Set(refsIn(S.fila));
      for(const lid of lids)if(!resto.has(lid)){idb.del('ph:'+lid).catch(()=>{});delete S.phc[lid]}
    }
    S.msg='';
  }catch(e){
    if(e.code==='auth'){S.syncing=false;return sair('Sua sessão expirou. Entre novamente para enviar os registros pendentes.')}
    if(e.code==='negado'){S.msg='Um registro foi recusado: '+e.message;S.fila.shift();await idb.set('fila',S.fila)}
    else S.msg=S.fila.length+' registro(s) salvos no aparelho, aguardando internet para enviar.';
  }
  S.syncing=false;soft();
}
setInterval(sync,30000);addEventListener('online',sync);
const DRV=id=>'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1200';
function gps(){return new Promise(r=>{if(!navigator.geolocation)return r(null);navigator.geolocation.getCurrentPosition(p=>r({lat:+p.coords.latitude.toFixed(6),lng:+p.coords.longitude.toFixed(6),acc:Math.round(p.coords.accuracy)}),()=>r(null),{enableHighAccuracy:true,timeout:12000,maximumAge:60000})})}
function fsrc(r){
  if(!r)return '';const t=r.slice(0,2),v=r.slice(2);
  if(t==='d:')return DRV(v);
  if(t==='l:'){if(S.phc[v])return S.phc[v];const m=S.map[v];if(m&&m.startsWith('d:'))return DRV(m.slice(2));
    if(!S.phc['?'+v]){S.phc['?'+v]=1;idb.get('ph:'+v).then(d=>{if(d){S.phc[v]=d;soft()}}).catch(()=>{})}}
  return '';
}
const loadImg=f=>new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>j(new Error('imagem inválida'));i.src=URL.createObjectURL(f)});
const toBlob=c=>new Promise(r=>c.toBlob(r,'image/jpeg',.72));
function draw(img,max,label){
  const k=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');
  c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);const x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);
  const h=Math.max(24,Math.round(c.height*.05));x.fillStyle='rgba(0,0,0,.62)';x.fillRect(0,c.height-h,c.width,h);
  x.fillStyle='#fff';x.font='600 '+Math.round(h*.5)+'px Inter,sans-serif';x.textBaseline='middle';
  x.fillText(label+' · '+S.nome+' · '+new Date().toLocaleString('pt-BR'),Math.round(h*.4),c.height-h/2,c.width-h);
  return c;
}
async function foto(file,label){
  const img=await loadImg(file);const data=draw(img,1280,label).toDataURL('image/jpeg',.72);
  const lid=nid();await idb.set('ph:'+lid,data);S.phc[lid]=data;return 'l:'+lid;
}
const phBox=(key,label,ref,req)=>{const L=arr(ref),up=S.up===key;return `<div class="ph ${L.length?'has':''}">
  <input type="file" accept="image/*" capture="environment" data-ph="${key}" data-lb="${esc(label)}" id="cam-${key}" tabindex="-1">
  <input type="file" accept="image/*" multiple data-ph="${key}" data-lb="${esc(label)}" id="gal-${key}" tabindex="-1">
  ${L.length?`<div class="phg">${L.map((r,i)=>`<div><img src="${esc(fsrc(r))}" data-a="zoom" alt="${esc(label)} ${i+1}"><button type="button" data-a="rmph" data-id="${key}" data-i="${i}" aria-label="Remover foto ${i+1}">×</button></div>`).join('')}</div><div class="phn">${esc(label)} · ${L.length} foto${L.length>1?'s':''}</div>`:`${CAM}<div>${up?'Processando…':esc(label)}${req?' <span class="req">*</span>':''}</div>`}
  <div class="phb"><label for="cam-${key}" role="button" tabindex="0">${up?'Processando…':L.length?'+ Tirar outra':'Tirar foto'}</label><label for="gal-${key}" class="alt" role="button" tabindex="0">${L.length?'+ Galeria':'Galeria (várias)'}</label></div></div>`};
const gcal=(t,dt,det,loc)=>{const d=new Date(dt),e=new Date(d.getTime()+1800000),f=x=>x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(t)+'&dates='+f(d)+'/'+f(e)+'&details='+encodeURIComponent(det||'')+'&location='+encodeURIComponent(loc||'')};
const wa=t=>{let d=digits(t);if(!d)return '';if(d.length<=11)d='55'+d;return 'https://wa.me/'+d};

/* ---------- views ---------- */
function vHoje(){
  const d=hoje(),k=S.km.find(x=>x.data===d),vh=S.vis.filter(x=>x.data===d);
  const cnt=g=>vh.filter(x=>ST[x.status]&&ST[x.status].g===g).length;
  let km='';
  if(!k){km=`<h2>Início do dia</h2><p class="mute">Registre o hodômetro antes de sair para a rota.</p>
    <label class="f">KM inicial <span class="req">*</span><input inputmode="numeric" data-f="kd.ini" value="${esc(S.kd.ini||'')}" placeholder="Ex.: 85230"></label>
    ${phBox('kd.fini','Foto do hodômetro – início',S.kd.fini,1)}
    <button class="btn" data-a="kmIni" ${S.busy?'disabled':''}>Iniciar dia</button>`}
  else if(k.kmFim==null){km=`<h2>Dia em andamento</h2><p class="mute">Saída às ${fh(k.hIni)} com ${nf(k.kmIni)} km.</p>
    <div class="thumbs">${ths(k.fotosIni||k.fotoIni,'Hodômetro início')}</div>
    <label class="f">KM final <span class="req">*</span><input inputmode="numeric" data-f="kd.fim" value="${esc(S.kd.fim||'')}" placeholder="Maior que ${nf(k.kmIni)}"></label>
    ${phBox('kd.ffim','Foto do hodômetro – final',S.kd.ffim,1)}
    <button class="btn" data-a="kmFim" ${S.busy?'disabled':''}>Encerrar dia</button>`}
  else{km=`<h2>Dia encerrado</h2><div class="odo">${nf(k.kmFim-k.kmIni)}<small>km rodados</small></div>
    <div class="kv"><div><span>Início · ${fh(k.hIni)}</span><b>${nf(k.kmIni)}</b></div><div><span>Fim · ${fh(k.hFim)}</span><b>${nf(k.kmFim)}</b></div></div>
    <div class="thumbs">${ths(k.fotosIni||k.fotoIni,'Hodômetro início')}${ths(k.fotosFim||k.fotoFim,'Hodômetro fim')}</div>`}
  const hist=[...S.km].filter(x=>x.kmFim!=null).sort((a,b)=>b.data<a.data?-1:1).slice(0,7);
  return `<div class="card">${km}</div>
  <h3 style="margin:4px 0 10px">Hoje em números</h3>
  <div class="stats"><div><b>${vh.length}</b><span>Visitas</span></div><div><b>${cnt('ok')}</b><span>Vendas</span></div><div><b>${cnt('warn')}</b><span>Degustações</span></div><div><b>${cnt('bad')}</b><span>Não vendas</span></div></div>
  ${hist.length?`<div class="card" style="margin-top:14px"><h3>Últimos dias</h3><table class="hist">${hist.map(x=>`<tr><td>${fd(x.data)} · ${nf(x.kmIni)} → ${nf(x.kmFim)}</td><td>${nf(x.kmFim-x.kmIni)} km</td></tr>`).join('')}</table></div>`:''}
  <button class="btn" data-a="nova">Registrar visita</button>`;
}
function listaHtml(){
  const b=S.busca.trim().toLowerCase();
  const l=S.cli.filter(c=>(!b||((c.nome||'')+' '+(c.cidade||'')).toLowerCase().includes(b))&&(S.filtro==='todos'||(ST[c.status]&&ST[c.status].g===S.filtro))).sort((a,b)=>(b.ultima||0)-(a.ultima||0));
  if(!l.length)return `<p class="empty">${S.cli.length?'Nenhum cliente neste filtro.':'Nenhum cliente ainda. Registre a primeira visita pelo botão +.'}</p>`;
  return l.map(c=>`<div class="item" data-a="cli" data-id="${esc(c.id)}"><div class="l1"><div><div class="nm">${esc(c.nome)}</div><div class="sub">${esc(c.cidade)} · última visita ${fdt(c.ultima)}</div></div>${pill(c.status)}</div>${c.proxData?`<div class="sub">Próximo: ${esc(c.proxTipo)} em ${fdt(c.proxData)}</div>`:''}</div>`).join('');
}
function vClientes(){
  return `<h2>Meus clientes</h2><p class="mute">${S.cli.length} cadastrados</p>
  <label class="f" style="margin-top:0"><input type="search" data-f="busca" value="${esc(S.busca)}" placeholder="Buscar por nome ou cidade" aria-label="Buscar cliente"></label>
  <div class="chips" style="margin:12px 0 14px">${Object.keys(GR).map(g=>`<button class="chip ${g} ${S.filtro===g?'on':''}" data-a="filtro" data-id="${g}">${GR[g]}</button>`).join('')}</div>
  <div id="lista">${listaHtml()}</div>`;
}
function vCliente(){
  const c=S.cli.find(x=>x.id===S.cid);if(!c)return `<p class="empty">Cliente não encontrado.</p>`;
  const vs=S.vis.filter(x=>x.clienteId===c.id).sort((a,b)=>b.ts-a.ts);
  const capa=fsrc(c.fotoFachada);
  return `<button class="back" data-a="go" data-id="clientes">‹ Clientes</button>
  <div class="card">${capa?`<div class="cover"><img src="${esc(capa)}" data-a="zoom" alt="Fachada"></div>`:''}
   <div class="item" style="all:unset;display:block"><div class="l1"><h2>${esc(c.nome)}</h2>${pill(c.status)}</div></div>
   <p class="mute" style="margin-bottom:0">${esc(c.cidade)}${c.endereco?' · '+esc(c.endereco):''}<br>Contato: ${esc(c.contatoNome)} · ${esc(c.contatoTel)}</p>
   ${c.proxData?`<p class="q" style="margin:10px 0 0"><b>Próximo passo:</b> ${esc(c.proxTipo)} em ${fdt(c.proxData)}</p>`:''}
   <div class="links">${wa(c.contatoTel)?`<a href="${wa(c.contatoTel)}" target="_blank" rel="noopener">WhatsApp</a>`:''}${c.proxData?`<a href="${esc(gcal(c.proxTipo+' – '+c.nome,c.proxData,'Villa Crocante · '+c.contatoNome+' '+c.contatoTel,c.endereco||c.cidade))}" target="_blank" rel="noopener">Google Agenda</a>`:''}</div>
   <button class="btn" data-a="nova" data-id="${esc(c.id)}">Nova visita / atualizar status</button></div>
  <h3 style="margin:6px 0 12px">Histórico de visitas (${vs.length})</h3>
  <div class="tl">${vs.map(v=>`<div class="ev"><div class="sub mute" style="margin:0">${fdt(v.ts)}</div>${pill(v.status)}
   <div class="q"><b>Falou com:</b> ${esc(v.contatoNome)}${v.cargo?' ('+esc(v.cargo)+')':''} · ${esc(v.contatoTel)}</div>
   ${v.fornecedor?`<div class="q"><b>Fornecedor atual:</b> ${esc(v.fornecedor)}</div><div class="q"><b>Preços praticados:</b> ${esc(v.precos)}</div>`:''}
   ${v.gps?`<div class="q"><a href="https://maps.google.com/?q=${v.gps.lat},${v.gps.lng}" target="_blank" rel="noopener">Ver local da visita no mapa</a> (±${v.gps.acc} m)</div>`:''}
   ${v.obs?`<div class="q"><b>Obs.:</b> ${esc(v.obs)}</div>`:''}
   ${v.proxData?`<div class="q"><b>Agendado:</b> ${esc(v.proxTipo)} em ${fdt(v.proxData)}</div>`:''}
   ${(()=>{const h=ths(v.fotosFachada||v.fotoFachada,'Fachada')+ths(v.fotosVitrine||v.fotoVitrine,'Vitrine');return h?`<div class="thumbs">${h}</div>`:''})()}</div>`).join('')||'<p class="empty">Sem visitas.</p>'}</div>`;
}
function vVisita(){
  const v=S.v,novo=v.cid==='__novo',c=S.cli.find(x=>x.id===v.cid);
  const prim=novo||!c||!(c.nVisitas>0),nv=v.status&&v.status.startsWith('nv_');
  const opts=[...S.cli].sort((a,b)=>(a.nome||'').localeCompare(b.nome||'')).map(x=>`<option value="${esc(x.id)}" ${v.cid===x.id?'selected':''}>${esc(x.nome)} – ${esc(x.cidade)}</option>`).join('');
  return `<h2>Registrar visita</h2><p class="mute">Vendedor: ${esc(S.nome)} · ${new Date().toLocaleDateString('pt-BR')}</p>
  <div class="card"><h3>Cliente</h3>
   <label class="f">Cliente <span class="req">*</span><select data-f="v.cid" data-r="1"><option value="">Selecione…</option><option value="__novo" ${novo?'selected':''}>+ Novo cliente</option>${opts}</select></label>
   ${novo?`<label class="f">Nome do estabelecimento <span class="req">*</span><input data-f="v.nn" value="${esc(v.nn||'')}"></label>
   <div class="row"><label class="f">Cidade <span class="req">*</span><input list="dl-cid" data-f="v.ncid" value="${esc(v.ncid||'')}" placeholder="Digite e escolha (MG, GO, SP)" autocomplete="off"></label><label class="f">Telefone da loja<input inputmode="tel" data-f="v.ntel" value="${esc(v.ntel||'')}"></label></div>
   <label class="f">Endereço<input data-f="v.nend" value="${esc(v.nend||'')}"></label>`:''}</div>
  <div class="card"><h3>Fotos ${prim?'':'<span class="mute" style="font:400 13px Inter">(opcional nesta visita)</span>'}</h3>
   <div class="row">${phBox('v.fachada','Foto da fachada',v.fachada,prim)}${phBox('v.vitrine','Foto da vitrine',v.vitrine,prim)}</div></div>
  <div class="card"><h3>Com quem falou</h3>
   <label class="f">Nome <span class="req">*</span><input data-f="v.cnome" value="${esc(v.cnome||'')}" autocomplete="off"></label>
   <div class="row"><label class="f">Telefone / WhatsApp <span class="req">*</span><input inputmode="tel" data-f="v.ctel" value="${esc(v.ctel||'')}" placeholder="(34) 9 9999-9999"></label><label class="f">Cargo<input data-f="v.cargo" value="${esc(v.cargo||'')}" placeholder="Dono, gerente…"></label></div></div>
  <div class="card"><h3>Resultado do atendimento <span class="req">*</span></h3>
   <div class="chips">${Object.keys(ST).map(s=>`<button class="chip ${ST[s].g} ${v.status===s?'on':''}" data-a="st" data-id="${s}">${ST[s].t}</button>`).join('')}</div>
   ${v.status==='nv_preco'?`<label class="f">Fornecedor atual <span class="req">*</span><input data-f="v.forn" value="${esc(v.forn||'')}"></label>
   <label class="f">Preços praticados <span class="req">*</span><textarea data-f="v.precos" placeholder="Ex.: pão de queijo 1 kg R$ 28,00; coxinha cx 50 un R$ 45,00">${esc(v.precos||'')}</textarea></label>`:''}
   ${v.status?`<label class="f">${nv?'Motivo da não venda (opcional)':'Observações (opcional)'}<textarea data-f="v.obs">${esc(v.obs||'')}</textarea></label>`:''}</div>
  <div class="card"><h3>Próximo passo</h3>
   <div class="row"><label class="f">Tipo<select data-f="v.ptipo"><option value="">Nenhum</option>${PROX.map(p=>`<option ${v.ptipo===p?'selected':''}>${p}</option>`).join('')}</select></label>
   <label class="f">Data e hora<input type="datetime-local" data-f="v.pdata" value="${esc(v.pdata||'')}"></label></div></div>
  <button class="btn" data-a="salvar" ${S.busy||S.up?'disabled':''}>${S.busy?'Salvando…':'Salvar visita'}</button>
  <button class="btn sec" data-a="go" data-id="${c?'cliente':'hoje'}">Cancelar</button>`;
}
function vOk(){
  const o=S.ok;
  return `<div class="card" style="text-align:center"><h2>Visita registrada</h2><p class="mute">${esc(o.nome)} · ${fdt(o.ts)}</p>${pill(o.status)}
  ${o.proxData?`<a class="btn" href="${esc(gcal(o.proxTipo+' – '+o.nome,o.proxData,'Villa Crocante · '+o.contato,o.local))}" target="_blank" rel="noopener">Adicionar ao Google Agenda</a>`:''}
  <button class="btn ${o.proxData?'sec':''}" data-a="cli" data-id="${esc(o.cid)}">Ver cliente</button><button class="btn sec" data-a="nova">Registrar outra visita</button></div>`;
}
function vAgenda(){
  const now=Date.now(),d=hoje();
  const l=S.cli.filter(c=>c.proxData).sort((a,b)=>a.proxData<b.proxData?-1:1);
  const g={atr:[],hoje:[],prox:[]};
  l.forEach(c=>{const t=new Date(c.proxData).getTime();(c.proxData.slice(0,10)===d?g.hoje:t<now?g.atr:g.prox).push(c)});
  const it=c=>`<div class="item" data-a="cli" data-id="${esc(c.id)}"><div class="l1"><div><div class="nm">${esc(c.proxTipo)} · ${esc(c.nome)}</div><div class="sub">${fdt(c.proxData)} · ${esc(c.contatoNome)} ${esc(c.contatoTel)}</div></div>${pill(c.status)}</div></div>`;
  const sec=(t,a)=>a.length?`<div class="grp">${t} (${a.length})</div>${a.map(it).join('')}`:'';
  return `<h2>Agenda</h2><p class="mute">Visitas e ligações marcadas nos atendimentos. Abra o cliente para levar ao Google Agenda.</p>
  ${l.length?sec('Atrasados',g.atr)+sec('Hoje',g.hoje)+sec('Próximos',g.prox):'<p class="empty">Nada agendado.</p>'}`;
}
function render(){
  $('#me').innerHTML=S.sess?`<div>${esc(S.nome)}<br><button class="sair" data-a="sair">Sair</button></div>`:'';
  const pend=S.fila.length;
  $('#demo').innerHTML=S.sess&&(S.msg||pend)?`<div class="demo">${esc(S.msg||(S.syncing?'Enviando '+pend+' registro(s)…':pend+' registro(s) aguardando envio.'))}</div>`:'';
  if(!S.sess){app.innerHTML=vLogin();$('#nav').innerHTML='';loginBtn();return}
  const V={hoje:vHoje,clientes:vClientes,cliente:vCliente,visita:vVisita,ok:vOk,agenda:vAgenda};
  app.innerHTML=(V[S.view]||vHoje)();
  const tab=S.view==='cliente'?'clientes':S.view==='ok'?'visita':S.view;
  $('#nav').innerHTML=[['hoje','Hoje','hoje'],['clientes','Clientes','clientes'],['visita','Visita','mais'],['agenda','Agenda','agenda'],['hist','KM','hist']].map(([v,t,i])=>v==='visita'?`<button class="fab" data-a="nova" aria-label="Nova visita"><i>${svg(i)}</i>${t}</button>`:`<button class="${tab===v?'on':''}" data-a="go" data-id="${v==='hist'?'hoje':v}">${svg(i)}${t}</button>`).join('');
}
function soft(){const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&S.view!=='clientes'){S.pend=true;return}render()}
document.addEventListener('focusout',()=>{if(S.pend){S.pend=false;setTimeout(()=>{const a=document.activeElement;if(!a||!/INPUT|TEXTAREA|SELECT/.test(a.tagName))render();else S.pend=true},400)}});

function setp(p,val){const k=p.split('.');if(k.length===1)S[k[0]]=val;else S[k[0]][k[1]]=val}
document.addEventListener('input',e=>{const f=e.target.dataset.f;if(!f)return;setp(f,e.target.value);if(f==='busca'){const l=$('#lista');if(l)l.innerHTML=listaHtml()}});
document.addEventListener('change',async e=>{
  const t=e.target;
  if(t.dataset.f){setp(t.dataset.f,t.value);if(t.dataset.f==='v.cid'){const c=S.cli.find(x=>x.id===t.value);if(c){S.v.cnome=S.v.cnome||c.contatoNome||'';S.v.ctel=S.v.ctel||c.contatoTel||''}}if(t.dataset.r)render();return}
  if(t.dataset.ph&&t.files&&t.files.length){
    const key=t.dataset.ph,fl=[...t.files],lb=t.dataset.lb;S.up=key;render();let err=0;
    for(const f of fl){try{setp(key,[...arr(getp(key)),await foto(f,lb)]);render()}catch(e){err++}}
    if(err)toast(err+' foto(s) não puderam ser processadas. Tente novamente.');
    S.up=null;render();
  }
});
document.addEventListener('click',async e=>{
  const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,id=el.dataset.id;
  if(a==='pick'){const i=document.getElementById(id);if(i){i.value='';i.click()}return}
  if(a==='go'){S.view=id;scrollTo(0,0);render()}
  else if(a==='cli'){S.cid=id;S.view='cliente';scrollTo(0,0);render()}
  else if(a==='filtro'){S.filtro=id;render()}
  else if(a==='nova'){const c=id&&S.cli.find(x=>x.id===id);S.v={cid:c?c.id:'',cnome:c?c.contatoNome:'',ctel:c?c.contatoTel:''};S.cid=c?c.id:S.cid;S.view='visita';scrollTo(0,0);render()}
  else if(a==='st'){S.v.status=id;render()}
  else if(a==='rmph'){const l=arr(getp(id));l.splice(+el.dataset.i,1);setp(id,l);render()}
  else if(a==='zoom'){if(!el.src)return;$('#lb img').src=el.src;$('#lb').classList.add('on')}
  else if(a==='sair'){if(S.fila.length)return toast('Ainda há registros não enviados. Conecte-se à internet antes de sair.');sair()}
  else if(a==='lbClose'){$('#lb').classList.remove('on')}
  else if(a==='kmIni'||a==='kmFim')await salvarKm(a);
  else if(a==='salvar')await salvarVisita();
});
async function salvarKm(a){
  const d=hoje(),k=S.km.find(x=>x.data===d);
  if(a==='kmIni'){
    const v=parseInt(digits(S.kd.ini),10);if(!v)return toast('Informe o KM inicial.');if(!arr(S.kd.fini).length)return toast('Tire a foto do hodômetro.');
    const ult=[...S.km].filter(x=>x.kmFim!=null).sort((x,y)=>y.data<x.data?-1:1)[0];
    S.busy=true;render();
    try{const g=await gps();await put('km',S.uid+'_'+d,{gpsIni:g,uid:S.uid,data:d,kmIni:v,fotoIni:arr(S.kd.fini)[0],fotosIni:arr(S.kd.fini),hIni:Date.now(),kmFim:null,fotoFim:null,fotosFim:[],hFim:null,difAnterior:ult?v-ult.kmFim:null});S.kd={};toast('Dia iniciado. Boa rota!')}catch(e){toast('Erro ao salvar: '+(e.code||e.message))}
  }else{
    const v=parseInt(digits(S.kd.fim),10);if(!v)return toast('Informe o KM final.');if(v<k.kmIni)return toast('O KM final não pode ser menor que o inicial ('+nf(k.kmIni)+').');if(!arr(S.kd.ffim).length)return toast('Tire a foto do hodômetro.');
    S.busy=true;render();
    try{const g=await gps();const {id,...r}=k;await put('km',k.id,{...r,gpsFim:g,kmFim:v,fotoFim:arr(S.kd.ffim)[0],fotosFim:arr(S.kd.ffim),hFim:Date.now()});S.kd={};toast('Dia encerrado: '+nf(v-k.kmIni)+' km.')}catch(e){toast('Erro ao salvar: '+(e.code||e.message))}
  }
  S.busy=false;render();
}
async function salvarVisita(){
  const v=S.v,novo=v.cid==='__novo',c=S.cli.find(x=>x.id===v.cid);
  if(!novo&&!c)return toast('Selecione o cliente.');
  if(novo&&(!(v.nn||'').trim()||!(v.ncid||'').trim()))return toast('Informe nome e cidade do novo cliente.');
  if(novo&&!CIDS.has(v.ncid.trim()))return toast('Escolha a cidade na lista (ex.: Uberlândia - MG).');
  const prim=novo||!(c.nVisitas>0);
  if(prim&&(!arr(v.fachada).length||!arr(v.vitrine).length))return toast('Na primeira visita, as fotos da fachada e da vitrine são obrigatórias.');
  if(!(v.cnome||'').trim()||digits(v.ctel).length<10)return toast('Informe o nome e um telefone válido (com DDD) de quem atendeu.');
  if(!v.status)return toast('Selecione o resultado do atendimento.');
  if(v.status==='nv_preco'&&(!(v.forn||'').trim()||!(v.precos||'').trim()))return toast('Informe o fornecedor atual e os preços praticados.');
  if(v.ptipo&&!v.pdata)return toast('Informe a data e hora do próximo passo.');
  S.busy=true;render();
  try{
    const now=Date.now(),cid=novo?nid():c.id;
    const base=novo?{uid:S.uid,nome:v.nn.trim(),cidade:v.ncid.trim(),endereco:(v.nend||'').trim(),telefoneLoja:(v.ntel||'').trim(),criado:now,nVisitas:0}:(({id,...r})=>r)(c);
    const pr=v.ptipo?{proxTipo:v.ptipo,proxData:v.pdata}:{proxTipo:null,proxData:null};
    const preco=v.status==='nv_preco';
    const g=await gps();if(!g)toast('Visita salva sem localização: ative o GPS e permita o acesso à localização.');
    await put('visitas',nid(),{gps:g,uid:S.uid,clienteId:cid,clienteNome:base.nome,cidade:base.cidade,data:hoje(),ts:now,fotoFachada:arr(v.fachada)[0]||null,fotoVitrine:arr(v.vitrine)[0]||null,fotosFachada:arr(v.fachada),fotosVitrine:arr(v.vitrine),contatoNome:v.cnome.trim(),contatoTel:v.ctel.trim(),cargo:(v.cargo||'').trim(),status:v.status,obs:(v.obs||'').trim(),fornecedor:preco?v.forn.trim():null,precos:preco?v.precos.trim():null,...pr});
    await put('clientes',cid,{...base,status:v.status,ultima:now,contatoNome:v.cnome.trim(),contatoTel:v.ctel.trim(),nVisitas:(base.nVisitas||0)+1,fotoFachada:arr(v.fachada)[0]||base.fotoFachada||null,fotoVitrine:arr(v.vitrine)[0]||base.fotoVitrine||null,...pr});
    S.ok={cid,nome:base.nome,ts:now,status:v.status,contato:v.cnome+' '+v.ctel,local:base.endereco||base.cidade,...pr};S.v=null;S.view='ok';scrollTo(0,0);
  }catch(e){toast('Não foi possível salvar: '+(e.code||e.message))}
  S.busy=false;render();
}
function vLogin(){
  const semCfg=!CFG.API_URL||!CFG.GOOGLE_CLIENT_ID;
  return `<div class="card login"><h2>Entrar no app</h2><p class="mute">Use o e-mail Google cadastrado pela Villa Crocante.</p><div id="gbtn"></div>
  ${S.msg?`<p class="erro">${esc(S.msg)}</p>`:''}${semCfg?'<p class="erro">App ainda não configurado: preencha o arquivo config.js.</p>':''}</div>`;
}
let gsiOk=false;
function loginBtn(){
  if(!CFG.GOOGLE_CLIENT_ID)return;
  if(!window.google||!google.accounts||!google.accounts.id)return setTimeout(loginBtn,300);
  if(!gsiOk){google.accounts.id.initialize({client_id:CFG.GOOGLE_CLIENT_ID,callback:onCred,ux_mode:'popup',auto_select:false});gsiOk=true}
  const el=$('#gbtn');if(el&&!el.children.length)google.accounts.id.renderButton(el,{theme:'filled_black',size:'large',text:'signin_with',shape:'pill',locale:'pt-BR',width:280});
}
async function onCred(r){
  S.msg='Entrando…';render();
  try{
    const j=await api('login',{idToken:r.credential});
    const c=await idb.get('cache').catch(()=>null);
    if(!c||c.email!==j.email){S.km=[];S.cli=[];S.vis=[];S.fila=[];await idb.set('fila',[])}
    S.sess={token:j.token,email:j.email,nome:j.nome};await idb.set('sess',S.sess);
    S.uid=j.email;S.nome=j.nome;S.msg='';S.view='hoje';render();await carregar();sync();
  }catch(e){S.msg=e.message;render()}
}
async function sair(msg){S.sess=null;await idb.del('sess').catch(()=>{});S.msg=msg||'';gsiOk&&google.accounts.id.disableAutoSelect();render()}
async function carregar(){
  try{
    const j=await api('dados',{});
    S.km=j.km||[];S.cli=j.clientes||[];S.vis=j.visitas||[];
    for(const op of S.fila)upLocal(op.col,op.id,op.obj);
    salvarCache();if(!S.fila.length)S.msg='';
  }catch(e){
    if(e.code==='auth')return sair('Sua sessão expirou. Entre novamente.');
    S.msg='Sem conexão com o servidor: mostrando os dados salvos no aparelho.';
  }
  soft();
}
async function init(){
  document.body.insertAdjacentHTML('beforeend','<datalist id="dl-cid">'+[...CIDS].sort((a,b)=>a.localeCompare(b,'pt-BR')).map(c=>'<option value="'+esc(c)+'">').join('')+'</datalist>');
  try{
    S.sess=await idb.get('sess')||null;S.fila=await idb.get('fila')||[];S.map=await idb.get('map')||{};
    const c=await idb.get('cache');if(c&&S.sess&&c.email===S.sess.email){S.km=c.km||[];S.cli=c.cli||[];S.vis=c.vis||[]}
  }catch(e){}
  if(S.sess){S.uid=S.sess.email;S.nome=S.sess.nome}
  render();
  if(S.sess){await carregar();sync()}
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
}
init();
}
