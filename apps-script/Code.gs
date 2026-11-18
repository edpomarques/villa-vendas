/**
 * Villa Crocante – App de Vendas Externo – servidor (Google Apps Script)
 * Guarda os dados na planilha (abas KM, CLIENTES, VISITAS, PEDIDOS, METAS), as fotos no Google Drive
 * e envia o relatório D-1 por e-mail.
 *
 * Primeiro uso: menu "App Vendas" > "1. Configurar planilha" (ou rode a função setup).
 */
const TZ = 'America/Sao_Paulo';
const ST = {
  venda: 'Venda – negócio fechado', deg_ag: 'Degustação agendada', deg_re: 'Degustação realizada',
  negoc: 'Em negociação', nv_preco: 'Não venda – preço', nv_abertura: 'Não venda – sem abertura',
  nv_propria: 'Não venda – produção própria', nv_desist: 'Não venda – desistência'
};
const GRUPO = { venda: 'venda', deg_ag: 'degustacao', deg_re: 'degustacao', negoc: 'negociacao',
  nv_preco: 'nao_venda', nv_abertura: 'nao_venda', nv_propria: 'nao_venda', nv_desist: 'nao_venda' };
const CAB = {
  KM: ['id', 'email', 'vendedor', 'data', 'km_inicial', 'km_final', 'km_rodados', 'hora_inicio', 'hora_fim',
    'fotos_inicio', 'fotos_fim', 'gps_inicio', 'gps_fim', 'atualizado_em', 'json'],
  CLIENTES: ['id', 'email', 'vendedor', 'cliente', 'cidade', 'endereco', 'telefone_loja', 'status', 'status_descricao',
    'ultima_visita', 'contato', 'telefone_contato', 'n_visitas', 'proximo_tipo', 'proximo_data', 'foto_fachada',
    'foto_vitrine', 'criado_em', 'atualizado_em', 'json', 'periodicidade'],
  VISITAS: ['id', 'email', 'vendedor', 'data', 'hora', 'cliente_id', 'cliente', 'cidade', 'status', 'status_descricao',
    'contato', 'telefone_contato', 'cargo', 'fornecedor_atual', 'precos_praticados', 'observacao', 'proximo_tipo',
    'proximo_data', 'fotos_fachada', 'fotos_vitrine', 'gps', 'precisao_gps_m', 'atualizado_em', 'json'],
  RESUMO_DIARIO: ['data', 'vendedor', 'email', 'km_rodados', 'situacao_km', 'visitas', 'vendas', 'degustacoes',
    'negociacoes', 'nao_vendas', 'conversao_%', 'primeira_visita', 'ultima_visita', 'visitas_sem_gps', 'agenda_atrasada'],
  PEDIDOS: ['pedido_id', 'item', 'data', 'hora', 'email', 'vendedor', 'cliente_id', 'cliente', 'cidade', 'tabela_preco',
    'produto', 'embalagem', 'quantidade', 'preco_embalagem', 'subtotal', 'total_pedido', 'volumes_pedido', 'condicoes',
    'vigencia_precos', 'atualizado_em'],
  METAS: ['mes', 'email', 'vendedor', 'meta_valor_rs', 'meta_visitas', 'meta_clientes_novos'],
  VENDEDORES: ['email', 'nome', 'ativo', 'perfil'],
  CONFIG: ['chave', 'valor']
};
const COLS = { km: 'KM', clientes: 'CLIENTES', visitas: 'VISITAS' };
const ATIVO = /^(sim|s|true|ativo|1)$/i;
const PERIOD = { diario: 'Diário', '2xsem': '2x por semana', semanal: 'Semanal', quinzenal: 'Quinzenal', mensal: 'Mensal' };
const SCHEMA = '2';

