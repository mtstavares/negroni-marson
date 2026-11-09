# Domínio próprio — Negroni Marson

Endereço principal configurado: **https://www.negronimarson.com.br**.
O endereço **https://negronimarson.com.br** deve redirecionar para ele. A hospedagem continua no repositório `mtstavares/negroni-marson`, pelo GitHub Pages.

## Situação em 09/11/2026

- Titular informou que o domínio já está registrado na sua conta e pago.
- Consulta DNS retornou os servidores `a.auto.dns.br` e `b.auto.dns.br` do Registro.br.
- A consulta ainda não retornou registros A para o domínio nem CNAME para `www`. Isso informa o estado do DNS consultado, não substitui a verificação de titularidade do GitHub.
- O GitHub já contém o `CNAME` com `www.negronimarson.com.br` (commit `3ca8540`). A configuração `siteUrl` e os metadados foram atualizados para o novo endereço.
- A imagem do painel do Registro.br mostra os quatro registros A, o CNAME e o TXT corretos. Na última consulta pelo resolvedor desta máquina, os registros ainda não retornaram; a consulta direta ao servidor autoritativo expirou. A propagação pública e o certificado HTTPS ainda precisam ser confirmados.
- Novas imagens fornecidas em `assets/` não foram alteradas.

## 1. Verificar a titularidade no GitHub

Abra https://github.com/settings/pages na conta **mtstavares**. Em **Add a domain**, informe **negronimarson.com.br**, sem `www`, sem protocolo e sem barra.

O GitHub fornecerá um registro TXT. Na administração do domínio no Registro.br, mantenha os DNS do Registro.br e abra **Configurar zona DNS**, no **Modo avançado**. Cadastre o nome e o valor TXT exibidos pelo GitHub. Normalmente, o nome relativo será `_github-pages-challenge-mtstavares`; use exatamente o que o painel apresentar. O valor é exclusivo da sua conta e precisa ser copiado do painel, não deste guia.

Quando o TXT estiver publicado, volte ao GitHub e clique em **Verify**. Mantenha esse TXT após a verificação. Esta é a verificação da conta, diferente do teste de DNS nas configurações do repositório.

## 2. Vincular o endereço ao repositório

Abra https://github.com/mtstavares/negroni-marson/settings/pages.

Mantenha a publicação da branch **main**, pasta **/(root)**. Em **Custom domain**, informe somente:

```text
www.negronimarson.com.br
```

Clique em **Save** antes de apontar os registros A/CNAME para o GitHub. O GitHub criará o arquivo `CNAME` na raiz da branch. A partir da ativação, o endereço antigo do Pages passa a redirecionar; faça esta etapa e a configuração DNS na mesma sessão.

## 3. Apontar o DNS no Registro.br

Na zona DNS em modo avançado, adicione as cinco entradas abaixo. Para a raiz, deixe o campo de nome vazio, de modo que o nome completo mostrado seja `negronimarson.com.br`. A notação `@` em outros provedores significa essa mesma raiz; não escreva `@` se o Registro.br exigir o campo vazio.

| Tipo | Nome relativo | Valor |
| --- | --- | --- |
| A | vazio (raiz) | 185.199.108.153 |
| A | vazio (raiz) | 185.199.109.153 |
| A | vazio (raiz) | 185.199.110.153 |
| A | vazio (raiz) | 185.199.111.153 |
| CNAME | www | mtstavares.github.io |

O destino do CNAME não leva `https://` nem `/negroni-marson`. Não use o modo de redirecionamento do Registro.br: o apontamento é feito pelos registros acima. Preserve o TXT de verificação. Se houver registros antigos para a raiz ou `www`, confira eventuais conflitos antes de salvar; registros MX/TXT de outros serviços não precisam ser removidos.

IPv6 é opcional. Se já houver registros AAAA para a raiz, eles também precisam apontar para o GitHub, em vez de outro servidor:

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

## 4. Atualizar o projeto e publicar

Sincronize o commit criado pelo GitHub para o CNAME. Antes de um `git pull --ff-only`, confira `git status`: se houver alterações locais, preserve-as e resolva a integração, sem usar reset ou sobrescrever arquivos.

No arquivo `site.config.json`, altere apenas `siteUrl` para:

```json
"siteUrl": "https://www.negronimarson.com.br"
```

O arquivo `CNAME` da raiz precisa conter uma única linha: `www.negronimarson.com.br`. O build o copia para `dist/`, mantendo compatibilidade com publicação pela raiz e por artefato.

Execute:

```powershell
npm.cmd run check
npm.cmd run build
```

Revise e envie o `index.html` regenerado, `site.config.json`, o `CNAME` e os demais arquivos dessa configuração. Os metadados canonical, `og:url` e a imagem social passam a usar a raiz do domínio novo, sem `/negroni-marson`. As imagens, CSS e scripts já usam caminhos relativos.

## 5. HTTPS e validação

Volte à configuração do Pages. Aguarde o teste de DNS e o provisionamento do certificado. Quando disponível, marque **Enforce HTTPS**. O GitHub informa até 24 horas para a propagação DNS e até 24 horas para a opção de HTTPS ficar disponível.

Verifique no PowerShell:

```powershell
Resolve-DnsName negronimarson.com.br -Type A
Resolve-DnsName www.negronimarson.com.br -Type CNAME
Resolve-DnsName _github-pages-challenge-mtstavares.negronimarson.com.br -Type TXT
```

Depois do certificado, confirme:

- `https://www.negronimarson.com.br/` abre a landing page sem erro de certificado.
- A versão sem `www` redireciona para a principal; HTTP redireciona para HTTPS.
- Imagens, fontes locais, scripts e estilos carregam; todos os botões de pedidos continuam apontando para o WhatsApp oficial.
- O código entregue contém canonical e URLs sociais do domínio novo.
- O workflow de publicação corresponde ao último commit e terminou com sucesso.

## Fontes oficiais

Consultadas em 09/11/2026:

- [GitHub: configurar domínio, registros DNS e redirecionamento](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub: verificar a titularidade por TXT](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Registro.br: características técnicas e edição de DNS](https://registro.br/tecnologia/caracteristicas-tecnicas/)

O painel autenticado do Registro.br e a geração do TXT no GitHub dependem do acesso do titular. Não é necessário compartilhar senha ou código de autenticação.
