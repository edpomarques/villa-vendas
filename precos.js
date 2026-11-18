/* =====================================================================
   TABELA DE PREÇOS – Villa Crocante · Simulador de Pedidos Vendedores
   Espelho do simulador do chat (3 tabelas: Especial 1, Padrão, Especial 2).

   COMO ATUALIZAR (só este arquivo muda):
   - precos: [Especial 1, Padrão, Especial 2], preço por "por"
       (por unidade, por pedaço, por kg ou por pacote de 800 g)
   - emb.mult: quantas vezes o preço base cabe na embalagem
       pct 5 un = 5 · placa 6 pedaços = 6 · pct 2 kg de pão de queijo = 2,5
       mini salgado 800 g = 0,8 (preço por kg × 0,8)
     Preço da embalagem = preço base × mult (ex.: 4,80 × 5 = R$ 24,00)
   - msg: nome que sai na mensagem do WhatsApp e na planilha
   - ordem: ordem dos itens na mensagem do pedido
   - foraDaTabela: true → aparece só como "consultar a fábrica"
   Depois de mudar, troque "vigencia" e publique. Os celulares recebem a
   tabela nova na próxima vez que abrirem o app com internet.
   ===================================================================== */
window.VILLA_PRECOS = {
  vigencia: 'Novembro/2026',
  tabelas: ['Especial 1', 'Padrão', 'Especial 2'],
  tabelaPadrao: 1,
  whatsappComercial: '5534996864588',
  aviso: 'Preço fora das 3 tabelas só com autorização por escrito da diretoria.',
  categorias: [
    { nome: 'Salgados assados', itens: [
      { nome: 'Pão Pizza', msg: 'Pão Pizza', ordem: 9, por: 'unidade', precos: [4.90, 5.00, 5.25], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Esfirra de Carne', msg: 'Esfirra', ordem: 4, por: 'unidade', precos: [5.50, 5.50, 5.80], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Enroladinho de Salsicha', msg: 'Enroladinho de Salsicha', ordem: 2, por: 'unidade', precos: [4.70, 4.80, 5.05], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Enroladinho de Presunto e Mussarela', msg: 'Enroladinho do PM', ordem: 1, por: 'unidade', precos: [4.90, 5.00, 5.25], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Enroladinho de Calabresa', msg: 'Calabresa', ordem: 3, por: 'unidade', precos: [4.70, 4.80, 5.05], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Hambúrguer', msg: 'Hamburguer de Carne', ordem: 5, por: 'unidade', precos: [4.90, 5.00, 5.25], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Franbacon', msg: 'Franbacon', ordem: 6, por: 'unidade', precos: [4.70, 4.80, 5.05], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Empada de Frango', msg: 'Empada', ordem: 8, por: 'unidade', precos: [5.40, 5.50, 5.80], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Trouxinha de Frango', msg: 'Trouxinha de Frango', ordem: 7, por: 'unidade', precos: [5.40, 5.50, 5.80], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Torta de Frango (placa)', msg: 'Torta de Frango PLACA', ordem: 11, por: 'pedaço', precos: [5.80, 5.80, 6.10], emb: [{ tipo: 'placa 6 pedaços', mult: 6 }] }
    ] },
    { nome: 'Salgados fritos', itens: [
      { nome: 'Coxinha de Frango', msg: 'Coxinha de Frango', ordem: 16, por: 'unidade', precos: [4.70, 4.80, 5.05], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Coxinha de Frango com Requeijão', msg: 'Coxinha de Requeijão', ordem: 17, por: 'unidade', precos: [4.70, 4.80, 5.05], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Maia de Carne', msg: 'Maia de Carne Bovina', ordem: 18, por: 'unidade', precos: [5.80, 5.80, 6.10], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Quibe de Requeijão Puro', msg: 'Quibe com Requeijão', ordem: 19, por: 'unidade', precos: [5.40, 5.50, 5.80], emb: [{ tipo: 'pct 5 un', mult: 5 }] }
    ] },
    { nome: 'Salgados especiais', itens: [
      { nome: 'Enroladinho de Queijo Minas', msg: 'Enroladinho de Queijo', ordem: 15, por: 'unidade', precos: [5.40, 5.50, 5.80], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Hambúrguer de Cheddar Artesanal', msg: 'Hamburguer Cheddar', ordem: 12, por: 'unidade', precos: [5.40, 5.50, 5.80], emb: [{ tipo: 'pct 5 un', mult: 5 }] },
      { nome: 'Torta de Frango Individual', msg: 'Torta de Frango', ordem: 10, por: 'unidade', precos: [5.80, 5.80, 6.10], emb: [{ tipo: 'pct 5 un', mult: 5 }] }
    ] },
    { nome: 'Pão de queijo', itens: [
      { nome: 'Pão de Queijo Empanado', msg: 'Pão de queijo Empanado 30g', ordem: 21, por: 'pct 800 g', precos: [17.50, 17.50, 18.40], emb: [{ tipo: 'pct 800 g', mult: 1, aprox: 27 }, { tipo: 'pct 2 kg', mult: 2.5, aprox: 68 }] },
      { nome: 'Pão de Queijo Coquetel', msg: 'Pão de queijo coquetel 30 g', ordem: 22, por: 'pct 800 g', precos: [16.00, 16.00, 16.80], emb: [{ tipo: 'pct 800 g', mult: 1, aprox: 27 }, { tipo: 'pct 2 kg', mult: 2.5, aprox: 68 }] },
      { nome: 'Pão de Queijo Pipoquinha 20 g', foraDaTabela: true },
      { nome: 'Pão de Queijo Lanche 100 g', msg: 'Pão de queijo BIG 100 g', ordem: 23, por: 'pct 800 g', precos: [16.00, 16.00, 16.80], emb: [{ tipo: 'pct 800 g', mult: 1, aprox: 8 }, { tipo: 'pct 2 kg', mult: 2.5, aprox: 20 }] },
      { nome: 'Biscoito de Queijo Ferradura 35 g', msg: 'Biscoito ferradura', ordem: 25, por: 'pct 800 g', precos: [16.00, 16.00, 16.80], emb: [{ tipo: 'pct 800 g', mult: 1, aprox: 27 }, { tipo: 'pct 2 kg', mult: 2.5, aprox: 68 }] }
    ] },
    { nome: 'Mini salgados', itens: [
      { nome: 'Mini Coxinha', msg: 'Mini Coxinha de Frango', ordem: 28, por: 'kg', precos: [24.40, 24.90, 26.15], emb: [{ tipo: 'pct 800 g', mult: 0.8, aprox: 23 }] },
      { nome: 'Mini Quibe', msg: 'Mini Quibe', ordem: 30, por: 'kg', precos: [24.40, 24.90, 26.15], emb: [{ tipo: 'pct 800 g', mult: 0.8, aprox: 23 }] },
      { nome: 'Mini Travesseirinho', msg: 'Mini Bolinha PM', ordem: 29, por: 'kg', precos: [24.40, 24.90, 26.15], emb: [{ tipo: 'pct 800 g', mult: 0.8, aprox: 23 }] },
      { nome: 'Mini Bolinha de Queijo', msg: 'Mini Bolinha queijo', ordem: 31, por: 'kg', precos: [24.40, 24.90, 26.15], emb: [{ tipo: 'pct 800 g', mult: 0.8, aprox: 23 }] },
      { nome: 'Mini Churro', msg: 'Mini churro', ordem: 32, por: 'kg', precos: [24.40, 24.90, 26.15], emb: [{ tipo: 'pct 800 g', mult: 0.8, aprox: 23 }] }
    ] }
  ]
};