/* ---------------- menu e configuração ---------------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('App Vendas')
    .addItem('1. Configurar planilha', 'setup')
    .addItem('2. Ativar relatório D-1 diário', 'instalarGatilho')
    .addItem('Enviar relatório D-1 agora', 'relatorioD1')
    .addItem('Enviar relatório de HOJE (teste)', 'relatorioHoje')
    .addSeparator()
    .addItem('3. Criar linhas de metas do mês', 'criarMetasMes')
    .addToUi();
}

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  ss.setSpreadsheetTimeZone(TZ);
  Object.keys(CAB).forEach(function (n) { garantirAba(n, ss); });
  ['Página1', 'Sheet1', 'Planilha1'].forEach(function (n) {
    const s = ss.getSheetByName(n);
    if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s);
  });
  const eu = Session.getEffectiveUser().getEmail();
  if (!getCfg('GOOGLE_CLIENT_ID')) setCfg('GOOGLE_CLIENT_ID', 'COLE_AQUI_O_ID_DO_CLIENTE_OAUTH');
  if (!getCfg('RELATORIO_EMAILS')) setCfg('RELATORIO_EMAILS', eu);
  if (!getCfg('HORA_RELATORIO')) setCfg('HORA_RELATORIO', '7');
  if (!getCfg('PASTA_FOTOS_ID')) setCfg('PASTA_FOTOS_ID', DriveApp.createFolder('Villa Crocante – Fotos App Vendas').getId());
  const v = ss.getSheetByName('VENDEDORES');
  if (v.getLastRow() < 2) v.appendRow([eu, 'Gestor (teste)', 'SIM']);
  try { SpreadsheetApp.getUi().alert('Planilha configurada. Agora preencha GOOGLE_CLIENT_ID na aba CONFIG e cadastre os vendedores na aba VENDEDORES.'); } catch (e) {}
}

function instalarGatilho() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'relatorioD1') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('relatorioD1').timeBased().everyDays(1).atHour(Number(getCfg('HORA_RELATORIO') || 7)).inTimezone(TZ).create();
  try { SpreadsheetApp.getUi().alert('Relatório D-1 ativado: todo dia por volta das ' + (getCfg('HORA_RELATORIO') || 7) + 'h para ' + getCfg('RELATORIO_EMAILS') + '.'); } catch (e) {}
}

/* ---------------- utilidades ---------------- */
let _ss = null, _cfg = null;
function planilha() {
  if (_ss) return _ss;
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  _ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  return _ss;
}
function aba(n) { return planilha().getSheetByName(n); }
/** Cria a aba com o cabeçalho, se ainda não existir (planilhas antigas ganham PEDIDOS sozinhas). */
function garantirAba(n, ss) {
  ss = ss || planilha();
  const sh = ss.getSheetByName(n) || ss.insertSheet(n);
  if (sh.getLastRow() === 0) {
    sh.appendRow(CAB[n]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, CAB[n].length).setFontWeight('bold').setBackground('#3a2416').setFontColor('#ffffff');
    const jc = CAB[n].indexOf('json');
    if (jc >= 0) sh.hideColumns(jc + 1);
  } else {
    // planilhas antigas: completa colunas novas no fim do cabeçalho
    const w = sh.getLastColumn();
    if (w < CAB[n].length) {
      const novas = CAB[n].slice(w);
      sh.getRange(1, w + 1, 1, novas.length).setValues([novas]).setFontWeight('bold').setBackground('#3a2416').setFontColor('#ffffff');
    }
  }
  return sh;
}
/** Atualiza a estrutura da planilha uma vez por versão do servidor. */
function migrar() {
  const p = PropertiesService.getScriptProperties();
  if (p.getProperty('SCHEMA') === SCHEMA) return;
  Object.keys(CAB).forEach(function (n) { garantirAba(n); });
  p.setProperty('SCHEMA', SCHEMA);
}
/** Menu: cria uma linha por vendedor ativo para o mês atual na aba METAS (não apaga nada). */
function criarMetasMes() {
  migrar();
  const mes = Utilities.formatDate(new Date(), TZ, 'yyyy-MM');
  const sh = garantirAba('METAS');
  const ja = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 2).getDisplayValues().map(function (r) { return mesNorm(r[0]) + '|' + String(r[1]).trim().toLowerCase(); }) : [];
  const sv = aba('VENDEDORES');
  const novos = (sv.getLastRow() > 1 ? sv.getRange(2, 1, sv.getLastRow() - 1, 4).getValues() : [])
    .filter(function (r) { return r[0] && ATIVO.test(String(r[2]).trim()) && !/^gestor$/i.test(String(r[3]).trim()) && ja.indexOf(mes + '|' + String(r[0]).trim().toLowerCase()) < 0; })
    .map(function (r) { return ["'" + mes, String(r[0]).trim().toLowerCase(), String(r[1] || '').trim(), '', '', '']; });
  if (novos.length) sh.getRange(sh.getLastRow() + 1, 1, novos.length, 6).setValues(novos);
  avisar(novos.length ? novos.length + ' linha(s) criadas em METAS para ' + mes + '. Preencha meta em R$, visitas e clientes novos.' : 'As metas de ' + mes + ' já existem na aba METAS.');
}
/** Aceita 2026-11, 11/2026 ou 01/11/2026 (quando a planilha converte para data). */
function mesNorm(v) {
  v = String(v).trim().replace(/^'/, '');
  let m = v.match(/^(\d{4})-(\d{1,2})/); if (m) return m[1] + '-' + ('0' + m[2]).slice(-2);
  m = v.match(/^(?:\d{1,2}\/)?(\d{1,2})\/(\d{4})$/); if (m) return m[2] + '-' + ('0' + m[1]).slice(-2);
  return v.slice(0, 7);
}
function lerMetas(filtroEmail) {
  const sh = aba('METAS');
  if (!sh || sh.getLastRow() < 2) return [];
  const num = function (v) { v = Number(String(v).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return isFinite(v) ? v : 0; };
  return sh.getRange(2, 1, sh.getLastRow() - 1, 6).getDisplayValues()
    .map(function (r) { return { mes: mesNorm(r[0]), email: String(r[1]).trim().toLowerCase(), valor: num(r[3]), visitas: num(r[4]), novos: num(r[5]) }; })
    .filter(function (m) { return /^\d{4}-\d{2}$/.test(m.mes) && m.email && (!filtroEmail || m.email === filtroEmail); });
}
function getCfg(k) {
  if (!_cfg) {
    _cfg = {};
    const sh = aba('CONFIG');
    if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) { _cfg[String(r[0]).trim()] = String(r[1]).trim(); });
  }
  return _cfg[k] || '';
}
function setCfg(k, v) {
  const sh = aba('CONFIG');
  const f = sh.getRange('A:A').createTextFinder(k).matchEntireCell(true).findNext();
  if (f) sh.getRange(f.getRow(), 2).setValue(v); else sh.appendRow([k, v]);
  _cfg = null;
}
function erro(msg, code) { const e = new Error(msg); e.code = code || 'erro'; return e; }
function saida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function txt(s) { s = s == null ? '' : String(s); return /^[=+\-@]/.test(s) ? "'" + s : s; }
function links(refs) {
  return (refs || []).filter(function (x) { return String(x).indexOf('d:') === 0; })
    .map(function (x) { return 'https://drive.google.com/file/d/' + String(x).slice(2) + '/view'; }).join('\n');
}
function mapa(g) { return g && g.lat != null ? 'https://maps.google.com/?q=' + g.lat + ',' + g.lng : ''; }
function dt(ts) { return ts ? new Date(ts) : ''; }
function hora(ts) { return ts ? Utilities.formatDate(new Date(ts), TZ, 'HH:mm') : ''; }

