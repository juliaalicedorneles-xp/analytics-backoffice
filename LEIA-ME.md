# Analytics Backoffice: como colocar no ar

São 4 etapas: (1) pegar a chave no Pipefy, (2) criar o repositório no GitHub e subir os arquivos, (3) guardar a chave do Pipefy no GitHub, (4) ligar o site e rodar a primeira vez. No fim tem o passo para virar administrador dos Ajustes.

**Ainda não tem a chave do Pipefy?** Pule a Etapa 1 e a Etapa 3 e siga o "Plano B" logo abaixo. O painel funciona com a planilha publicada por você, e quando a chave chegar é só fazer a Etapa 1 e a Etapa 3.

## Plano B: sem chave do Pipefy (você publica a planilha)

1. Faça a **Etapa 2** (repositório e arquivos) e a **Etapa 4**, passos 4.1 a 4.3 (ligar o site).
2. Faça o passo **"Virar administrador dos Ajustes"** (lá no fim).
3. Abra o painel. Como admin, o botão amarelo vira **"Publicar Excel para o time"**.
4. Exporte o Excel do Pipefy como sempre, clique no botão e escolha o arquivo.
5. Em cerca de 1 minuto, todo mundo que abrir o link vê os números novos, com a etiqueta **"Planilha do Pipefy"** e o horário da publicação. Quem não é admin não vê o botão.

Repita o passo 4 sempre que quiser atualizar (por exemplo, todo dia de manhã e no fim da tarde). Títulos de card que parecem nome (e não código, como CARD-001) são trocados por "Card N" antes de publicar.

Tempo total: uns 20 minutos. Faça pelo computador.

---

## Etapa 1: pegar a chave no Pipefy (Conta de Serviço)

O Pipefy não recomenda mais os "tokens pessoais" para integrações. O jeito atual é criar uma **Conta de Serviço**, que é um "usuário robô" só para o painel ler os cards.

Só quem é **Super Admin** da organização no Pipefy consegue criar. Se você for só Admin, peça a um Super Admin para fazer os passos 1.1 a 1.8 e te passar as 3 informações do passo 1.7. Enquanto isso, use o Plano B.

**Alternativa (token pessoal, pode não estar disponível):** alguns Admins ainda conseguem gerar um token pessoal em Pipefy › sua foto › Preferências da conta › Tokens de acesso pessoal. O Pipefy descontinuou esse tipo de token, então ele pode não aparecer ou parar de funcionar. Se aparecer, gere um token e, na Etapa 3, crie só um segredo chamado `PIPEFY_TOKEN` com ele (no lugar dos três).

