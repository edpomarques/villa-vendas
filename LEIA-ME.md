# App de Vendas Externo – Villa Crocante
Versão definitiva: um app que o vendedor instala no celular e que grava tudo numa planilha Google da Villa.
São quatro peças:

| Peça | Onde fica | Arquivos |
|---|---|---|
| App do vendedor | GitHub Pages (grátis) | raiz do repositório (exceto a pasta `apps-script/`) |
| Dados | Planilha Google: abas KM, CLIENTES, VISITAS, RESUMO_DIARIO, VENDEDORES e CONFIG | criadas automaticamente |
| Fotos | Pasta do Google Drive "Villa Crocante – Fotos App Vendas", separada por vendedor e por mês | criada automaticamente |
| Servidor e relatório D-1 | Apps Script ligado à planilha | `apps-script/Code.gs` |

Tempo total: cerca de 30 minutos, uma única vez. Faça tudo logado na **conta Google da empresa**, que será a dona dos dados.

---

## Parte 1 – Planilha e servidor (Google)
1. Acesse sheets.new e crie uma planilha chamada **Villa Crocante – App Vendas**.
2. Na planilha, abra o menu **Extensões > Apps Script**.
3. Apague o conteúdo do arquivo `Código.gs`, cole todo o conteúdo de `apps-script/Code.gs` e clique em **Salvar** (ícone de disquete).
4. No topo do editor, escolha a função **setup** e clique em **Executar**.
   - O Google pede autorização: clique em **Revisar permissões**, escolha a conta da empresa, depois **Avançado > Acessar (não seguro)** e **Permitir**. O aviso aparece porque o script é seu e não passou por verificação do Google.
5. Volte à planilha. As abas foram criadas, e o menu **App Vendas** aparece a partir da próxima vez que a planilha for aberta.

## Parte 2 – Login com Google (Google Cloud, 1 vez)
1. Acesse console.cloud.google.com, logado na mesma conta, e crie um projeto chamado **Villa Vendas**.
2. Vá em **APIs e serviços > Tela de consentimento OAuth** (ou **Google Auth Platform**):
   - Tipo: **Externo**. Nome do app: *Villa Crocante Vendas*. E-mail de suporte: o seu.
   - Em **Público-alvo**, clique em **Publicar app**. Sem isso, você precisa cadastrar cada vendedor como "usuário de teste". O app só pede nome e e-mail, então o Google não exige verificação.
3. Vá em **Credenciais > Criar credenciais > ID do cliente OAuth**:
   - Tipo: **Aplicativo da Web**.
   - Em **Origens JavaScript autorizadas**, informe exatamente `https://edpomarques.github.io`, sem barra no final.
   - Clique em **Criar** e copie o **ID do cliente**, que termina em `.apps.googleusercontent.com`.
4. Na planilha, aba **CONFIG**, cole esse ID no valor de `GOOGLE_CLIENT_ID`.

## Parte 3 – Publicar o servidor
1. No editor do Apps Script, clique em **Implantar > Nova implantação**.
2. Clique na engrenagem e escolha **App da Web**. Preencha:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
3. Clique em **Implantar** e copie a **URL do app da Web**, que termina em `/exec`.

> Isso não deixa os dados abertos: o servidor só grava para quem entra com um e-mail cadastrado na aba VENDEDORES.
> Se você alterar o `Code.gs` depois, use **Implantar > Gerenciar implantações > editar (lápis) > Versão: Nova versão**. Assim a URL continua a mesma.

## Parte 4 – Publicar o app (GitHub Pages)
1. No GitHub, clique em **+ > New repository**. Nome: `villa-vendas`, visibilidade **Public**, e clique em **Create repository**.
2. Clique em **uploading an existing file** e arraste os arquivos do app (`index.html`, `app.js`, `styles.css`, `sw.js`, `config.js`, `manifest.webmanifest`) e a pasta `icons`. A pasta `apps-script/` guarda só uma cópia do servidor e não é usada pelo app. Depois clique em **Commit changes**.
3. Abra o arquivo `config.js` no GitHub e clique no lápis para editar:
   - `API_URL`: a URL `/exec` da Parte 3
   - `GOOGLE_CLIENT_ID`: o ID da Parte 2
   - Clique em **Commit changes**.
4. Vá em **Settings > Pages**. Em Source, escolha **Deploy from a branch**, branch **main**, pasta **/(root)**, e clique em **Save**.
5. Em 1 a 2 minutos o app fica no ar em: `https://edpomarques.github.io/villa-vendas/`

## Parte 5 – Cadastrar vendedores e ativar o relatório
1. Na aba **VENDEDORES**, preencha uma linha por pessoa: e-mail Gmail, nome e **SIM** na coluna ativo. Para bloquear alguém, troque para **NÃO**; o bloqueio vale em até 5 minutos.
2. No menu **App Vendas**, clique em **2. Ativar relatório D-1 diário**. O relatório chega todo dia às 7h para os e-mails da aba CONFIG (`RELATORIO_EMAILS`). Para incluir o sócio, separe os e-mails com vírgula. Para mudar o horário, altere `HORA_RELATORIO` e ative de novo.
3. Para testar: **App Vendas > Enviar relatório de HOJE (teste)**. Mostra os registros feitos hoje até o momento, com "[TESTE]" no assunto, e não grava na aba RESUMO_DIARIO. **Enviar relatório D-1 agora** reenvia o relatório de ontem.

## Parte 6 – Instalar no celular do vendedor
- **Android (Chrome):** abra o link, toque nos ⋮ e depois em **Instalar app** ou **Adicionar à tela inicial**.
- **iPhone (Safari):** abra o link, toque em **Compartilhar** e depois em **Adicionar à Tela de Início**.
- No primeiro uso: toque em **Fazer login com o Google** e **permita a localização**. A câmera abre pelo botão "Tirar foto".

---

## Como o app funciona
- **Login:** pelo Gmail cadastrado. A sessão dura 30 dias. Cada vendedor só vê e grava os próprios dados, e o servidor bloqueia alterações em registros de outro vendedor.
- **Sem internet:** os registros e as fotos ficam guardados no celular e são enviados sozinhos quando o sinal volta. Enquanto houver pendências, aparece um aviso no topo, e o vendedor não consegue sair da conta.
- **Provas da visita:** as fotos recebem uma marca com vendedor, data e hora. Cada visita grava a localização GPS, com link para o mapa na planilha. Visitas sem GPS aparecem como alerta no relatório.
- **Relatório D-1:** KM rodados, visitas, vendas, degustações, negociações, não vendas, conversão, horário da primeira e da última visita, alertas (KM não encerrado, sem GPS, agenda atrasada), motivos de não venda e preços da concorrência. Todo dia o histórico também é gravado na aba RESUMO_DIARIO.

## Problemas comuns
| Sintoma | Causa e solução |
|---|---|
| "App ainda não configurado" | `config.js` está sem `API_URL` ou sem `GOOGLE_CLIENT_ID`. |
| Botão Google não aparece ou dá erro de origem | A origem `https://edpomarques.github.io` não foi cadastrada no Google Cloud (Parte 2.3). |
| "Este login não pertence ao app" | O `GOOGLE_CLIENT_ID` da aba CONFIG é diferente do que está no `config.js`. |
| "E-mail não autorizado" | Cadastre o e-mail na aba VENDEDORES com SIM. Pode levar 1 minuto para valer. |
| Fotos não aparecem no app | A conta da empresa bloqueia compartilhamento por link no Drive. As fotos continuam salvas na pasta, e os links estão na planilha. |