/* ---------------- web app ---------------- */
function doGet() { return saida({ ok: true, app: 'Villa Crocante Vendas – API' }); }

function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.acao === 'login') return saida(Object.assign({ ok: true }, login(b)));
    migrar();
    const u = sessao(b.token);
    let out;
    if (b.acao === 'dados') out = dados(u);
    else if (b.acao === 'foto') out = salvarFoto(u, b);
    else if (b.acao === 'salvar') out = salvar(u, b);
    else if (b.acao === 'painel') out = painel(u, b);
    else throw erro('Ação inválida', 'negado');
    return saida(Object.assign({ ok: true }, out));
  } catch (err) {
    return saida({ ok: false, erro: String(err && err.message || err), code: err && err.code || 'erro' });
  }
}

/* ---------------- login e sessão ---------------- */
function vendedor(email) {
  const c = CacheService.getScriptCache(), k = 'v_' + email, h = c.get(k);
  if (h) return h === '-' ? null : JSON.parse(h);
  const sh = aba('VENDEDORES');
  const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues() : [];
  const r = rows.find(function (x) { return String(x[0]).trim().toLowerCase() === email && ATIVO.test(String(x[2]).trim()); });
  const v = r ? { nome: String(r[1] || email).trim(), gestor: /^gestor$/i.test(String(r[3]).trim()) } : null;
  c.put(k, v ? JSON.stringify(v) : '-', v ? 300 : 60);
  return v;
}