1.1. Entre no Pipefy pelo computador.
1.2. Clique no **nome da empresa** ou na **sua foto**, no alto da tela, e depois em **Membros e permissões** (Members and Permissions).
1.3. Abra a aba **Contas de serviço** (Service Accounts).
1.4. Clique em **Criar conta de serviço** (Create Service Account).
1.5. Preencha: nome `painel backoffice` (até 20 letras), descrição opcional, papel **Membro** (ou Admin, se Membro não enxergar o pipe) e validade do token no **máximo** (30 dias). O painel renova o token sozinho, então a validade curta não atrapalha.
1.6. Salve.
1.7. Clique na conta que você acabou de criar. Vão aparecer três informações. Copie as três para um bloco de notas:
   - **Client ID**
   - **Client Secret** (trate como senha)
   - **Endpoint do token** (token endpoint, um endereço que começa com https://)
1.8. Dê acesso ao pipe: abra o pipe **306826478**, vá em **Membros** (ícone de pessoas no alto do pipe) e convide a conta de serviço pelo e-mail dela (aparece na lista de contas de serviço). Dê papel de **Membro** ou maior.

---

## Etapa 2: criar o repositório no GitHub e subir os arquivos

2.1. Crie uma conta grátis em **github.com**, se ainda não tiver. Escolha bem o nome de usuário, porque ele vai aparecer no endereço do site.
2.2. Logado, clique no **+** no canto de cima, à direita, e em **New repository**.
2.3. Preencha:
   - Repository name: `analytics-backoffice`
   - Marque **Public** (o site grátis do GitHub só funciona com repositório público)
   - Não marque mais nada. Clique em **Create repository**.
2.4. **Descompacte o zip** no computador. Vai aparecer uma pasta com: `index.html`, `config.json`, `LEIA-ME.md`, a pasta `scripts`, a pasta `.github` e o arquivo `.nojekyll`.
   - **No Mac**, as coisas que começam com ponto ficam escondidas. Com a pasta aberta no Finder, aperte **Cmd + Shift + .** (ponto) para elas aparecerem.
   - **No Windows**, elas já aparecem normalmente.
2.5. Na página do repositório recém-criado, clique no link **uploading an existing file**.
2.6. Selecione **tudo** o que está dentro da pasta descompactada (inclusive `.github` e `.nojekyll`) e arraste para a área de upload. Arraste o conteúdo, não a pasta de fora.
2.7. Espere carregar e clique em **Commit changes**, o botão verde embaixo.
2.8. **Confira:** a página do repositório deve listar `.github`, `scripts`, `.nojekyll`, `config.json`, `index.html` e `LEIA-ME.md`. Se a pasta `.github` não aparecer, veja "Problemas comuns" no fim.

---

## Etapa 3: guardar a chave do Pipefy no GitHub

A chave fica guardada em segredo no GitHub. Ela nunca aparece no site nem para quem abre o repositório.

3.1. No repositório, clique em **Settings** (aba com engrenagem, no alto).
3.2. No menu da esquerda: **Secrets and variables** > **Actions**.
3.3. Clique em **New repository secret** e crie os três segredos abaixo, um de cada vez. O nome tem que ser exatamente este, em maiúsculas:

| Name                   | Secret (o que colar)                  |
|------------------------|---------------------------------------|
| `PIPEFY_CLIENT_ID`     | o Client ID do passo 1.7              |
| `PIPEFY_CLIENT_SECRET` | o Client Secret do passo 1.7          |
| `PIPEFY_TOKEN_URL`     | o endpoint do token do passo 1.7      |

3.4. Ainda em **Settings**, vá em **Actions** > **General**. Role até **Workflow permissions**, marque **Read and write permissions** e clique em **Save**. Isso deixa o robô gravar os dados novos no repositório.

---

## Etapa 4: ligar o site e rodar a primeira vez

4.1. Em **Settings**, clique em **Pages** no menu da esquerda.
4.2. Em **Build and deployment** > **Source**, escolha **Deploy from a branch**.
4.3. Em **Branch**, escolha **main** e a pasta **/ (root)**. Clique em **Save**.
4.4. Vá na aba **Actions** (no alto do repositório). Se aparecer um aviso pedindo para habilitar os workflows, clique no botão verde para habilitar.
4.5. Na lista da esquerda, clique em **Atualizar dados do Pipefy (Analytics Backoffice)**.
4.6. À direita, clique em **Run workflow** e de novo no botão verde **Run workflow**.
4.7. Espere 1 ou 2 minutos. A execução deve ficar com um **✓ verde**. Se ficar com **X vermelho**, clique nela, depois em **atualizar** e leia a mensagem em português no final (veja "Problemas comuns").
4.8. Volte na aba **Code**: agora existe o arquivo `dados.json`. São os seus cards.
4.9. Abra o painel em:

**https://SEU-USUARIO.github.io/analytics-backoffice/**

(troque SEU-USUARIO pelo seu nome de usuário do GitHub). No topo deve aparecer a etiqueta amarela **"Ao vivo do Pipefy"**, e o botão do Excel some.

A partir daí, o painel se atualiza sozinho: a cada 15 minutos de segunda a sexta, das 7h às 21h, e uma vez por dia no fim de semana. Não precisa fazer mais nada.

---

## Opcional: virar administrador dos Ajustes

Com isso, só você consegue mudar meta, SLA, analistas, feriados etc. O resto do time abre o painel e só vê.

5.1. No GitHub, clique na sua foto (canto de cima, à direita) > **Settings**.
5.2. No fim do menu da esquerda: **Developer settings** > **Personal access tokens** > **Fine-grained tokens** > **Generate new token**.
5.3. Preencha:
   - Token name: `admin painel`
   - Expiration: 1 ano (ou o que preferir)
   - Repository access: **Only select repositories** > escolha `analytics-backoffice`
   - Permissions > Repository permissions > **Contents**: **Read and write**
5.4. Clique em **Generate token** e copie a chave (ela aparece uma vez só).
5.5. Abra o painel, clique em **Ajustes**, cole a chave e clique em **Entrar**. Um pontinho amarelo no botão Ajustes mostra que você está como admin.
5.6. Mude o que quiser e clique em **Salvar ajustes**. Em cerca de 1 minuto passa a valer para todo mundo.

A chave de admin fica salva só no navegador onde você entrou. Use no seu computador ou celular, nunca num computador compartilhado.

---

## Problemas comuns

- **A pasta `.github` não subiu.** No repositório, clique em **Add file** > **Create new file**. No nome, digite `.github/workflows/atualizar.yml` (as barras criam as pastas). Abra o arquivo `atualizar.yml` do zip no Bloco de Notas ou no TextEdit, copie tudo, cole no GitHub e clique em **Commit changes**.
- **X vermelho com "Não consegui gerar o token no Pipefy".** Algum dos três segredos está errado ou com espaço sobrando. Em Settings > Secrets, clique no lápis do segredo e cole de novo.
- **X vermelho com erro de permissão (Unauthorized / permission).** Falta o passo 1.8: a conta de serviço precisa ser membro do pipe 306826478.
- **X vermelho no final, na parte de "Publicar".** Falta o passo 3.4 (Read and write permissions).
- **O site mostra erro 404.** O Pages leva uns 2 minutos na primeira vez. Confira também o passo 4.3 e se o endereço tem o nome certo do repositório.
- **Aparece "Dados de exemplo" em vez de "Ao vivo do Pipefy".** O `dados.json` ainda não foi criado. Rode de novo o passo 4.6 e espere o ✓ verde.
- **Algum analista aparece como "Sem responsável".** O card está sem Responsável no Pipefy.

## Bom saber

- O site é público para quem tiver o link. Os títulos dos cards ficam ocultos: aparece só o número do card, como #123456. Para mostrar os títulos, troque `OCULTAR_TITULO: 'sim'` por `'nao'` no arquivo `.github/workflows/atualizar.yml`. Só faça isso se os títulos não tiverem nome de cliente.
- O analista vem do campo **Responsável** do card. Se houver mais de um, conta o primeiro.
- Fases reconhecidas pelo nome: Atualização de Portfólio, Em andamento Atualização, Entregue Atualização, Consolidação, Em andamento Consolidação e Entregue Consolidação. Se renomear fases no Pipefy, mantenha as palavras "andamento", "entregue", "atualização" e "consolidação".
- SLA: conta da entrada no backlog até a entrega, só em dias úteis (sem fins de semana e feriados cadastrados nos Ajustes).
- Para forçar uma atualização na hora, use **Actions** > **Run workflow**.