function login(b) {
  if (!b.idToken) throw erro('Login ausente', 'auth');
  const r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(b.idToken), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw erro('Login Google inválido. Tente novamente.', 'auth');
  const t = JSON.parse(r.getContentText());
  if (t.aud !== getCfg('GOOGLE_CLIENT_ID')) throw erro('Este login não pertence ao app da Villa Crocante (confira o GOOGLE_CLIENT_ID).', 'auth');
  if (String(t.email_verified) !== 'true') throw erro('E-mail Google não verificado.', 'auth');
  const email = String(t.email).toLowerCase();
  const v = vendedor(email);
  if (!v) throw erro('O e-mail ' + email + ' não está autorizado. Peça ao gestor para cadastrá-lo na aba VENDEDORES.', 'auth');
  const token = Utilities.getUuid() + Utilities.getUuid().slice(0, 8);
  const p = PropertiesService.getScriptProperties();
  p.setProperty('s_' + token, JSON.stringify({ email: email, exp: Date.now() + 30 * 864e5 }));
  const tudo = p.getProperties();
  Object.keys(tudo).forEach(function (k) {
    if (k.indexOf('s_') === 0) { try { if (JSON.parse(tudo[k]).exp < Date.now()) p.deleteProperty(k); } catch (e) { p.deleteProperty(k); } }
  });
  return { token: token, email: email, nome: v.nome, gestor: v.gestor };
}

function sessao(token) {
  const raw = token && PropertiesService.getScriptProperties().getProperty('s_' + token);
  if (!raw) throw erro('Sessão expirada', 'auth');
  const s = JSON.parse(raw);
  if (s.exp < Date.now()) throw erro('Sessão expirada', 'auth');
  const v = vendedor(s.email);
  if (!v) throw erro('Acesso desativado', 'auth');
  return { email: s.email, nome: v.nome, gestor: v.gestor };
}

/* ---------------- dados ---------------- */
function ler(tab) {
  const sh = aba(tab), n = sh.getLastRow();
  if (n < 2) return [];
  const w = CAB[tab].length, jc = CAB[tab].indexOf('json');
  return sh.getRange(2, 1, n - 1, w).getValues().map(function (r) {
    try { const o = JSON.parse(r[jc]); o.id = String(r[0]); o.uid = String(r[1]).toLowerCase(); return o; } catch (e) { return null; }
  }).filter(Boolean);
}

function dados(u) {
  const mine = function (t) { return ler(t).filter(function (o) { return o.uid === u.email; }); };
  const vis = mine('VISITAS').sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); }).slice(0, 600);
  const km = mine('KM').sort(function (a, b) { return a.data < b.data ? 1 : -1; }).slice(0, 120);
  return { km: km, clientes: mine('CLIENTES'), visitas: vis, metas: lerMetas(u.email), gestor: u.gestor };
}

/** Painel do gestor: dados de toda a equipe no mês pedido (somente perfil GESTOR). */
function painel(u, b) {
  if (!u.gestor) throw erro('Acesso restrito ao gestor. Marque GESTOR na coluna perfil da aba VENDEDORES.', 'negado');
  const mes = /^\d{4}-\d{2}$/.test(String(b.mes)) ? String(b.mes) : Utilities.formatDate(new Date(), TZ, 'yyyy-MM');
  const sv = aba('VENDEDORES');
  const vend = (sv.getLastRow() > 1 ? sv.getRange(2, 1, sv.getLastRow() - 1, 4).getValues() : [])
    .filter(function (r) { return r[0] && ATIVO.test(String(r[2]).trim()) && !/^gestor$/i.test(String(r[3]).trim()); })
    .map(function (r) { return { email: String(r[0]).trim().toLowerCase(), nome: String(r[1] || r[0]).trim() }; });
  const todas = ler('VISITAS');
  const ultPed = {};
  todas.forEach(function (v) { if (v.pedido && v.pedido.total && (!ultPed[v.clienteId] || v.ts > ultPed[v.clienteId].ts)) ultPed[v.clienteId] = { ts: v.ts, total: v.pedido.total }; });
  const leve = function (v) { const o = Object.assign({}, v); delete o.fotosFachada; delete o.fotosVitrine; delete o.fotoFachada; delete o.fotoVitrine; return o; };
  const clientes = ler('CLIENTES').map(function (c) { const o = leve(c); if (ultPed[c.id]) { o.ultPedido = ultPed[c.id].ts; o.ultPedidoValor = ultPed[c.id].total; } return o; });
  return {
    mes: mes, vendedores: vend, metas: lerMetas().filter(function (m) { return m.mes === mes; }),
    visitas: todas.filter(function (v) { return String(v.data).slice(0, 7) === mes; }).map(leve),
    km: ler('KM').filter(function (k) { return String(k.data).slice(0, 7) === mes; }).map(function (k) { return { uid: k.uid, data: k.data, kmIni: k.kmIni, kmFim: k.kmFim }; }),
    clientes: clientes
  };
}

function linha(tab, id, o, u) {
  const now = new Date();
  const J = JSON.stringify(o);
  if (tab === 'KM') return [id, u.email, u.nome, o.data, o.kmIni, o.kmFim == null ? '' : o.kmFim,
    o.kmFim == null ? '' : o.kmFim - o.kmIni, dt(o.hIni), dt(o.hFim), links(o.fotosIni), links(o.fotosFim),
    mapa(o.gpsIni), mapa(o.gpsFim), now, J];
  if (tab === 'CLIENTES') return [id, u.email, u.nome, txt(o.nome), txt(o.cidade), txt(o.endereco), txt(o.telefoneLoja),
    o.status || '', ST[o.status] || '', dt(o.ultima), txt(o.contatoNome), txt(o.contatoTel), o.nVisitas || 0,
    o.proxTipo || '', o.proxData ? String(o.proxData).replace('T', ' ') : '', links([o.fotoFachada]), links([o.fotoVitrine]),
    dt(o.criado), now, J, PERIOD[o.periodicidade] || ''];
  return [id, u.email, u.nome, o.data, hora(o.ts), o.clienteId, txt(o.clienteNome), txt(o.cidade), o.status, ST[o.status] || '',
    txt(o.contatoNome), txt(o.contatoTel), txt(o.cargo), txt(o.fornecedor), txt(o.precos), txt(o.obs), o.proxTipo || '',
    o.proxData ? String(o.proxData).replace('T', ' ') : '', links(o.fotosFachada), links(o.fotosVitrine), mapa(o.gps),
    o.gps ? o.gps.acc : '', now, J];
}

function salvar(u, b) {
  const tab = COLS[b.col];
  if (!tab) throw erro('Tipo de registro inválido', 'negado');
  const id = String(b.id || '');
  if (!id) throw erro('Registro sem identificação', 'negado');
  const o = b.obj || {};
  delete o.id; o.uid = u.email;
  if (tab === 'KM' && o.kmFim != null && Number(o.kmFim) < Number(o.kmIni)) throw erro('KM final menor que o inicial', 'negado');
  if (tab === 'VISITAS' && !ST[o.status]) throw erro('Status de visita inválido', 'negado');
  if (tab === 'VISITAS') o.pedido = limparPedido(o.pedido);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = aba(tab);
    const row = linha(tab, id, o, u);
    const hit = sh.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext();
    if (hit) {
      const dono = String(sh.getRange(hit.getRow(), 2).getValue()).toLowerCase();
      if (dono !== u.email) throw erro('Este registro pertence a outro vendedor', 'negado');
      sh.getRange(hit.getRow(), 1, 1, row.length).setValues([row]);
    } else sh.appendRow(row);
    if (tab === 'VISITAS') gravarPedido(id, o, u);
  } finally { lock.releaseLock(); }
  return {};
}

/* ---------------- pedidos ---------------- */
/** Confere o pedido vindo do app e recalcula subtotais e total no servidor. */
function limparPedido(p) {
  if (!p || !Array.isArray(p.itens)) return null;
  const n = function (x) { x = Number(x); return isFinite(x) ? x : NaN; };
  const r2 = function (x) { return Math.round(x * 100) / 100; };
  const itens = p.itens.map(function (i) {
    const q = n(i.qtd), pr = n(i.preco);
    if (!(q > 0) || q !== Math.floor(q) || q > 9999 || !(pr >= 0) || pr > 99999) throw erro('Item de pedido inválido', 'negado');
    return { produto: String(i.produto || ''), msg: String(i.msg || i.produto || ''), emb: String(i.emb || ''), qtd: q, preco: r2(pr), sub: r2(q * pr), ordem: n(i.ordem) || 0 };
  });
  if (!itens.length) return null;
  return { tabela: String(p.tabela || ''), vigencia: String(p.vigencia || ''), cond: String(p.cond || ''), itens: itens,
    total: r2(itens.reduce(function (s, i) { return s + i.sub; }, 0)), volumes: itens.reduce(function (s, i) { return s + i.qtd; }, 0) };
}

/** Uma linha por item na aba PEDIDOS; regrava as linhas se a visita for reenviada. */
function gravarPedido(id, o, u) {
  const sh = garantirAba('PEDIDOS');
  const achados = sh.getRange('A:A').createTextFinder(id).matchEntireCell(true).findAll();
  achados.map(function (c) { return c.getRow(); }).filter(function (r) { return r > 1; })
    .sort(function (a, b) { return b - a; }).forEach(function (r) { sh.deleteRow(r); });
  const p = o.pedido;
  if (!p) return;
  const now = new Date();
  const rows = p.itens.map(function (i, k) {
    return [id, k + 1, o.data, hora(o.ts), u.email, u.nome, o.clienteId, txt(o.clienteNome), txt(o.cidade), txt(p.tabela),
      txt(i.msg), txt(i.emb), i.qtd, i.preco, i.sub, p.total, p.volumes, txt(p.cond), txt(p.vigencia), now];
  });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function salvarFoto(u, b) {
  const m = String(b.data || '').match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
  if (!m) throw erro('Foto inválida', 'negado');
  const nome = String(b.lid || Utilities.getUuid()).replace(/[^\w-]/g, '') + '.jpg';
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    let pasta = DriveApp.getFolderById(getCfg('PASTA_FOTOS_ID'));
    [u.nome, Utilities.formatDate(new Date(), TZ, 'yyyy-MM')].forEach(function (n) {
      const it = pasta.getFoldersByName(n); pasta = it.hasNext() ? it.next() : pasta.createFolder(n);
    });
    const ex = pasta.getFilesByName(nome);
    if (ex.hasNext()) return { id: ex.next().getId() };
    const f = pasta.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], nome));
    try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
    f.setDescription(u.email + ' · ' + (b.tipo || ''));
    return { id: f.getId() };
  } finally { lock.releaseLock(); }
}

/* ---------------- relatório D-1 ---------------- */
function relatorioHoje() {
  relatorioD1(Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'), true);
}

function avisar(t) { try { SpreadsheetApp.getUi().alert(t); } catch (e) {} }

function relatorioD1(diaOpcional, teste) {
  teste = teste === true;
  const dia = typeof diaOpcional === 'string' ? diaOpcional : Utilities.formatDate(new Date(Date.now() - 864e5), TZ, 'yyyy-MM-dd');
  const diaBr = dia.split('-').reverse().join('/');
  const agora = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm");
  const sv = aba('VENDEDORES');
  const vend = (sv.getLastRow() > 1 ? sv.getRange(2, 1, sv.getLastRow() - 1, 3).getValues() : [])
    .filter(function (r) { return r[0] && ATIVO.test(String(r[2]).trim()); })
    .map(function (r) { return { email: String(r[0]).trim().toLowerCase(), nome: String(r[1] || r[0]).trim() }; });
  const km = ler('KM').filter(function (o) { return o.data === dia; });
  const vis = ler('VISITAS').filter(function (o) { return o.data === dia; });
  const cli = ler('CLIENTES');

  const L = vend.map(function (v) {
    const k = km.find(function (x) { return x.uid === v.email; });
    const vv = vis.filter(function (x) { return x.uid === v.email; }).sort(function (a, b) { return a.ts - b.ts; });
    const g = function (s) { return vv.filter(function (x) { return GRUPO[x.status] === s; }).length; };
    return {
      v: v, kmR: k && k.kmFim != null ? k.kmFim - k.kmIni : '', kmSt: !k ? 'Não iniciado' : k.kmFim == null ? 'Não encerrado' : 'OK',
      n: vv.length, venda: g('venda'), deg: g('degustacao'), neg: g('negociacao'), nv: g('nao_venda'),
      conv: vv.length ? Math.round(g('venda') / vv.length * 100) : 0,
      ini: vv.length ? hora(vv[0].ts) : '', fim: vv.length ? hora(vv[vv.length - 1].ts) : '',
      semGps: vv.filter(function (x) { return !x.gps; }).length,
      atras: cli.filter(function (c) { return c.uid === v.email && c.proxData && c.proxData < agora; }).length
    };
  });

  // histórico na aba RESUMO_DIARIO (o teste de hoje não grava: o dia ainda não terminou)
  const rs = aba('RESUMO_DIARIO');
  if (!teste && rs.getLastRow() > 1) {
    const datas = rs.getRange(2, 1, rs.getLastRow() - 1, 1).getDisplayValues();
    for (let i = datas.length - 1; i >= 0; i--) if (datas[i][0] === dia || datas[i][0] === diaBr) rs.deleteRow(i + 2);
  }
  if (!teste) L.forEach(function (x) {
    rs.appendRow(["'" + dia, x.v.nome, x.v.email, x.kmR, x.kmSt, x.n, x.venda, x.deg, x.neg, x.nv, x.conv, x.ini, x.fim, x.semGps, x.atras]);
  });

  // e-mail
  const T = L.reduce(function (a, x) { a.km += Number(x.kmR || 0); a.n += x.n; a.venda += x.venda; a.deg += x.deg; a.neg += x.neg; a.nv += x.nv; return a; },
    { km: 0, n: 0, venda: 0, deg: 0, neg: 0, nv: 0 });
  const reais = function (v) { return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  T.ped = vis.reduce(function (s, x) { return s + (x.pedido && x.pedido.total || 0); }, 0);
  const conv = T.n ? Math.round(T.venda / T.n * 100) : 0;
  const esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  const th = 'style="text-align:left;padding:8px;background:#3a2416;color:#fff;font-size:12px"';
  const td = 'style="padding:8px;border-bottom:1px solid #e4dacb;font-size:13px"';
  const tdr = 'style="padding:8px;border-bottom:1px solid #e4dacb;font-size:13px;text-align:right"';
  const card = function (rot, val) { return '<td style="padding:10px 14px;background:#f4f1ec;border-radius:8px;text-align:center"><div style="font-size:22px;font-weight:800">' + val + '</div><div style="font-size:12px;color:#6f5e50">' + rot + '</div></td>'; };
  const alerta = function (x) {
    const a = [];
    if (x.kmSt !== 'OK') a.push('KM ' + x.kmSt.toLowerCase());
    if (x.n === 0) a.push('sem visitas');
    if (x.semGps) a.push(x.semGps + ' sem GPS');
    if (x.atras) a.push(x.atras + ' agenda(s) atrasada(s)');
    return a.length ? '<span style="color:#b42318">' + a.join(' · ') + '</span>' : '<span style="color:#1f7a45">OK</span>';
  };
  let h = '<div style="font-family:Arial,sans-serif;color:#22160d;max-width:760px">';
  h += '<div style="background:#3a2416;color:#fff;padding:16px 18px;border-radius:10px 10px 0 0"><div style="font-size:20px;font-weight:800">Vendas externas · ' + diaBr + '</div><div style="font-size:13px;opacity:.8">' + (teste ? 'TESTE · dados de hoje até ' + agora.slice(11) + ' (parcial)' : 'Relatório D-1') + ' · Villa Crocante</div></div>';
  h += '<table style="border-collapse:separate;border-spacing:8px;margin:8px 0"><tr>' + card('Visitas', T.n) + card('Vendas', T.venda) + card('Conversão', conv + '%') + card('Degustações', T.deg) + card('Não vendas', T.nv) + card('KM rodados', T.km) + card('Pedidos', reais(T.ped)) + '</tr></table>';
  h += '<h3 style="margin:16px 0 6px">Por vendedor</h3><table style="border-collapse:collapse;width:100%"><tr><th ' + th + '>Vendedor</th><th ' + th + '>KM</th><th ' + th + '>Visitas</th><th ' + th + '>Vendas</th><th ' + th + '>Degust.</th><th ' + th + '>Negoc.</th><th ' + th + '>Não venda</th><th ' + th + '>Conv.</th><th ' + th + '>1ª / última</th><th ' + th + '>Alertas</th></tr>';
  L.forEach(function (x) {
    h += '<tr><td ' + td + '><b>' + esc(x.v.nome) + '</b></td><td ' + tdr + '>' + (x.kmR === '' ? '–' : x.kmR) + '</td><td ' + tdr + '>' + x.n + '</td><td ' + tdr + '>' + x.venda + '</td><td ' + tdr + '>' + x.deg + '</td><td ' + tdr + '>' + x.neg + '</td><td ' + tdr + '>' + x.nv + '</td><td ' + tdr + '>' + x.conv + '%</td><td ' + td + '>' + (x.ini ? x.ini + ' – ' + x.fim : '–') + '</td><td ' + td + '>' + alerta(x) + '</td></tr>';
  });
  h += '</table>';
  const nv = vis.filter(function (x) { return GRUPO[x.status] === 'nao_venda'; });
  if (nv.length) {
    const mot = {};
    nv.forEach(function (x) { mot[x.status] = (mot[x.status] || 0) + 1; });
    h += '<h3 style="margin:18px 0 6px">Motivos de não venda</h3><table style="border-collapse:collapse;width:100%">';
    Object.keys(mot).sort(function (a, b) { return mot[b] - mot[a]; }).forEach(function (k) { h += '<tr><td ' + td + '>' + esc(ST[k]) + '</td><td ' + tdr + '><b>' + mot[k] + '</b></td></tr>'; });
    h += '</table>';
  }
  const pr = vis.filter(function (x) { return x.status === 'nv_preco'; });
  if (pr.length) {
    const nomeDe = function (e) { const v = vend.find(function (y) { return y.email === e; }); return v ? v.nome : e; };
    h += '<h3 style="margin:18px 0 6px">Concorrência – perdas por preço</h3><table style="border-collapse:collapse;width:100%"><tr><th ' + th + '>Cliente</th><th ' + th + '>Fornecedor atual</th><th ' + th + '>Preços praticados</th><th ' + th + '>Vendedor</th></tr>';
    pr.forEach(function (x) { h += '<tr><td ' + td + '>' + esc(x.clienteNome) + '<br><span style="color:#6f5e50">' + esc(x.cidade) + '</span></td><td ' + td + '>' + esc(x.fornecedor) + '</td><td ' + td + '>' + esc(x.precos) + '</td><td ' + td + '>' + esc(nomeDe(x.uid)) + '</td></tr>'; });
    h += '</table>';
  }
  const vendas = vis.filter(function (x) { return x.status === 'venda'; });
  if (vendas.length) {
    h += '<h3 style="margin:18px 0 6px">Negócios fechados</h3><ul style="font-size:13px;padding-left:18px">';
    vendas.forEach(function (x) { h += '<li>' + esc(x.clienteNome) + ' (' + esc(x.cidade) + ')' + (x.pedido ? ' – <b>pedido ' + reais(x.pedido.total) + '</b>, ' + x.pedido.volumes + ' vol., tabela ' + esc(x.pedido.tabela) : ' – sem pedido') + (x.obs ? ' – ' + esc(x.obs) : '') + '</li>'; });
    h += '</ul>';
  }
  h += '<p style="font-size:12px;color:#6f5e50;margin-top:18px">Detalhes, fotos e localização nas abas VISITAS, PEDIDOS, KM e RESUMO_DIARIO da planilha: <a href="' + planilha().getUrl() + '">abrir planilha</a>.</p></div>';

  const para = getCfg('RELATORIO_EMAILS');
  if (!para) return avisar('Relatório não enviado: preencha RELATORIO_EMAILS na aba CONFIG.');
  MailApp.sendEmail({ to: para, subject: (teste ? '[TESTE] ' : '') + 'Villa Crocante · Vendas externas · ' + (teste ? 'HOJE ' : 'D-1 ') + diaBr + ' · ' + T.n + ' visitas, ' + T.venda + ' vendas', htmlBody: h, name: 'App Vendas Villa Crocante' });
  avisar('Relatório ' + (teste ? 'de teste (hoje, ' : '(') + diaBr + ') enviado para: ' + para);
}
